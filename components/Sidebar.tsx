import React from 'react';
import { PenTool, Workflow, History, Settings, CloudLightning } from 'lucide-react';
import { AppMode } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { mode: AppMode.EDIT, icon: PenTool, label: 'Note' },
    { mode: AppMode.WORKFLOW, icon: Workflow, label: 'Flows' },
    { mode: AppMode.RETRO, icon: History, label: 'Retro' },
  ];

  return (
    <div className="w-20 bg-slate-900 flex flex-col items-center py-6 text-white shrink-0 z-20">
      <div className="mb-8 p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
        <CloudLightning size={28} />
      </div>
      
      <nav className="flex-1 flex flex-col gap-6 w-full px-2">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => setMode(item.mode)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 group
              ${currentMode === item.mode 
                ? 'bg-slate-800 text-indigo-400 border border-slate-700' 
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
          >
            <item.icon size={24} className={`mb-1 ${currentMode === item.mode ? 'stroke-2' : 'stroke-1.5'}`} />
            <span className="text-[10px] font-medium opacity-80">{item.label}</span>
          </button>
        ))}
      </nav>

      <button 
        onClick={() => setMode(AppMode.SETTINGS)}
        className={`mt-auto p-3 rounded-xl transition-colors ${currentMode === AppMode.SETTINGS ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
      >
        <Settings size={24} />
      </button>
    </div>
  );
};

export default Sidebar;