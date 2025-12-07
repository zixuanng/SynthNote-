export enum AppMode {
  EDIT = 'EDIT',
  WORKFLOW = 'WORKFLOW',
  RETRO = 'RETRO',
  SETTINGS = 'SETTINGS'
}

export enum NoteType {
  MEETING = 'MEETING',
  IDEA = 'IDEA',
  PLANNING = 'PLANNING'
}

export interface Point {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Text content
  strokes: Stroke[]; // Handwriting data
  createdAt: string;
  updatedAt: string;
  tags: string[];
  type: NoteType;
  // AI Extracted Data
  summary?: string;
  actionItems?: ActionItem[];
  entities?: string[];
}

export interface ActionItem {
  id: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate?: string;
  assignee?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface WorkflowRule {
  id: string;
  name: string;
  triggerTag: string;
  actionType: 'NOTION' | 'SLACK' | 'EMAIL' | 'CALENDAR';
  isActive: boolean;
}

// Chart Data Types
export interface ActivityData {
  date: string;
  notesCount: number;
  tasksCount: number;
}