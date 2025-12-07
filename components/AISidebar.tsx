import React from 'react';
import { Note, ActionItem } from '../types';
import { CheckSquare, Hash, Calendar, ArrowRight, Bot } from 'lucide-react';

interface AISidebarProps {
  note: Note;
  onTriggerWorkflow: (tag: string) => void;
}

const AISidebar: React.FC<AISidebarProps> = ({ note, onTriggerWorkflow }) => {
  const hasAnalysis = note.summary || (note.actionItems && note.actionItems.length > 0);

  if (!hasAnalysis) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Bot className="text-slate-300" size={32} />
        </div>
        <h3 className="text-slate-800 font-semibold mb-2">Semantic Engine Ready</h3>
        <p className="text-slate-500 text-sm">
          Write or sketch your notes, then click "AI Analyze" to extract tasks, summaries, and workflows.
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <Bot size={18} className="text-indigo-600" />
          AI Insights
        </h2>
      </div>

      <div className="p-6 space-y-8">
        {/* Summary */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Summary</h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
            {note.summary}
          </p>
        </section>

        {/* Action Items */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between items-center">
            Action Items
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">{note.actionItems?.length || 0}</span>
          </h3>
          <div className="space-y-3">
            {note.actionItems?.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start group">
                <div className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center
                  ${item.priority === 'high' ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                >
                  {item.status === 'completed' && <div className="w-2 h-2 bg-indigo-500 rounded-sm" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-800 leading-snug">{item.description}</p>
                  {item.dueDate && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                      <Calendar size={10} />
                      <span>{item.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Smart Tags / Workflow Triggers */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Workflow Triggers</h3>
          <div className="flex flex-wrap gap-2">
            {note.tags?.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => onTriggerWorkflow(tag)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors group"
              >
                <Hash size={12} className="text-slate-400 group-hover:text-indigo-500" />
                {tag.replace('#', '')}
                <ArrowRight size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        </section>
        
        {/* Entities */}
        {note.entities && note.entities.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detected Entities</h3>
            <div className="flex flex-wrap gap-2">
               {note.entities.map((entity, idx) => (
                   <span key={idx} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                       {entity}
                   </span>
               ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AISidebar;