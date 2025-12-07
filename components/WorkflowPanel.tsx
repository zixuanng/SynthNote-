import React, { useState } from 'react';
import { WorkflowRule } from '../types';
import { Plus, Trash2, ArrowRight, CheckCircle2, Slack, Mail, Database, Calendar } from 'lucide-react';

interface WorkflowPanelProps {
  workflows: WorkflowRule[];
  onAddWorkflow: (rule: WorkflowRule) => void;
  onDeleteWorkflow: (id: string) => void;
  onToggleWorkflow: (id: string) => void;
}

const WorkflowPanel: React.FC<WorkflowPanelProps> = ({ workflows, onAddWorkflow, onDeleteWorkflow, onToggleWorkflow }) => {
  const [newTag, setNewTag] = useState('');
  const [newAction, setNewAction] = useState<WorkflowRule['actionType']>('SLACK');

  const handleAdd = () => {
    if (!newTag) return;
    const rule: WorkflowRule = {
      id: Date.now().toString(),
      name: `${newTag} Flow`,
      triggerTag: newTag.startsWith('#') ? newTag : `#${newTag}`,
      actionType: newAction,
      isActive: true
    };
    onAddWorkflow(rule);
    setNewTag('');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SLACK': return <Slack size={18} className="text-rose-500" />;
      case 'NOTION': return <Database size={18} className="text-slate-600" />;
      case 'EMAIL': return <Mail size={18} className="text-sky-500" />;
      case 'CALENDAR': return <Calendar size={18} className="text-orange-500" />;
      default: return <ArrowRight size={18} />;
    }
  };

  return (
    <div className="flex-1 bg-surface p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Workflow Bridge Center</h1>
          <p className="text-slate-500">Automate your post-meeting actions. Map tags to external tools.</p>
        </div>

        {/* Builder */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">Create New Bridge</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <span className="text-slate-400 font-medium">#</span>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="urgent"
                className="bg-transparent border-none outline-none w-full text-slate-800 placeholder-slate-400"
              />
            </div>
            
            <ArrowRight className="text-slate-300" />
            
            <div className="flex-1">
              <select
                value={newAction}
                onChange={(e) => setNewAction(e.target.value as any)}
                className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 outline-none focus:border-indigo-500"
              >
                <option value="SLACK">Send to Slack Channel</option>
                <option value="NOTION">Create Notion Page</option>
                <option value="CALENDAR">Add to Google Calendar</option>
                <option value="EMAIL">Email Summary</option>
              </select>
            </div>

            <button
              onClick={handleAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-200"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="grid gap-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className={`flex items-center justify-between p-5 rounded-xl border transition-all ${workflow.isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
              <div className="flex items-center gap-6">
                 <button 
                  onClick={() => onToggleWorkflow(workflow.id)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors relative ${workflow.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${workflow.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                
                <div className="flex items-center gap-3">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-mono text-sm border border-slate-200">
                    {workflow.triggerTag}
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    {getIcon(workflow.actionType)}
                    <span>{workflow.actionType} Action</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onDeleteWorkflow(workflow.id)}
                className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {workflows.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">No workflows active. Create one above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowPanel;