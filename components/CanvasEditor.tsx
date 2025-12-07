import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Note, Stroke, Point } from '../types';
import { Eraser, Pen, Type, Sparkles, Loader2, Save, Undo, Redo, Bold, Italic, Underline } from 'lucide-react';
import { analyzeNoteContent } from '../services/geminiService';

interface CanvasEditorProps {
  activeNote: Note;
  onUpdateNote: (note: Note) => void;
  onSave?: () => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ activeNote, onUpdateNote, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'text'>('pen');
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>(activeNote.strokes || []);
  const [textContent, setTextContent] = useState(activeNote.content || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // History State
  const [history, setHistory] = useState<{strokes: Stroke[], content: string}[]>([
    { strokes: activeNote.strokes || [], content: activeNote.content || '' }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sync props to state and reset history if note changes
  useEffect(() => {
    setStrokes(activeNote.strokes || []);
    const newContent = activeNote.content || '';
    setTextContent(newContent);
    
    // Safely update innerHTML only if it differs to avoid cursor jumps during minor updates,
    // or if the note ID changed (completely new context).
    if (contentEditableRef.current) {
        if (contentEditableRef.current.innerHTML !== newContent) {
            contentEditableRef.current.innerHTML = newContent;
        }
    }

    // Only reset history if the ID changes to a different note (handled by parent passing different activeNote)
    // We check against the first history item's content/strokes loosely or just rely on parent key change logic if available.
    // For now, simple reset on mount/prop change is acceptable for this level of complexity.
    setHistory([{ strokes: activeNote.strokes || [], content: newContent }]);
    setHistoryIndex(0);
  }, [activeNote.id]);

  // Focus editor when tool changes to text
  useEffect(() => {
    if (tool === 'text' && contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, [tool]);

  // Helper to add state to history
  const addToHistory = (newStrokes: Stroke[], newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ strokes: newStrokes, content: newContent });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setStrokes(state.strokes);
      setTextContent(state.content);
      if (contentEditableRef.current) {
          contentEditableRef.current.innerHTML = state.content;
      }
      setHistoryIndex(newIndex);
      onUpdateNote({ ...activeNote, strokes: state.strokes, content: state.content });
    }
  }, [historyIndex, history, activeNote, onUpdateNote]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setStrokes(state.strokes);
      setTextContent(state.content);
      if (contentEditableRef.current) {
          contentEditableRef.current.innerHTML = state.content;
      }
      setHistoryIndex(newIndex);
      onUpdateNote({ ...activeNote, strokes: state.strokes, content: state.content });
    }
  }, [historyIndex, history, activeNote, onUpdateNote]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Redraw canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    if (canvas.width !== rect.width * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      
      if (stroke.color === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = stroke.width;
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    if (currentStroke.length > 1) {
      ctx.beginPath();
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
      }
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      ctx.stroke();
    }
    
    ctx.globalCompositeOperation = 'source-over';

  }, [strokes, currentStroke, tool]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool === 'text') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const point = { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top, 
      pressure: e.pressure 
    };
    setCurrentStroke([point]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const point = { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top, 
      pressure: e.pressure 
    };
    setCurrentStroke(prev => [...prev, point]);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        points: currentStroke,
        color: tool === 'eraser' ? 'eraser' : '#1e293b',
        width: tool === 'eraser' ? 20 : 2
      };
      const newStrokes = [...strokes, newStroke];
      setStrokes(newStrokes);
      onUpdateNote({ ...activeNote, strokes: newStrokes });
      addToHistory(newStrokes, textContent);
    }
    setCurrentStroke([]);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      const newContent = e.currentTarget.innerHTML;
      setTextContent(newContent);
  };

  const handleTextBlur = () => {
    // Save to history when text editing is done (on blur) if changes were made
    if (history[historyIndex] && history[historyIndex].content !== textContent) {
        addToHistory(strokes, textContent);
        onUpdateNote({ ...activeNote, content: textContent, strokes });
    }
  };

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    // Keep focus on editor after clicking button
    if (contentEditableRef.current) {
        contentEditableRef.current.focus();
    }
  };

  const handleAIAnalysis = async () => {
    // Use innerText to get plain text without HTML tags for analysis
    const plainText = contentEditableRef.current?.innerText || "";
    
    if (!plainText.trim() && strokes.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const promptText = plainText.trim() || "No typed text. (Note contains handwriting)";
      
      const result = await analyzeNoteContent(promptText);
      
      if (result) {
        onUpdateNote({
          ...activeNote,
          content: textContent, // Keep the HTML content
          strokes: strokes,
          summary: result.summary,
          tags: result.tags,
          actionItems: result.actionItems,
          entities: result.entities,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error(e);
      alert("AI Analysis Failed. Please check your API Key and console for details.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
      onUpdateNote({
          ...activeNote,
          content: textContent,
          strokes: strokes,
          updatedAt: new Date().toISOString()
      });
      if (onSave) onSave();
  }

  return (
    <div className="flex flex-col h-full bg-surface relative">
      <style>
        {`
          [data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #94a3b8;
            pointer-events: none;
            display: block; /* Ensure it appears */
          }
        `}
      </style>
      
      {/* Toolbar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 p-1.5 rounded-full flex gap-1 items-center">
             <button 
                onClick={handleUndo}
                disabled={historyIndex === 0}
                className={`p-2 rounded-full transition-colors ${historyIndex === 0 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'}`}
                title="Undo (Ctrl+Z)"
              >
                <Undo size={18} />
              </button>
              <button 
                onClick={handleRedo}
                disabled={historyIndex === history.length - 1}
                className={`p-2 rounded-full transition-colors ${historyIndex === history.length - 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'}`}
                title="Redo (Ctrl+Y)"
              >
                <Redo size={18} />
              </button>
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              <button 
                onClick={() => setTool('pen')}
                className={`p-2 rounded-full transition-colors ${tool === 'pen' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Pen size={18} />
              </button>
              <button 
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-full transition-colors ${tool === 'eraser' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Eraser size={18} />
              </button>
              <div className="w-px h-5 bg-slate-200 mx-1"></div>
              <button 
                onClick={() => setTool('text')}
                className={`p-2 rounded-full transition-colors ${tool === 'text' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Type size={18} />
              </button>

              {/* Formatting Toolbar */}
              {tool === 'text' && (
                <>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleFormat('bold')} 
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                  >
                    <Bold size={16} />
                  </button>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleFormat('italic')} 
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                  >
                    <Italic size={16} />
                  </button>
                  <button 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleFormat('underline')} 
                    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                  >
                    <Underline size={16} />
                  </button>
                </>
              )}
          </div>
        </div>

        <div className="flex gap-2 pointer-events-auto">
             <button 
                onClick={handleSave}
                className="bg-white text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-full font-medium shadow-sm border border-slate-200 flex items-center gap-2 transition-all hover:shadow-md"
            >
                <Save size={16} />
                <span>Save</span>
            </button>
            <button 
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                className="bg-indigo-600 text-white px-4 py-2 rounded-full font-medium shadow-md shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2 transition-all disabled:opacity-50"
            >
                {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>AI Analyze</span>
            </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden canvas-pattern">
        {/* Handwriting Layer */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`absolute inset-0 w-full h-full touch-none z-10 ${tool === 'text' ? 'pointer-events-none' : 'cursor-crosshair'}`}
        />
        
        {/* Rich Text Layer */}
        <div
          ref={contentEditableRef}
          contentEditable={tool === 'text'}
          onInput={handleInput}
          onBlur={handleTextBlur}
          data-placeholder="Type your notes here..."
          className={`absolute inset-0 w-full h-full bg-transparent p-12 pt-24 text-lg leading-relaxed outline-none text-slate-800 z-0 overflow-auto ${tool === 'text' ? 'pointer-events-auto cursor-text' : 'pointer-events-none'}`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>
    </div>
  );
};

export default CanvasEditor;