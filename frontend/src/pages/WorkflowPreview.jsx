import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, X, CheckCircle, Loader, GitMerge, Building2 } from 'lucide-react';

const WorkflowPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState('');

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
        // Refresh workflow to get the new execution logs
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

  // Sort steps by order
  const steps = (workflow.workflow_steps || []).sort((a, b) => a.step_order - b.step_order);

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
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 flex items-center transition-colors">
              <GitMerge className="mr-2 h-5 w-5 text-primary-500" />
              {workflow.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 transition-colors">{workflow.description}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReject}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-light-surface dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <X className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Reject & Delete
            </button>
            <button
              onClick={handleExecute}
              disabled={executing || (workflow.execution_logs && workflow.execution_logs.length > 0)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition"
            >
              {executing ? (
                <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
              ) : (
                <Play className="-ml-1 mr-2 h-5 w-5" />
              )}
              {(workflow.execution_logs && workflow.execution_logs.length > 0) ? "Already Executed" : "Approve & Execute"}
            </button>
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
                <li key={step.id || index} className="flex items-start">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-light-surface dark:bg-dark-surface border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-bold shadow-sm transition-colors">
                    {step.step_order}
                  </div>
                  <div className="ml-6 bg-light-surface dark:bg-dark-surface p-5 rounded-lg shadow-sm border border-gray-100 dark:border-dark-border flex-1 relative arrow-left transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">{step.title}</h5>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 transition-colors">
                        <Building2 className="w-3 h-3 mr-1" />
                        {step.department}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors">{step.action}</p>
                  </div>
                </li>
              ))}
            </ul>
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
