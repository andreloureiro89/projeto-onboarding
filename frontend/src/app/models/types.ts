export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type Company = {
  name: string;
  tagline: string;
  logo: string;
};

export type ProgressItem = {
  moduleId: string;
  completionPercent: number;
  status: 'in_progress' | 'completed';
};

export type ModuleSummary = {
  id: string;
  title: string;
  description: string;
  order: number;
  locked: boolean;
  progress: ProgressItem;
};

export type ContentItem = {
  id: string;
  title: string;
  type: 'text' | 'document' | 'video' | 'quiz';
  contentOrUrl: string;
  order: number;
  required: boolean;
  completed: boolean;
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
};

export type Quiz = {
  id: string;
  title: string;
  required: boolean;
  questions: QuizQuestion[];
};

export type ModuleDetail = {
  module: {
    id: string;
    title: string;
    description: string;
  };
  contents: ContentItem[];
  quiz: Quiz | null;
  progress: ProgressItem;
};

export type ProgressResponse = {
  globalPercent: number;
  modules: ProgressItem[];
};

export type Session = {
  token: string;
  user: User;
};

export type QuestionResult = {
  questionId: string;
  text: string;
  options: string[];
  selectedAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
};

export type QuizResult = {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  questions: QuestionResult[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  active: boolean;
};

export type ProgressViewItem = ProgressItem & {
  moduleTitle: string;
};

// ───── Admin CRUD types ─────

export type AdminContentItem = {
  id: string;
  moduleId: string;
  title: string;
  type: 'text' | 'document' | 'video';
  contentOrUrl: string;
  order: number;
  required: boolean;
};

export type AdminQuizQuestion = {
  id: string;
  quizId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type AdminQuiz = {
  id: string;
  moduleId: string;
  title: string;
  active: boolean;
  required: boolean;
  questions: AdminQuizQuestion[];
};

export type UserProgress = {
  user: AdminUser;
  globalPercent: number;
  modules: ProgressItem[];
};
