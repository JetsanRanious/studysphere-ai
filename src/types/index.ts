export interface UserProfile {
  major: string;
  university: string;
  bio: string;
  daily_goal_minutes: number;
  break_interval_minutes: number;
  default_session_minutes: number;
  theme_preference: string;
  xp: number;
  level: number;
}

export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface User {
  id: number;
  google_id?: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  profile: UserProfile;
  streak: UserStreak;
}

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

export interface RoomMember {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  avatar_url: string;
  role: string;
  joined_at: string;
}

export interface RoomTopic {
  id: number;
  room_id: number;
  name: string;
  description?: string;
  order_index: number;
}

export interface StudyRoom {
  id: number;
  name: string;
  subject: string;
  description: string;
  color: string;
  icon: string;
  invite_code: string;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  members: RoomMember[];
  topics: RoomTopic[];
  topic_count?: number;
  document_count?: number;
}

export interface RoomChatMessage {
  id: number;
  room_id: number;
  user_id: number;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

export interface DocumentChunk {
  id: number;
  document_id: number;
  chunk_index: number;
  content: string;
  page_number: number;
  token_count: number;
}

export interface StudyDocument {
  id: number;
  title: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  status: string;
  summary: string;
  room_id?: number;
  topic_id?: number;
  uploaded_by_id: number;
  created_at: string;
  updated_at: string;
  chunks: DocumentChunk[];
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  created_at: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  room_id?: number;
  document_id?: number;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface StudyTask {
  id: number;
  user_id: number;
  study_plan_id?: number;
  room_id?: number;
  title: string;
  description?: string;
  subject: string;
  scheduled_date?: string;
  day?: string;
  day_offset?: number;
  start_time?: string;
  end_time?: string;
  estimated_minutes: number;
  actual_minutes?: number;
  priority: 'low' | 'medium' | 'high' | string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface Deadline {
  id: number;
  user_id: number;
  room_id?: number;
  title: string;
  description?: string;
  subject: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | string;
  is_completed: boolean;
  created_at: string;
}

export interface StudySessionRecord {
  id: number;
  user_id: number;
  subject: string;
  room_id?: number;
  topic_id?: number;
  duration_seconds: number;
  xp_earned: number;
  notes?: string;
  started_at: string;
  ended_at: string;
}

export interface AnalyticsOverview {
  total_study_minutes_today: number;
  daily_goal_minutes: number;
  weekly_study_minutes: number;
  total_study_hours: number;
  completed_tasks_count: number;
  pending_tasks_count: number;
  streak_days: number;
  current_xp: number;
  current_level: number;
  subject_breakdown: Array<{ subject: string; minutes: number; percentage: number }>;
  recent_sessions: StudySessionRecord[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

export interface FlashcardItem {
  id: number;
  front: string;
  back: string;
  category?: string;
}
