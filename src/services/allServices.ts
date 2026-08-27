import api from './api';
import {
  User,
  StudyRoom,
  RoomTopic,
  RoomChatMessage,
  StudyDocument,
  ChatSession,
  ChatMessage,
  StudyTask,
  Deadline,
  StudySessionRecord,
  AnalyticsOverview,
  Achievement,
  QuizQuestion,
  FlashcardItem
} from '../types';

export const authService = {
  demoLogin: async (email?: string, full_name?: string) => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/demo-login', { email, full_name });
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/login', { email, password });
    return res.data;
  },
  register: async (email: string, password: string, full_name: string) => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/register', { email, password, full_name });
    return res.data;
  },
  getGoogleConfig: async () => {
    const res = await api.get<{ client_id: string }>('/auth/google-config');
    return res.data;
  },
  googleAuth: async (payload: { credential?: string; email?: string; full_name?: string; avatar_url?: string } | string) => {
    const body = typeof payload === 'string' ? { credential: payload } : payload;
    const res = await api.post<{ access_token: string; user: User }>('/auth/google', body);
    return res.data;
  },
  sendVerificationCode: async (email: string, full_name?: string) => {
    const res = await api.post<{ success: boolean; message: string; verification_code: string }>('/auth/send-verification-code', {
      email,
      full_name
    });
    return res.data;
  },
  verifyCode: async (email: string, code: string, full_name?: string) => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/verify-code', {
      email,
      code,
      full_name
    });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get<User>('/profile');
    return res.data;
  },
  getGoogleAuthUrl: async () => {
    const res = await api.get<{ url: string; client_id: string; redirect_uri: string }>('/auth/google/url');
    return res.data;
  },
  updateProfile: async (data: Partial<User['profile']> & { full_name?: string; avatar_url?: string }) => {
    const res = await api.put<User>('/users/profile', data);
    return res.data;
  },
  getAchievements: async () => {
    const res = await api.get<Achievement[]>('/users/achievements');
    return res.data;
  }
};

export const roomService = {
  getRooms: async () => {
    const res = await api.get<StudyRoom[]>('/rooms');
    return res.data;
  },
  getRoom: async (id: number) => {
    const res = await api.get<StudyRoom>(`/rooms/${id}`);
    return res.data;
  },
  createRoom: async (data: { name: string; description?: string; subject?: string; color?: string; icon?: string; initial_topics?: string[] }) => {
    const res = await api.post<StudyRoom>('/rooms', data);
    return res.data;
  },
  joinRoomByCode: async (invite_code: string) => {
    const res = await api.post<StudyRoom>('/rooms/join-by-code', { invite_code });
    return res.data;
  },
  updateRoom: async (id: number, data: Partial<StudyRoom>) => {
    const res = await api.put<StudyRoom>(`/rooms/${id}`, data);
    return res.data;
  },
  deleteRoom: async (id: number) => {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  },
  getRoomMessages: async (roomId: number) => {
    const res = await api.get<RoomChatMessage[]>(`/rooms/${roomId}/messages`);
    return res.data;
  },
  sendRoomMessage: async (roomId: number, content: string) => {
    const res = await api.post<RoomChatMessage>(`/rooms/${roomId}/messages`, { content });
    return res.data;
  },
  addTopic: async (roomId: number, name: string, description?: string) => {
    const res = await api.post<RoomTopic>(`/rooms/${roomId}/topics`, { name, description });
    return res.data;
  },
  deleteTopic: async (roomId: number, topicId: number) => {
    const res = await api.delete(`/rooms/${roomId}/topics/${topicId}`);
    return res.data;
  }
};

export const documentService = {
  getDocuments: async (roomId?: number, topicId?: number) => {
    const params: any = {};
    if (roomId) params.room_id = roomId;
    if (topicId) params.topic_id = topicId;
    const res = await api.get<StudyDocument[]>('/documents', { params });
    return res.data;
  },
  getDocument: async (id: number) => {
    const res = await api.get<StudyDocument>(`/documents/${id}`);
    return res.data;
  },
  uploadDocument: async (file: File, title?: string, roomId?: number, topicId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (roomId) formData.append('room_id', roomId.toString());
    if (topicId) formData.append('topic_id', topicId.toString());

    const res = await api.post<StudyDocument>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  deleteDocument: async (id: number) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  }
};

