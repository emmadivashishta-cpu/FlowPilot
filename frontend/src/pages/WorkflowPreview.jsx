import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, X, CheckCircle, Loader, GitMerge, Building2, Edit3, Save, Plus, Trash2 } from 'lucide-react';

const WorkflowPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', steps: [] });

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workflows/${id}`);
        if (response.data.success) {
          setWorkflow(response.data.data);
        }
      } catch (err) {
        setError('Failed to load workflow details.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflow();
  }, [id]);

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workflows/${id}/execute`);
      if (response.data.success) {
        setExecutionResult(response.data);
        // Refresh workflow
        const wfResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workflows/${id}`);
        if (wfResponse.data.success) setWorkflow(wfResponse.data.data);
      }
    } catch (err) {
      alert('Execution failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setExecuting(false);
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to delete this generated workflow?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workflows/${id}`);
        navigate('/dashboard');
      } catch (err) {
        alert('Failed to delete workflow.');
      }
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      const steps = (workflow.workflow_steps || []).sort((a, b) => a.step_order - b.step_order).map(s => ({ ...s }));
      setEditForm({
        name: workflow.name,
        description: workflow.description,
        steps: steps
      });
    }
    setIsEditing(!isEditing);
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...editForm.steps];
    newSteps[index][field] = value;
    setEditForm({ ...editForm, steps: newSteps });
  };

  const handleAddStep = () => {
    setEditForm({
      ...editForm,
      steps: [...editForm.steps, { title: '', department: 'General', action: '' }]
    });
  };

  const handleRemoveStep = (index) => {
    const newSteps = [...editForm.steps];
    newSteps.splice(index, 1);
    setEditForm({ ...editForm, steps: newSteps });
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workflows/${id}`, editForm);
      if (response.data.success) {
        // Refresh workflow
        const wfResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workflows/${id}`);
        if (wfResponse.data.success) setWorkflow(wfResponse.data.data);
        setIsEditing(false);
      }
    } catch (err) {
      alert('Failed to save draft: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <div className="w-1/2 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 w-32 bg-gray-200 rounded"></div>
              <div className="h-10 w-40 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6 bg-gray-50 space-y-8">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-gray-200"></div>
              <div className="ml-6 flex-1 h-24 bg-white rounded-lg border border-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Workflow not found.'}</p>
      </div>
    );
  }

  const steps = isEditing ? editForm.steps : (workflow.workflow_steps || []).sort((a, b) => a.step_order - b.step_order);
  const isExecuted = workflow.execution_logs && workflow.execution_logs.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Execution Success Alert */}
      {executionResult && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md shadow-sm flex items-start">
          <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Execution Successful</h3>
            <p className="mt-1 text-sm text-green-700">
              The workflow "{workflow.name}" has been successfully executed and logged.
            </p>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-light-surface dark:bg-dark-surface shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border transition-colors">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div className="flex-1 w-full">
            {isEditing ? (
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-lg font-medium"
                />
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  rows="2"
                />
              </div>
            ) : (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 flex items-center transition-colors">
                  <GitMerge className="mr-2 h-5 w-5 text-primary-500" />
                  {workflow.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 transition-colors">{workflow.description}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap space-x-2 md:space-x-3 gap-y-2">
            {!isExecuted && !isEditing && (
              <button
                onClick={handleEditToggle}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-light-surface dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Edit3 className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
                Edit Draft
              </button>
            )}

            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition"
                >
                  {saving ? <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <Save className="-ml-1 mr-2 h-5 w-5" />}
                  Save Draft
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleReject}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-dark-bg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <X className="-ml-1 mr-2 h-5 w-5 text-red-500" />
                  Delete
                </button>
                <button
                  onClick={handleExecute}
                  disabled={executing || isExecuted}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition"
                >
                  {executing ? (
                    <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  ) : (
                    <Play className="-ml-1 mr-2 h-5 w-5" />
                  )}
                  {isExecuted ? "Already Executed" : "Approve & Execute"}
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Workflow Steps Visualization */}
        <div className="border-t border-gray-200 dark:border-dark-border px-4 py-5 sm:p-6 bg-gray-50 dark:bg-[#131b26] transition-colors">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-6 transition-colors">Workflow Steps Outline</h4>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute top-0 left-6 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700 z-0 transition-colors"></div>
            
            <ul className="space-y-8 relative z-10">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start group">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-light-surface dark:bg-dark-surface border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-bold shadow-sm transition-colors z-10">
                      {index + 1}
                    </div>
                    {isEditing && (
                      <button onClick={() => handleRemoveStep(index)} className="mt-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Step">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="ml-6 bg-light-surface dark:bg-dark-surface p-5 rounded-lg shadow-sm border border-gray-100 dark:border-dark-border flex-1 relative arrow-left transition-colors">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex gap-4">
                          <input 
                            type="text" 
                            value={step.title} 
                            placeholder="Step Title"
                            onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                            className="flex-1 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 text-sm font-bold"
                          />
                          <input 
                            type="text" 
                            value={step.department} 
                            placeholder="Department"
                            onChange={(e) => handleStepChange(index, 'department', e.target.value)}
                            className="w-32 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 text-sm"
                          />
                        </div>
                        <textarea 
                          value={step.action} 
                          placeholder="Action Details"
                          onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                          className="w-full bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-primary-500 text-sm"
                          rows="2"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">{step.title}</h5>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 transition-colors">
                            <Building2 className="w-3 h-3 mr-1" />
                            {step.department}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 transition-colors">{step.action}</p>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {isEditing && (
              <div className="mt-8 ml-16">
                <button 
                  onClick={handleAddStep}
                  className="inline-flex items-center px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition w-full justify-center"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                  Add New Step
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Execution Logs Section */}
      {workflow.execution_logs && workflow.execution_logs.length > 0 && (
        <div className="bg-light-surface dark:bg-dark-surface shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border transition-colors mt-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 transition-colors">Execution History</h3>
          </div>
          <div className="border-t border-gray-200 dark:border-dark-border transition-colors">
            <ul className="divide-y divide-gray-200 dark:divide-dark-border transition-colors">
              {workflow.execution_logs.map(log => (
                <li key={log.id} className="px-4 py-4 sm:px-6 text-sm text-gray-600 dark:text-gray-400 flex flex-col sm:flex-row justify-between sm:items-center transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100 mb-1 transition-colors">
                      Status: <span className="text-green-600 dark:text-green-400 uppercase">{log.status}</span>
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 italic transition-colors">{log.message || 'Workflow executed successfully.'}</span>
                  </div>
                  <span className="mt-2 sm:mt-0 text-gray-400 dark:text-gray-500 transition-colors">{new Date(log.executed_at || log.created_at || Date.now()).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .arrow-left::before {
          content: '';
          position: absolute;
          top: 18px;
          left: -8px;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-right: 8px solid #f4fcf9;
        }
        .dark .arrow-left::before {
          border-right-color: #1f2937;
        }
      `}} />
    </div>
  );
};

export default WorkflowPreview;
