export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  profile?: UserProfile;
  streak?: UserStreak;
}

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
  last_activity_date?: string;
}

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  is_unlocked: boolean;
  unlocked_at?: string;
}

export interface StudyRoom {
  id: number;
  name: string;
  description?: string;
  subject?: string;
  color: string;
  icon: string;
  invite_code?: string;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  member_count: number;
  document_count: number;
  topic_count: number;
  topics?: RoomTopic[];
  members?: RoomMember[];
}

export interface RoomTopic {
  id: number;
  room_id: number;
  name: string;
  description?: string;
  order_index: number;
  created_at: string;
}

export interface RoomMember {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  joined_at: string;
}

export interface RoomChatMessage {
  id: number;
  room_id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export interface StudyDocument {
  id: number;
  title: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  status: 'processing' | 'ready' | 'failed';
  summary?: string;
  room_id?: number;
  topic_id?: number;
  uploaded_by_id: number;
  created_at: string;
  updated_at: string;
  chunk_count: number;
  chunks?: DocumentChunk[];
}

export interface DocumentChunk {
  id: number;
  chunk_index: number;
  content: string;
  page_number?: number;
  token_count: number;
}

export interface ChatSession {
  id: number;
  title: string;
  user_id: number;
  room_id?: number;
  document_id?: number;
  created_at: string;
  updated_at: string;
  last_message?: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: Array<{
    chunk_id?: number;
    document_id?: number;
    page_number?: number;
    excerpt: string;
  }>;
  created_at: string;
}

export interface StudyTask {
  id: number;
  user_id: number;
  study_plan_id?: number;
  room_id?: number;
  title: string;
  description?: string;
  subject?: string;
  day?: string;         // e.g. "Monday", "Tuesday" — set by AI planner
  day_offset?: number;  // 0=Monday … 6=Sunday
  scheduled_date?: string;
  start_time?: string;
  end_time?: string;
  estimated_minutes: number;
  actual_minutes: number;
  priority: 'high' | 'medium' | 'low';
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
  subject?: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
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
  today_progress_percentage: number;
  total_study_minutes_all_time: number;
  current_streak_days: number;
  longest_streak_days: number;
  tasks_completed_count: number;
  tasks_pending_count: number;
  completion_rate_percentage: number;
  deadlines_upcoming_count: number;
  total_xp: number;
  current_level: number;
  most_productive_subject: string;
  daily_stats_last_7_days: Array<{
    date: string;
    minutes: number;
    target_minutes: number;
  }>;
  subject_distribution: Array<{
    subject: string;
    minutes: number;
    color: string;
    percentage: number;
  }>;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

export interface FlashcardItem {
  front: string;
  back: string;
  category?: string;
}