export const aiService = {
  chat: async (
    message: string,
    sessionId?: number,
    documentId?: number,
    roomId?: number,
    provider: string = 'auto',
    openaiApiKey?: string,
    openaiModel: string = 'gpt-4o',
    model: string = 'gemini-3.7-flash',
    persona: string = 'academic'
  ) => {
    const storedKey = openaiApiKey || localStorage.getItem('studysphere_openai_key') || undefined;
    const res = await api.post<{ response: string; session_id: number; sources: any[]; model_used: string; response_time_ms?: number }>('/ai/chat', {
      message,
      session_id: sessionId,
      document_id: documentId,
      room_id: roomId,
      provider,
      openai_api_key: storedKey,
      openai_model: openaiModel,
      model,
      persona
    });
    return res.data;
  },
  getChatSessions: async (roomId?: number, documentId?: number) => {
    const params: any = {};
    if (roomId) params.room_id = roomId;
    if (documentId) params.document_id = documentId;
    const res = await api.get<ChatSession[]>('/ai/chat/sessions', { params });
    return res.data;
  },
  getChatSessionDetail: async (sessionId: number) => {
    const res = await api.get<ChatSession>(`/ai/chat/sessions/${sessionId}`);
    return res.data;
  },
  summarize: async (documentId?: number, roomId?: number, summaryType: string = 'key_concepts') => {
    const res = await api.post<{ summary: string; document_title?: string; key_takeaways: string[] }>('/ai/summarize', {
      document_id: documentId,
      room_id: roomId,
      summary_type: summaryType
    });
    return res.data;
  },
  generateQuiz: async (documentId?: number, roomId?: number, numQuestions: number = 5) => {
    const res = await api.post<{ title: string; questions: QuizQuestion[]; total_questions: number }>('/ai/quiz', {
      document_id: documentId,
      room_id: roomId,
      num_questions: numQuestions
    });
    return res.data;
  },
  generateFlashcards: async (documentId?: number, roomId?: number, numCards: number = 6) => {
    const res = await api.post<{ cards: FlashcardItem[] }>('/ai/flashcards', {
      document_id: documentId,
      room_id: roomId,
      num_cards: numCards
    });
    return res.data;
  },
  generateStudyPlan: async (prompt: string, availableDailyHours: number = 4.0) => {
    const openai_api_key = localStorage.getItem('studysphere_openai_key') || undefined;
    const openai_model = localStorage.getItem('studysphere_openai_model') || 'gpt-4o';
    
    const res = await api.post<any>('/ai/study-plan', {
      prompt,
      available_daily_hours: availableDailyHours,
      openai_api_key,
      openai_model
    });
    return res.data;
  },
  getRecommendation: async () => {
    const res = await api.get<{ headline: string; recommendation: string; suggested_subject?: string; suggested_action: string; priority_level: string }>('/ai/recommendations');
    return res.data;
  }
};

export const taskService = {
  getTasks: async (subject?: string, roomId?: number, completed?: boolean) => {
    const params: any = {};
    if (subject) params.subject = subject;
    if (roomId) params.room_id = roomId;
    if (completed !== undefined) params.completed = completed;
    const res = await api.get<StudyTask[]>('/tasks', { params });
    return res.data;
  },
  createTask: async (data: Partial<StudyTask>) => {
    const res = await api.post<StudyTask>('/tasks', data);
    return res.data;
  },
  updateTask: async (id: number, data: Partial<StudyTask>) => {
    const res = await api.put<StudyTask>(`/tasks/${id}`, data);
    return res.data;
  },
  deleteTask: async (id: number) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
  getDeadlines: async () => {
    const res = await api.get<Deadline[]>('/deadlines');
    return res.data;
  },
  createDeadline: async (data: Partial<Deadline>) => {
    const res = await api.post<Deadline>('/deadlines', data);
    return res.data;
  },
  updateDeadline: async (id: number, data: Partial<Deadline>) => {
    const res = await api.put<Deadline>(`/deadlines/${id}`, data);
    return res.data;
  },
  deleteDeadline: async (id: number) => {
    const res = await api.delete(`/deadlines/${id}`);
    return res.data;
  }
};

export const sessionService = {
  getSessions: async () => {
    const res = await api.get<StudySessionRecord[]>('/study-sessions');
    return res.data;
  },
  recordSession: async (data: { subject: string; duration_seconds: number; notes?: string; started_at: string; ended_at: string; room_id?: number; topic_id?: number }) => {
    const res = await api.post<StudySessionRecord>('/study-sessions', data);
    return res.data;
  },
  recordBreak: async (durationSeconds: number, breakType: string = 'eye-rest', startedAt: string, endedAt: string) => {
    const res = await api.post('/study-sessions/breaks', {
      duration_seconds: durationSeconds,
      break_type: breakType,
      started_at: startedAt,
      ended_at: endedAt
    });
    return res.data;
  }
};

export const gameService = {
  recordScore: async (gameType: string, score: number, difficulty: string = 'normal', result: string = 'win') => {
    const res = await api.post('/games/scores', { game_type: gameType, score, difficulty, result });
    return res.data;
  },
  generateSudoku: async (difficulty: string = 'medium') => {
    const res = await api.post<{ initial_board: number[][]; solution: number[][]; difficulty: string }>('/games/sudoku/generate', { difficulty });
    return res.data;
  },
  getSudokuHint: async (board: number[][], initialBoard: number[][]) => {
    const res = await api.post<{ row: number; col: number; value: number; technique: string; explanation: string }>('/games/sudoku/hint', {
      board,
      initial_board: initialBoard
    });
    return res.data;
  }
};

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get<AnalyticsOverview>('/analytics');
    return res.data;
  }
};
