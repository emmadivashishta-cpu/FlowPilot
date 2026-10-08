const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const { supabase } = require('../config/supabase');

/**
 * Generate a workflow using Gemini 1.5 Flash
 * POST /api/workflows/generate
 */
const generateWorkflow = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid natural language prompt is required.'
      });
    }

    const systemPrompt = `You are an expert AI workflow architect. Convert the user's natural language request into a structured step-by-step workflow.

Return STRICTLY a JSON object matching this exact structure:
{
  "workflowName": "String title for the workflow",
  "description": "String summary of what the workflow accomplishes",
  "steps": [
    {
      "step_order": 1,
      "title": "Short title of the step",
      "action": "Action to be performed",
      "department": "Department responsible (e.g. HR, Engineering, Sales, Finance, IT, Operations, Legal, Marketing)"
    }
  ]
}

Ensure all steps are logically ordered starting from step_order 1. Output MUST be strictly raw valid JSON only, without any backticks, codeblocks, or markdown surrounding it.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt.trim() }
      ],
      model: 'qwen/qwen3.8-27b',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });
    
    const responseText = chatCompletion.choices[0]?.message?.content || '';

    // Clean markdown syntax wrapping if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    }

    let workflowData;
    try {
      workflowData = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.error('[JSON Parse Error]:', cleanedText);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI output into valid JSON format.',
        rawOutput: responseText
      });
    }

    return res.status(200).json({
      success: true,
      data: workflowData
    });
  } catch (error) {
    console.error('[Groq Generate Workflow Exception]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate workflow using AI engine: ' + error.message
    });
  }
};

/**
 * Save a workflow and its steps into Supabase
 * POST /api/workflows
 */
const createWorkflow = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workflowName, description, steps } = req.body;

    if (!workflowName || !steps || !Array.isArray(steps)) {
      return res.status(400).json({
        success: false,
        message: 'Workflow name and an array of steps are required.'
      });
    }

    // Insert main workflow record into Supabase
    const { data: workflow, error: wfError } = await supabase
      .from('workflows')
      .insert([
        {
          user_id: userId,
          name: workflowName,
          description: description || '',
          status: 'active'
        }
      ])
      .select('*')
      .single();

    if (wfError || !workflow) {
      console.error('[Supabase Workflow Insert Error]:', wfError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create workflow: ' + (wfError ? wfError.message : 'Unknown database error')
      });
    }

    // Insert steps into Supabase
    const formattedSteps = steps.map((step, index) => ({
      workflow_id: workflow.id,
      step_order: step.step_order || index + 1,
      title: step.title || `Step ${index + 1}`,
      action: step.action || 'Execute step',
      department: step.department || 'General'
    }));

    const { data: insertedSteps, error: stepsError } = await supabase
      .from('workflow_steps')
      .insert(formattedSteps)
      .select('*');

    if (stepsError) {
      console.error('[Supabase Steps Insert Error]:', stepsError);
      return res.status(500).json({
        success: false,
        message: 'Workflow created, but failed to insert steps: ' + stepsError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Workflow created and saved successfully',
      data: {
        ...workflow,
        steps: insertedSteps
      }
    });
  } catch (error) {
    console.error('[Create Workflow Exception]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating workflow.'
    });
  }
};

/**
 * Get all workflows for the logged-in user
 * GET /api/workflows
 */
const getWorkflows = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: workflows, error: wfError } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_steps (*),
        execution_logs (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (wfError) {
      console.error('[Supabase Get Workflows Error]:', wfError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch workflows: ' + wfError.message
      });
    }

    return res.status(200).json({
      success: true,
      data: workflows || []
    });
  } catch (error) {
    console.error('[Get Workflows Exception]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching workflows.'
    });
  }
};

/**
 * Get single workflow by ID
 * GET /api/workflows/:id
 */
const getWorkflowById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: workflow, error: wfError } = await supabase
      .from('workflows')
      .select(`
        *,
        workflow_steps (*),
        execution_logs (*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (wfError || !workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('[Get Workflow By ID Exception]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching workflow.'
    });
  }
};

/**
 * Execute a workflow and log execution into Supabase
 * POST /api/workflows/:id/execute
 */
const executeWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify workflow belongs to user
    const { data: workflow, error: wfError } = await supabase
      .from('workflows')
      .select('*, workflow_steps(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (wfError || !workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found or access denied.'
      });
    }

    // Simulate execution step processing and log to DB
    const logDetails = {
      executed_by: req.user.email,
      total_steps: workflow.workflow_steps ? workflow.workflow_steps.length : 0,
      steps_executed: (workflow.workflow_steps || []).map(s => ({
        step_id: s.id,
        order: s.step_order,
        title: s.title,
        status: 'completed',
        timestamp: new Date().toISOString()
      }))
    };

    const { data: log, error: logError } = await supabase
      .from('execution_logs')
      .insert([
        {
          workflow_id: workflow.id,
          status: 'success',
          details: logDetails,
          message: `Workflow "${workflow.name}" executed successfully.`
        }
      ])
      .select('*')
      .single();

    if (logError) {
      console.error('[Execution Log Insert Error]:', logError);
      return res.status(500).json({
        success: false,
        message: 'Failed to record execution log: ' + logError.message
      });
    }

    // --- NEW: Send an actual email via Nodemailer ---
    try {
      require('dns').setDefaultResultOrder('ipv4first');
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER || 'your_email@gmail.com',
          pass: process.env.EMAIL_PASS || 'your_app_password'
        }
      });

      // Support Bulk Email Sending
      const recipients = ['premadityakadiyala@gmail.com', 'testrecipient@niat.com']; 

      const stepDetails = (workflow.workflow_steps || []).map(s => `- ${s.title} (${s.department})`).join('\n');
      const mailOptions = {
        from: '"Team NIAT" <no-reply@teamniat.com>',
        to: recipients.join(', '),
        subject: `New Workflow Executed: ${workflow.name}`,
        text: `Hello Team!\n\nA new workflow has just been executed in FlowPilot.\n\nWorkflow: ${workflow.name}\nDescription: ${workflow.description}\n\nSteps:\n${stepDetails}\n\nExecuted by: ${req.user.displayname || req.user.email}\nRole: ${req.user.role || 'Employee'}\n\nCheers,\nTeam NIAT`
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Success! Email sent to premadityakadiyala@gmail.com');
      log.message = `Workflow executed. Email notification sent to premadityakadiyala!`;

      await supabase.from('execution_logs').update({ message: log.message }).eq('id', log.id);

    } catch (emailErr) {
      console.error('Failed to send email:', emailErr.message);
      log.message = `Workflow executed successfully, but email failed (${emailErr.message}).`;
      await supabase.from('execution_logs').update({ message: log.message }).eq('id', log.id);
    }
    // ------------------------------------------------

    return res.status(200).json({
      success: true,
      message: log.message,
      executionLog: log
    });
  } catch (error) {
    console.error('[Execute Workflow Exception]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during workflow execution.'
    });
  }
};

/**
 * Delete a workflow
 * DELETE /api/workflows/:id
 */
const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error: delError } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (delError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete workflow: ' + delError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Workflow deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Workflow Exception]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting workflow.'
    });
  }
};

module.exports = {
  generateWorkflow,
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  executeWorkflow,
  deleteWorkflow
};
