import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Loader } from 'lucide-react';

const CreateWorkflow = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');

    try {
      // 1. Generate workflow via AI
      const generateResponse = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workflows/generate`, {
        prompt
      });

      if (generateResponse.data.success) {
        const generatedData = generateResponse.data.data;

        // 2. Save workflow to DB
        const saveResponse = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workflows`, generatedData);

        if (saveResponse.data.success) {
          const newWorkflowId = saveResponse.data.data.id;
          // 3. Redirect to preview
          navigate(`/workflows/${newWorkflowId}`);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate workflow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="bg-light-surface dark:bg-dark-surface shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border transition-colors">
        <div className="px-6 py-8 sm:p-10">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Sparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-4 transition-colors">
            AI Workflow Generator
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8 transition-colors">
            Describe the workflow you want to automate in plain English. FlowPilot's AI will design a complete, step-by-step automated process for you.
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 rounded mb-6">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="prompt" className="sr-only">
                Workflow Request
              </label>
              <textarea
                id="prompt"
                name="prompt"
                rows={6}
                className="shadow-sm block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-lg border border-gray-300 dark:border-dark-border rounded-md p-4 bg-light-surface dark:bg-dark-bg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                placeholder="e.g. When a new employee is hired, automatically send a welcome email, create an IT ticket for laptop setup, and schedule a 30-min HR orientation."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Generating AI Workflow...
                  </>
                ) : (
                  <>
                    Generate Workflow
                    <Sparkles className="ml-2 -mr-1 w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Predefined Templates Section */}
          <div className="mt-10 pt-8 border-t border-gray-200 dark:border-dark-border transition-colors">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase mb-4 text-center">
              Or Try a Predefined Task
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPrompt("Create a comprehensive onboarding workflow specifically tailored for new IT employees, including hardware provisioning, security clearances, and server access.")}
                className="inline-flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-light-surface dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none transition-colors"
              >
                Onboarding IT Employees
              </button>
              <button
                type="button"
                onClick={() => setPrompt("Design a simplified onboarding workflow for new interns. Focus on basic HR paperwork, introductory orientation, and pairing them with a mentor.")}
                className="inline-flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-light-surface dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none transition-colors"
              >
                Onboarding Interns
              </button>
              <button
                type="button"
                onClick={() => setPrompt("Create an engaging onboarding workflow for freshers / new graduates. Include company culture introduction, basic tool setup, and mandatory compliance training.")}
                className="inline-flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-light-surface dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none transition-colors"
              >
                Onboarding Freshers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkflow;
