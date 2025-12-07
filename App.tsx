import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CanvasEditor from './components/CanvasEditor';
import AISidebar from './components/AISidebar';
import WorkflowPanel from './components/WorkflowPanel';
import RetroView from './components/RetroView';
import { AppMode, Note, WorkflowRule, NoteType } from './types';

// Mock initial data
const INITIAL_NOTE: Note = {
  id: '1',
  title: 'Untitled Note',
  content: '',
  strokes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: [],
  type: NoteType.IDEA
};

const INITIAL_WORKFLOWS: WorkflowRule[] = [
  { id: '1', name: 'Urgent to Slack', triggerTag: '#urgent', actionType: 'SLACK', isActive: true },
  { id: '2', name: 'Meeting to Notion', triggerTag: '#meeting', actionType: 'NOTION', isActive: true }
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.EDIT);
  const [activeNote, setActiveNote] = useState<Note>(INITIAL_NOTE);
  const [notes, setNotes] = useState<Note[]>([INITIAL_NOTE]);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(INITIAL_WORKFLOWS);
  
  // Toast state
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleUpdateNote = (updatedNote: Note) => {
    setActiveNote(updatedNote);
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleTriggerWorkflow = (tag: string) => {
    const matchedRule = workflows.find(w => w.isActive && w.triggerTag === tag);
    if (matchedRule) {
      setToast({ 
        message: `Workflow Triggered: "${matchedRule.name}" executed via ${matchedRule.actionType}.`, 
        type: 'success' 
      });
    } else {
      setToast({ 
        message: `No active workflow found for tag ${tag}`, 
        type: 'info' 
      });
    }
  };

  const handleAddWorkflow = (rule: WorkflowRule) => {
    setWorkflows(prev => [...prev, rule]);
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  const handleToggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));
  };

  return (
    <HashRouter>
      <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans">
        <Sidebar currentMode={mode} setMode={setMode} />
        
        <main className="flex-1 flex overflow-hidden relative">
          {mode === AppMode.EDIT && (
            <>
              <div className="flex-1 h-full">
                <CanvasEditor 
                  activeNote={activeNote} 
                  onUpdateNote={handleUpdateNote} 
                  onSave={() => setToast({ message: 'Note saved successfully', type: 'success' })}
                />
              </div>
              <AISidebar note={activeNote} onTriggerWorkflow={handleTriggerWorkflow} />
            </>
          )}

          {mode === AppMode.WORKFLOW && (
            <WorkflowPanel 
              workflows={workflows}
              onAddWorkflow={handleAddWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
              onToggleWorkflow={handleToggleWorkflow}
            />
          )}

          {mode === AppMode.RETRO && (
             <RetroView notes={notes} />
          )}

          {mode === AppMode.SETTINGS && (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <p>Settings Panel (Placeholder)</p>
            </div>
          )}
          
          {/* Toast Notification */}
          {toast && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-bounce-in z-50">
              <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-400' : 'bg-blue-400'}`} />
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          )}
        </main>
      </div>
    </HashRouter>
  );
};

export default App;