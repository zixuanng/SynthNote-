import React, { useEffect, useState } from 'react';
import { Note, ActivityData } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, BrainCircuit } from 'lucide-react';
import { generateRetroInsights } from '../services/geminiService';

interface RetroViewProps {
  notes: Note[];
}

const RetroView: React.FC<RetroViewProps> = ({ notes }) => {
  const [data, setData] = useState<ActivityData[]>([]);
  const [insight, setInsight] = useState<string>("Click 'Generate Strategic Review' to get AI insights on your week.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Transform notes to chart data (mock logic for demo)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const chartData = last7Days.map(date => {
      const dayNotes = notes.filter(n => n.updatedAt.startsWith(date));
      const tasksCount = dayNotes.reduce((acc, n) => acc + (n.actionItems?.length || 0), 0);
      return {
        date: date.slice(5), // MM-DD
        notesCount: dayNotes.length,
        tasksCount: tasksCount
      };
    });
    setData(chartData);
  }, [notes]);

  const handleGenerateInsight = async () => {
    setLoading(true);
    const recentNotes = notes.map(n => n.summary || n.content).filter(Boolean);
    if(recentNotes.length === 0) {
        setInsight("No sufficient note data to analyze.");
        setLoading(false);
        return;
    }
    const text = await generateRetroInsights(recentNotes);
    setInsight(text || "No insights available.");
    setLoading(false);
  }

  return (
    <div className="flex-1 bg-surface p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Space-Time Retro View</h1>
          <p className="text-slate-500">Visualize your thinking patterns and productivity velocity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <BrainCircuit size={20} />
              </div>
              <span className="text-slate-500 font-medium text-sm">Total Notes</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{notes.length}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <TrendingUp size={20} />
              </div>
              <span className="text-slate-500 font-medium text-sm">Action Items Extracted</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {notes.reduce((acc, n) => acc + (n.actionItems?.length || 0), 0)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Calendar size={20} />
              </div>
              <span className="text-slate-500 font-medium text-sm">Active Days</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{data.filter(d => d.notesCount > 0).length}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-80">
          <h3 className="text-slate-800 font-semibold mb-6">Productivity Velocity</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="tasksCount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
              <Area type="monotone" dataKey="notesCount" stroke="#cbd5e1" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500 blur-[100px] opacity-20 rounded-full"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <BrainCircuit className="text-indigo-400" />
                        AI Strategic Review
                    </h3>
                    <button 
                        onClick={handleGenerateInsight}
                        disabled={loading}
                        className="text-xs bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 px-3 py-1.5 rounded-full transition-colors"
                    >
                        {loading ? "Generating..." : "Generate Review"}
                    </button>
                </div>
                <div className="prose prose-invert max-w-none text-indigo-100/90 text-sm leading-relaxed whitespace-pre-wrap">
                    {insight}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RetroView;