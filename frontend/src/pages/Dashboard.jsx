import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Eye, Plus, Loader, ChevronDown } from 'lucide-react';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-light-surface dark:bg-dark-surface shadow-lg rounded-xl overflow-hidden sm:rounded-xl border border-gray-100 dark:border-dark-border transition-colors">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center p-6 text-left focus:outline-none cursor-pointer"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 transition-colors pr-4">{question}</h3>
        <div className={`flex-shrink-0 p-2 rounded-full bg-gray-100 dark:bg-gray-800 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-300" />
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-6 pt-2">
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workflows`);
        if (response.data.success) {
          setWorkflows(response.data.data);
        }
      } catch (err) {
        setError('Failed to load workflows. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Analytics */}
        <div className="bg-light-surface dark:bg-dark-surface shadow sm:rounded-lg mb-8 h-40"></div>
        
        {/* Skeleton Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>

        {/* Skeleton List */}
        <div className="bg-light-surface dark:bg-dark-surface shadow sm:rounded-md overflow-hidden space-y-4 p-4">
          <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
          <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
          <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      <div className="bg-light-surface dark:bg-dark-surface shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border transition-colors mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors">Analytics & ROI Dashboard</h3>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="px-4 py-5 bg-gray-50 dark:bg-dark-bg shadow-sm rounded-lg overflow-hidden sm:p-6 border border-gray-100 dark:border-gray-700 transition-colors">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Workflows</dt>
              <dd className="mt-1 text-3xl font-semibold text-primary-600 dark:text-primary-400">{workflows.length}</dd>
            </div>
            <div className="px-4 py-5 bg-gray-50 dark:bg-dark-bg shadow-sm rounded-lg overflow-hidden sm:p-6 border border-gray-100 dark:border-gray-700 transition-colors">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Executions</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600 dark:text-green-400">
                {workflows.reduce((acc, wf) => acc + (wf.execution_logs?.length || 0), 0)}
              </dd>
            </div>
            <div className="px-4 py-5 bg-gray-50 dark:bg-dark-bg shadow-sm rounded-lg overflow-hidden sm:p-6 border border-gray-100 dark:border-gray-700 transition-colors">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Steps Automated</dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600 dark:text-blue-400">
                {workflows.reduce((acc, wf) => acc + (wf.workflow_steps?.length || 0), 0)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Your Workflows</h1>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          New Workflow
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {workflows.length === 0 && !error ? (
        <div className="text-center py-12 bg-light-surface dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border transition-colors">
          <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors">You haven't created any workflows yet.</p>
          <Link
            to="/create"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Create your first workflow &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-light-surface dark:bg-dark-surface shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-dark-border transition-colors">
          <ul className="divide-y divide-gray-200 dark:divide-dark-border">
            {workflows.map((workflow) => (
              <li key={workflow.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                        {workflow.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {workflow.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/workflows/${workflow.id}`}
                        className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-light-surface dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={async () => {
                          try {
                            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/workflows/${workflow.id}/execute`);
                            alert('Workflow executed successfully!');
                          } catch (err) {
                            alert('Execution failed.');
                          }
                        }}
                        className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        title="Execute Workflow"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {workflow.workflow_steps?.length || 0} Steps
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Created on {new Date(workflow.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* FAQs Section */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-border transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 transition-colors">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <FaqItem 
            question="How do I automate onboarding for different types of employees?" 
            answer="When creating a new workflow, you can simply click one of the predefined templates (IT Employees, Interns, or Freshers) or type a natural language prompt describing the exact role. The AI will instantly generate the appropriate steps!" 
          />
          <FaqItem 
            question="What happens when I click &quot;Approve & Execute&quot;?" 
            answer="FlowPilot executes the workflow by locking the steps in our secure execution history. Currently, it automatically triggers an email notification alerting you (or your configured team member) that the workflow has been kicked off." 
          />
          <FaqItem 
            question="Can I execute a workflow multiple times?" 
            answer="Once a specific workflow run is approved and executed, the button is disabled to prevent duplicate executions. If you need to run the same process again, simply generate a new workflow from the prompt!" 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
