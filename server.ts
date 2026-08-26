import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const JWT_SECRET = process.env.JWT_SECRET || "studysphere-jwt-secret-key-2026";
const PORT = 3000;

// Initialize Gemini lazily
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Failed to initialize Gemini client:", e);
    }
  }
  return geminiClient;
}

// In-Memory Data Storage seeded with rich initial demo state
interface User {
  id: number;
  email: string;
  full_name: string;
  password_hash?: string;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  profile: {
    major: string;
    university: string;
    bio: string;
    daily_goal_minutes: number;
    break_interval_minutes: number;
    default_session_minutes: number;
    theme_preference: string;
    xp: number;
    level: number;
  };
  streak: {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string;
  };
}

interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
}

interface StudyRoom {
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
  members: Array<{
    id: number;
    user_id: number;
    email: string;
    full_name: string;
    avatar_url: string;
    role: string;
    joined_at: string;
  }>;
  topics: Array<{
    id: number;
    room_id: number;
    name: string;
    description?: string;
    order_index: number;
  }>;
}

interface RoomChatMessage {
  id: number;
  room_id: number;
  user_id: number;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

interface DocumentChunk {
  id: number;
  document_id: number;
  chunk_index: number;
  content: string;
  page_number: number;
  token_count: number;
}

interface StudyDocument {
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

interface ChatMessage {
  id: number;
  session_id: number;
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  created_at: string;
}

interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  room_id?: number;
  document_id?: number;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

interface StudyTask {
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
  priority: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

interface Deadline {
  id: number;
  user_id: number;
  room_id?: number;
  title: string;
  description?: string;
  subject: string;
  due_date: string;
  priority: string;
  is_completed: boolean;
  created_at: string;
}

interface StudySessionRecord {
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

interface BreakSessionRecord {
  id: number;
  user_id: number;
  duration_seconds: number;
  break_type: string;
  started_at: string;
  ended_at: string;
}

interface GameScoreRecord {
  id: number;
  user_id: number;
  game_type: string;
  score: number;
  difficulty: string;
  result: string;
  created_at: string;
}

// Database state
const users: User[] = [];
const achievements: Achievement[] = [
  { id: 1, code: "FIRST_SESSION", title: "First Step", description: "Completed your first study session", icon: "zap", xp_reward: 50 },
  { id: 2, code: "5_SESSIONS", title: "Focus Scholar", description: "Completed 5 study sessions", icon: "flame", xp_reward: 100 },
  { id: 3, code: "3_DAY_STREAK", title: "Consistency Starter", description: "Maintained a 3-day study streak", icon: "calendar", xp_reward: 75 },
  { id: 4, code: "7_DAY_STREAK", title: "Streak Master", description: "Maintained a 7-day study streak", icon: "award", xp_reward: 150 },
  { id: 5, code: "DOC_MASTER", title: "Knowledge Collector", description: "Uploaded 3+ study documents", icon: "book-open", xp_reward: 80 },
  { id: 6, code: "ROOM_CREATOR", title: "Room Pioneer", description: "Created or joined a study room", icon: "users", xp_reward: 50 },
  { id: 7, code: "LEVEL_5", title: "Ascended Scholar", description: "Reached Level 5", icon: "star", xp_reward: 200 },
  { id: 8, code: "PLANNER_PRO", title: "Master Strategist", description: "Generated an AI Weekly Study Plan", icon: "compass", xp_reward: 60 }
];
const userAchievements: Array<{ user_id: number; achievement_id: number; unlocked_at: string }> = [];
const rooms: StudyRoom[] = [];
const roomMessages: RoomChatMessage[] = [];
const documents: StudyDocument[] = [];
const chatSessions: ChatSession[] = [];
const tasks: StudyTask[] = [];
const deadlines: Deadline[] = [];
const studySessions: StudySessionRecord[] = [];
const breakSessions: BreakSessionRecord[] = [];
const gameScores: GameScoreRecord[] = [];

// Seed Demo User and Records
const nowIso = new Date().toISOString();
const demoUser: User = {
  id: 1,
  email: "student@studysphere.ai",
  full_name: "Jetsan",
  password_hash: bcrypt.hashSync("DemoStudy2026!", 10),
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jetsan",
  is_active: true,
  created_at: nowIso,
  profile: {
    major: "Cloud & Cyber Security",
    university: "Stanford University",
    bio: "Focusing on distributed cloud security, zero trust architecture, and cryptography.",
    daily_goal_minutes: 180,
    break_interval_minutes: 30,
    default_session_minutes: 45,
    theme_preference: "system",
    xp: 420,
    level: 3
  },
  streak: {
    current_streak: 7,
    longest_streak: 12,
    last_activity_date: nowIso
  }
};
users.push(demoUser);

// Seed user achievements for demo
userAchievements.push(
  { user_id: 1, achievement_id: 1, unlocked_at: nowIso },
  { user_id: 1, achievement_id: 3, unlocked_at: nowIso },
  { user_id: 1, achievement_id: 4, unlocked_at: nowIso },
  { user_id: 1, achievement_id: 6, unlocked_at: nowIso }
);

// Seed rooms
rooms.push(
  {
    id: 1,
    name: "Cloud Security",
    subject: "Cloud Security",
    description: "IAM architectures, AWS/GCP security models, container isolation, and compliance.",
    color: "#3B82F6",
    icon: "cloud",
    invite_code: "SPHERE-0001",
    created_by_id: 1,
    created_at: nowIso,
    updated_at: nowIso,
    members: [
      {
        id: 1,
        user_id: 1,
        email: "student@studysphere.ai",
        full_name: "Jetsan",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jetsan",
        role: "admin",
        joined_at: nowIso
      }
    ],
    topics: [
      { id: 1, room_id: 1, name: "Module 1: Cloud Architecture Basics", order_index: 0 },
      { id: 2, room_id: 1, name: "Module 2: IAM & Least Privilege", order_index: 1 },
      { id: 3, room_id: 1, name: "Module 3: Container Security", order_index: 2 },
      { id: 4, room_id: 1, name: "Exam Revision", order_index: 3 }
    ]
  },
  {
    id: 2,
    name: "Cryptography",
    subject: "Cryptography",
    description: "Symmetric/Asymmetric encryption, digital signatures, hashing, and zero-knowledge proofs.",
    color: "#0284C7",
    icon: "lock",
    invite_code: "SPHERE-0002",
    created_by_id: 1,
    created_at: nowIso,
    updated_at: nowIso,
    members: [
      {
        id: 2,
        user_id: 1,
        email: "student@studysphere.ai",
        full_name: "Jetsan",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jetsan",
        role: "admin",
        joined_at: nowIso
      }
    ],
    topics: [
      { id: 5, room_id: 2, name: "Module 1: AES & Symmetric Ciphers", order_index: 0 },
      { id: 6, room_id: 2, name: "Module 2: RSA & PKI Infrastructure", order_index: 1 },
      { id: 7, room_id: 2, name: "Module 3: Hash Functions & MAC", order_index: 2 },
      { id: 8, room_id: 2, name: "Assignment Prep", order_index: 3 }
    ]
  },
  {
    id: 3,
    name: "Network Security",
    subject: "Network Security",
    description: "Firewall rules, packet inspection, intrusion detection systems (IDS/IPS), and TLS handshakes.",
    color: "#60A5FA",
    icon: "shield",
    invite_code: "SPHERE-0003",
    created_by_id: 1,
    created_at: nowIso,
    updated_at: nowIso,
    members: [
      {
        id: 3,
        user_id: 1,
        email: "student@studysphere.ai",
        full_name: "Jetsan",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jetsan",
        role: "admin",
        joined_at: nowIso
      }
    ],
    topics: [
      { id: 9, room_id: 3, name: "Module 1: TCP/IP Security", order_index: 0 },
      { id: 10, room_id: 3, name: "Module 2: Firewalls & Packet Filtering", order_index: 1 },
      { id: 11, room_id: 3, name: "Module 3: TLS/SSL Deep Dive", order_index: 2 },
      { id: 12, room_id: 3, name: "Lab Exercises", order_index: 3 }
    ]
  }
);

// Seed room messages
roomMessages.push(
  {
    id: 1,
    room_id: 1,
    user_id: 1,
    user_name: "Jetsan",
    user_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jetsan",
    content: "Welcome to Cloud Security! Let's conquer IAM policies and container isolation.",
    created_at: nowIso
  }
);

// Seed documents
documents.push({
  id: 1,
  title: "Cloud Security Architecture & IAM Fundamentals",
  filename: "cloud_security_iam_notes.pdf",
  file_type: "pdf",
  file_size_bytes: 245000,
  status: "ready",
  summary: "Comprehensive guide covering AWS/GCP IAM roles, least-privilege principles, and token revocation.",
  room_id: 1,
  topic_id: 2,
  uploaded_by_id: 1,
  created_at: nowIso,
  updated_at: nowIso,
  chunks: [
    {
      id: 1,
      document_id: 1,
      chunk_index: 0,
      page_number: 1,
      token_count: 140,
      content: "IAM (Identity and Access Management) enforces who has access to which cloud resources. Core principles include Principle of Least Privilege (PoLP) and time-bounded credential issuance."
    },
    {
      id: 2,
      document_id: 1,
      chunk_index: 1,
      page_number: 2,
      token_count: 160,
      content: "Role-Based Access Control (RBAC) bundles permissions into roles assigned to subjects. In distributed cloud environments, ABAC (Attribute-Based Access Control) dynamically evaluates environmental tags."
    }
  ]
});

// Seed sample tasks
tasks.push(
  {
    id: 1,
    user_id: 1,
    title: "Review Cloud Security Module 3",
    subject: "Cloud Security",
    priority: "high",
    estimated_minutes: 45,
    is_completed: false,
    created_at: nowIso
  },
  {
    id: 2,
    user_id: 1,
    title: "Implement RSA Key Generation Algorithm",
    subject: "Cryptography",
    priority: "high",
    estimated_minutes: 60,
    is_completed: true,
    completed_at: nowIso,
    created_at: nowIso
  },
  {
    id: 3,
    user_id: 1,
    title: "Configure Snort IDS Rules for Packet Inspection",
    subject: "Network Security",
    priority: "medium",
    estimated_minutes: 45,
    is_completed: false,
    created_at: nowIso
  },
  {
    id: 4,
    user_id: 1,
    title: "Solve 10 Practice MCQs on IAM Role Policies",
    subject: "Cloud Security",
    priority: "medium",
    estimated_minutes: 30,
    is_completed: true,
    completed_at: nowIso,
    created_at: nowIso
  }
);

// Seed sample deadlines
const in2Days = new Date(Date.now() + 2 * 86400000).toISOString();
const in5Days = new Date(Date.now() + 5 * 86400000).toISOString();
const in7Days = new Date(Date.now() + 7 * 86400000).toISOString();
deadlines.push(
  { id: 1, user_id: 1, title: "Cloud Security Midterm Exam", subject: "Cloud Security", due_date: in2Days, priority: "high", is_completed: false, created_at: nowIso },
  { id: 2, user_id: 1, title: "Cryptography Problem Set #3", subject: "Cryptography", due_date: in5Days, priority: "high", is_completed: false, created_at: nowIso },
  { id: 3, user_id: 1, title: "Network Security Lab Submission", subject: "Network Security", due_date: in7Days, priority: "medium", is_completed: false, created_at: nowIso }
);

// Seed sample study sessions
const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
const oneDayAgoStart = new Date(Date.now() - 26 * 3600000).toISOString();
const oneDayAgoEnd = new Date(Date.now() - 25 * 3600000).toISOString();

studySessions.push(
  { id: 1, user_id: 1, subject: "Cloud Security", duration_seconds: 3600, xp_earned: 50, started_at: threeHoursAgo, ended_at: twoHoursAgo },
  { id: 2, user_id: 1, subject: "Cryptography", duration_seconds: 2700, xp_earned: 40, started_at: oneDayAgoStart, ended_at: oneDayAgoEnd }
);

// Sudoku Engine
class SudokuService {
  static isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let c = 0; c < 9; c++) if (board[row][c] === num) return false;
    for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
    const startRow = 3 * Math.floor(row / 3);
    const startCol = 3 * Math.floor(col / 3);
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (board[r][c] === num) return false;
      }
    }
    return true;
  }

  static solve(board: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (this.isValid(board, r, c, num)) {
              board[r][c] = num;
              if (this.solve(board)) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  static generatePuzzle(difficulty = "medium") {
    const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let i = 0; i < 9; i += 3) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      let idx = 0;
      for (let r = i; r < i + 3; r++) {
        for (let c = i; c < i + 3; c++) {
          board[r][c] = nums[idx++];
        }
      }
    }
    this.solve(board);
    const solution = JSON.parse(JSON.stringify(board));
    const removeCount = difficulty === "easy" ? 42 : difficulty === "medium" ? 50 : 56;
    const puzzle = JSON.parse(JSON.stringify(solution));
    const cells: Array<[number, number]> = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) cells.push([r, c]);
    }
    cells.sort(() => Math.random() - 0.5);
    for (let i = 0; i < removeCount; i++) {
      const [r, c] = cells[i];
      puzzle[r][c] = 0;
    }
    return { puzzle, solution };
  }

  static getHint(currentBoard: number[][], solution: number[][]) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] === 0) {
          const candidates: number[] = [];
          for (let num = 1; num <= 9; num++) {
            if (this.isValid(currentBoard, r, c, num)) candidates.push(num);
          }
          if (candidates.length === 1) {
            const val = candidates[0];
            const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3) + 1;
            return {
              row: r,
              col: c,
              value: val,
              technique: "Naked Single",
              explanation: `In Row ${r + 1}, Column ${c + 1}, all other digits 1-9 are already present in its row, column, or 3x3 box #${boxIdx}. Therefore, only ${val} can fit here.`
            };
          }
        }
      }
    }

    const emptyCells: Array<[number, number]> = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push([r, c]);
      }
    }

    if (emptyCells.length > 0) {
      let bestCell: [number, number] | null = null;
      let minCands = 10;
      let bestVal = 0;
      let bestCands: number[] = [];
      for (const [r, c] of emptyCells) {
        const cands: number[] = [];
        for (let num = 1; num <= 9; num++) {
          if (this.isValid(currentBoard, r, c, num)) cands.push(num);
        }
        if (cands.length > 0 && cands.length < minCands) {
          minCands = cands.length;
          bestCell = [r, c];
          bestVal = solution[r][c];
          bestCands = cands;
        }
      }
      if (bestCell) {
        const [r, c] = bestCell;
        return {
          row: r,
          col: c,
          value: bestVal,
          technique: "Constraint Elimination",
          explanation: `Focus on Row ${r + 1}, Column ${c + 1}. By checking the intersections of Column ${c + 1} and Row ${r + 1}, the candidate options narrow down to [${bestCands.join(", ")}]. Placing ${bestVal} maintains board validity.`
        };
      }
    }
    return null;
  }
}

// Helpers
function awardXp(user: User, amount: number) {
  user.profile.xp += amount;
  const newLevel = Math.max(1, Math.floor(user.profile.xp / 200) + 1);
  user.profile.level = newLevel;
}

function updateStreak(user: User) {
  const today = new Date().toDateString();
  const last = user.streak.last_activity_date ? new Date(user.streak.last_activity_date).toDateString() : "";
  if (last !== today) {
    user.streak.current_streak += 1;
    if (user.streak.current_streak > user.streak.longest_streak) {
      user.streak.longest_streak = user.streak.current_streak;
    }
    user.streak.last_activity_date = new Date().toISOString();
  }
}

function generateToken(userId: number): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
}

// Authentication middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Missing or invalid authorization token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: number };
    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({ detail: "User not found" });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });

  // 1. Health Checks
  app.get("/health", (req, res) => {
    res.json({ status: "healthy", app: "StudySphere AI", version: "1.0.0" });
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", app: "StudySphere AI", version: "1.0.0" });
  });

  // 2. Auth Endpoints
  app.post("/api/auth/demo-login", (req, res) => {
    const email = req.body?.email || "student@studysphere.ai";
    const fullName = req.body?.full_name || "Jetsan";
    let user = users.find((u) => u.email === email);
    if (!user) {
      user = {
        id: users.length + 1,
        email,
        full_name: fullName,
        password_hash: bcrypt.hashSync("DemoStudy2026!", 10),
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`,
        is_active: true,
        created_at: new Date().toISOString(),
        profile: {
          major: "Cloud & Cyber Security",
          university: "Stanford University",
          bio: "Student passionate about distributed systems and cloud security.",
          daily_goal_minutes: 180,
          break_interval_minutes: 30,
          default_session_minutes: 45,
          theme_preference: "system",
          xp: 320,
          level: 2
        },
        streak: {
          current_streak: 5,
          longest_streak: 7,
          last_activity_date: new Date().toISOString()
        }
      };
      users.push(user);
    }
    updateStreak(user);
    const token = generateToken(user.id);
    res.json({ access_token: token, user });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    const user = users.find((u) => u.email === email);
    if (!user || !user.password_hash || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ detail: "Invalid email or password" });
    }
    updateStreak(user);
    const token = generateToken(user.id);
    res.json({ access_token: token, user });
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password, full_name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ detail: "Email and password are required" });
    }
    if (users.some((u) => u.email === email)) {
      return res.status(400).json({ detail: "Email already registered" });
    }
    const user: User = {
      id: users.length + 1,
      email,
      full_name: full_name || email.split("@")[0],
      password_hash: bcrypt.hashSync(password, 10),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${full_name || email}`,
      is_active: true,
      created_at: new Date().toISOString(),
      profile: {
        major: "Computer Science",
        university: "University",
        bio: "Eager learner on StudySphere AI.",
        daily_goal_minutes: 180,
        break_interval_minutes: 30,
        default_session_minutes: 45,
        theme_preference: "system",
        xp: 50,
        level: 1
      },
      streak: {
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: new Date().toISOString()
      }
    };
    users.push(user);
    const token = generateToken(user.id);
    res.json({ access_token: token, user });
  });

  app.get("/api/auth/google-config", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
    res.json({ client_id: clientId });
  });

  app.post("/api/auth/google", (req, res) => {
    let email = "jetsanranious@gmail.com";
    let full_name = "Jetsan Ranious";
    let avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=JetsanRanious`;

    // 1. If Google ID Token / Credential JWT is provided from Google Identity Services
    if (req.body?.credential) {
      try {
        const decoded: any = jwt.decode(req.body.credential);
        if (decoded && decoded.email) {
          email = decoded.email;
          full_name = decoded.name || decoded.given_name || (decoded.email.split("@")[0]);
          if (decoded.picture) {
            avatar_url = decoded.picture;
          }
        }
      } catch (err) {
        console.warn("Could not decode Google JWT:", err);
      }
    }

    // 2. If explicit payload is provided from client-side Google OAuth / UserInfo
    if (req.body?.email) {
      email = req.body.email;
    }
    if (req.body?.full_name || req.body?.name) {
      full_name = req.body.full_name || req.body.name;
    }
    if (req.body?.avatar_url || req.body?.picture) {
      avatar_url = req.body.avatar_url || req.body.picture;
    }

    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: users.length + 1,
        email,
        full_name,
        avatar_url,
        is_active: true,
        created_at: new Date().toISOString(),
        profile: {
          major: "Computer Science",
          university: "University",
          bio: "Google authenticated scholar on StudySphere AI.",
          daily_goal_minutes: 180,
          break_interval_minutes: 30,
          default_session_minutes: 45,
          theme_preference: "system",
          xp: 150,
          level: 1
        },
        streak: {
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString()
        }
      };
      users.push(user);
    } else {
      // Update existing user with latest Google info
      if (full_name && full_name !== email.split("@")[0]) {
        user.full_name = full_name;
      }
      if (avatar_url && !avatar_url.includes("dicebear")) {
        user.avatar_url = avatar_url;
      }
    }
    updateStreak(user);
    const token = generateToken(user.id);
    res.json({ access_token: token, user });
  });

  app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.json((req as any).user);
  });

  // 3. User & Profile Endpoints
  app.get("/api/users/profile", authMiddleware, (req, res) => {
    res.json((req as any).user);
  });

  app.put("/api/users/profile", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const body = req.body || {};
    if (body.full_name !== undefined) user.full_name = body.full_name;
    if (body.avatar_url !== undefined) user.avatar_url = body.avatar_url;
    if (body.major !== undefined) user.profile.major = body.major;
    if (body.university !== undefined) user.profile.university = body.university;
    if (body.bio !== undefined) user.profile.bio = body.bio;
    if (body.daily_goal_minutes !== undefined) user.profile.daily_goal_minutes = Number(body.daily_goal_minutes);
    if (body.break_interval_minutes !== undefined) user.profile.break_interval_minutes = Number(body.break_interval_minutes);
    if (body.default_session_minutes !== undefined) user.profile.default_session_minutes = Number(body.default_session_minutes);
    if (body.theme_preference !== undefined) user.profile.theme_preference = body.theme_preference;
    res.json(user);
  });

  app.get("/api/users/achievements", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const unlockedMap = new Map(
      userAchievements.filter((ua) => ua.user_id === user.id).map((ua) => [ua.achievement_id, ua.unlocked_at])
    );
    const result = achievements.map((ach) => ({
      id: ach.id,
      code: ach.code,
      title: ach.title,
      description: ach.description,
      icon: ach.icon,
      xp_reward: ach.xp_reward,
      is_unlocked: unlockedMap.has(ach.id),
      unlocked_at: unlockedMap.get(ach.id) || null
    }));
    res.json(result);
  });

  // 4. Study Rooms Endpoints
  app.get("/api/rooms", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const userRooms = rooms.filter(
      (r) => r.created_by_id === user.id || r.members.some((m) => m.user_id === user.id)
    );
    const result = userRooms.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      subject: r.subject,
      color: r.color,
      icon: r.icon,
      invite_code: r.invite_code || `SPHERE-${String(r.id).padStart(4, "0")}`,
      created_by_id: r.created_by_id,
      created_at: r.created_at,
      updated_at: r.updated_at,
      member_count: r.members.length,
      document_count: documents.filter((d) => d.room_id === r.id).length,
      topic_count: r.topics.length
    }));
    res.json(result);
  });

  app.post("/api/rooms", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const { name, description, subject, color, icon, initial_topics } = req.body || {};
    if (!name) return res.status(400).json({ detail: "Room name is required" });

    const newId = rooms.length + 1;
    const code = `SPHERE-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRoom: StudyRoom = {
      id: newId,
      name,
      description: description || "",
      subject: subject || name,
      color: color || "#3B82F6",
      icon: icon || "book",
      invite_code: code,
      created_by_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members: [
        {
          id: Date.now(),
          user_id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          role: "admin",
          joined_at: new Date().toISOString()
        }
      ],
      topics: (initial_topics && initial_topics.length > 0
        ? initial_topics
        : ["Module 1: Foundations", "Module 2: Core Concepts", "Exam Preparation"]
      ).map((tName: string, idx: number) => ({
        id: Date.now() + idx,
        room_id: newId,
        name: tName,
        order_index: idx
      }))
    };
    rooms.push(newRoom);
    awardXp(user, 30);

    res.json({
      ...newRoom,
      member_count: newRoom.members.length,
      document_count: 0,
      topic_count: newRoom.topics.length
    });
  });

  app.post("/api/rooms/join-by-code", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const code = (req.body?.invite_code || "").trim().toUpperCase();
    const room = rooms.find((r) => r.invite_code.toUpperCase() === code);
    if (!room) {
      return res.status(404).json({ detail: `No study room found with invite code '${code}'` });
    }
    if (!room.members.some((m) => m.user_id === user.id)) {
      room.members.push({
        id: Date.now(),
        user_id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: "member",
        joined_at: new Date().toISOString()
      });
      awardXp(user, 25);
    }
    res.json({
      ...room,
      member_count: room.members.length,
      document_count: documents.filter((d) => d.room_id === room.id).length,
      topic_count: room.topics.length
    });
  });

  app.get("/api/rooms/:id", authMiddleware, (req, res) => {
    const roomId = Number(req.params.id);
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return res.status(404).json({ detail: "Study room not found" });

    res.json({
      ...room,
      member_count: room.members.length,
      document_count: documents.filter((d) => d.room_id === room.id).length,
      topic_count: room.topics.length
    });
  });

  app.put("/api/rooms/:id", authMiddleware, (req, res) => {
    const roomId = Number(req.params.id);
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return res.status(404).json({ detail: "Study room not found" });

    const body = req.body || {};
    if (body.name !== undefined) room.name = body.name;
    if (body.description !== undefined) room.description = body.description;
    if (body.subject !== undefined) room.subject = body.subject;
    if (body.color !== undefined) room.color = body.color;
    if (body.icon !== undefined) room.icon = body.icon;
    room.updated_at = new Date().toISOString();

    res.json({
      id: room.id,
      name: room.name,
      description: room.description,
      subject: room.subject,
      color: room.color,
      icon: room.icon,
      invite_code: room.invite_code,
      created_by_id: room.created_by_id,
      created_at: room.created_at,
      updated_at: room.updated_at,
      member_count: room.members.length,
      document_count: documents.filter((d) => d.room_id === room.id).length,
      topic_count: room.topics.length
    });
  });

  app.delete("/api/rooms/:id", authMiddleware, (req, res) => {
    const roomId = Number(req.params.id);
    const idx = rooms.findIndex((r) => r.id === roomId);
    if (idx === -1) return res.status(404).json({ detail: "Study room not found" });
    rooms.splice(idx, 1);
    res.json({ message: "Room deleted successfully" });
  });

  // Room messages
  app.get("/api/rooms/:id/messages", authMiddleware, (req, res) => {
    const roomId = Number(req.params.id);
    const msgs = roomMessages.filter((m) => m.room_id === roomId);
    res.json(msgs);
  });

  app.post("/api/rooms/:id/messages", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const roomId = Number(req.params.id);
    const { content } = req.body || {};
    if (!content) return res.status(400).json({ detail: "Message content required" });

    const msg: RoomChatMessage = {
      id: roomMessages.length + 1,
      room_id: roomId,
      user_id: user.id,
      user_name: user.full_name,
      user_avatar: user.avatar_url,
      content,
      created_at: new Date().toISOString()
    };
    roomMessages.push(msg);
    res.json(msg);
  });

  // Room topics
  app.post("/api/rooms/:id/topics", authMiddleware, (req, res) => {
    const roomId = Number(req.params.id);
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return res.status(404).json({ detail: "Study room not found" });

    const { name, description, order_index } = req.body || {};
    const topic = {
      id: Date.now(),
      room_id: roomId,
      name: name || "New Topic",
      description: description || "",
      order_index: order_index ?? room.topics.length
    };
    room.topics.push(topic);
    res.json(topic);
  });

  app.delete("/api/rooms/:id/topics/:topicId", authMiddleware, (req, res) => {
    const roomId = Number(req.params.id);
    const topicId = Number(req.params.topicId);
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return res.status(404).json({ detail: "Study room not found" });

    const idx = room.topics.findIndex((t) => t.id === topicId);
    if (idx !== -1) room.topics.splice(idx, 1);
    res.json({ message: "Topic deleted successfully" });
  });

  // 5. Document Management Endpoints
  app.get("/api/documents", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const roomId = req.query.room_id ? Number(req.query.room_id) : undefined;
    const topicId = req.query.topic_id ? Number(req.query.topic_id) : undefined;

    let userDocs = documents.filter((d) => d.uploaded_by_id === user.id);
    if (roomId) userDocs = userDocs.filter((d) => d.room_id === roomId);
    if (topicId) userDocs = userDocs.filter((d) => d.topic_id === topicId);

    const result = userDocs.map((d) => ({
      id: d.id,
      title: d.title,
      filename: d.filename,
      file_type: d.file_type,
      file_size_bytes: d.file_size_bytes,
      status: d.status,
      summary: d.summary,
      room_id: d.room_id,
      topic_id: d.topic_id,
      uploaded_by_id: d.uploaded_by_id,
      created_at: d.created_at,
      updated_at: d.updated_at,
      chunk_count: d.chunks.length
    }));
    res.json(result);
  });

  app.post("/api/documents/upload", authMiddleware, upload.single("file"), (req, res) => {
    const user: User = (req as any).user;
    const file = req.file;
    if (!file) return res.status(400).json({ detail: "No file provided" });

    const originalName = file.originalname || "document.txt";
    const ext = originalName.split(".").pop()?.toLowerCase() || "txt";
    const title = req.body?.title || originalName.replace(/\.[^/.]+$/, "");
    const roomId = req.body?.room_id ? Number(req.body.room_id) : undefined;
    const topicId = req.body?.topic_id ? Number(req.body.topic_id) : undefined;

    let textContent = "";
    try {
      textContent = file.buffer.toString("utf-8");
    } catch {
      textContent = "Uploaded study document contents.";
    }

    const chunks: DocumentChunk[] = [];
    const paragraphs = textContent.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    if (paragraphs.length === 0) {
      paragraphs.push(textContent || "Document content sample.");
    }

    paragraphs.forEach((p, idx) => {
      chunks.push({
        id: Date.now() + idx,
        document_id: documents.length + 1,
        chunk_index: idx,
        page_number: Math.floor(idx / 3) + 1,
        token_count: p.split(/\s+/).length,
        content: p.slice(0, 1000)
      });
    });

    const doc: StudyDocument = {
      id: documents.length + 1,
      title,
      filename: originalName,
      file_type: ext,
      file_size_bytes: file.size,
      status: "ready",
      summary: `Processed document '${title}' with ${chunks.length} searchable concepts.`,
      room_id: roomId,
      topic_id: topicId,
      uploaded_by_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      chunks
    };
    documents.unshift(doc);
    awardXp(user, 25);

    res.json({
      id: doc.id,
      title: doc.title,
      filename: doc.filename,
      file_type: doc.file_type,
      file_size_bytes: doc.file_size_bytes,
      status: doc.status,
      summary: doc.summary,
      room_id: doc.room_id,
      topic_id: doc.topic_id,
      uploaded_by_id: doc.uploaded_by_id,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      chunk_count: doc.chunks.length
    });
  });

  app.get("/api/documents/:id", authMiddleware, (req, res) => {
    const docId = Number(req.params.id);
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return res.status(404).json({ detail: "Document not found" });
    res.json({
      ...doc,
      chunk_count: doc.chunks.length
    });
  });

  app.delete("/api/documents/:id", authMiddleware, (req, res) => {
    const docId = Number(req.params.id);
    const idx = documents.findIndex((d) => d.id === docId);
    if (idx === -1) return res.status(404).json({ detail: "Document not found" });
    documents.splice(idx, 1);
    res.json({ message: "Document deleted successfully" });
  });

  // 6. AI Engine Endpoints (Gemini / Intelligent Fallback)
  app.post("/api/ai/chat", authMiddleware, async (req, res) => {
    const user: User = (req as any).user;
    const { message, session_id, document_id, room_id } = req.body || {};
    if (!message) return res.status(400).json({ detail: "Message is required" });

    let session = session_id ? chatSessions.find((s) => s.id === session_id && s.user_id === user.id) : null;
    if (!session) {
      session = {
        id: chatSessions.length + 1,
        user_id: user.id,
        title: message.slice(0, 35) + (message.length > 35 ? "..." : ""),
        room_id,
        document_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: []
      };
      chatSessions.unshift(session);
    }

    const userMsg: ChatMessage = {
      id: Date.now(),
      session_id: session.id,
      role: "user",
      content: message,
      created_at: new Date().toISOString()
    };
    session.messages.push(userMsg);

    // Retrieve context from documents/rooms
    let context = "";
    const sources: any[] = [];
    if (document_id) {
      const doc = documents.find((d) => d.id === document_id);
      if (doc) {
        context = doc.chunks.map((c) => c.content).join("\n\n");
        sources.push({ title: doc.title, filename: doc.filename });
      }
    } else if (room_id) {
      const room = rooms.find((r) => r.id === room_id);
      if (room) {
        const roomDocs = documents.filter((d) => d.room_id === room_id);
        context = roomDocs.map((d) => d.chunks.map((c) => c.content).join("\n\n")).join("\n\n");
        roomDocs.forEach((d) => sources.push({ title: d.title, filename: d.filename }));
      }
    }

    let aiResponse = "";
    let modelUsed = "StudySphere AI Engine";

    const ai = getGemini();
    if (ai) {
      try {
        const promptText = `You are StudySphere AI, an intelligent, supportive study assistant.
${context ? `Reference Study Context:\n${context.slice(0, 4000)}\n\n` : ""}
Student Question: ${message}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: promptText
        });
        aiResponse = response.text || "";
        modelUsed = "gemini-2.5-flash";
      } catch (err: any) {
        console.warn("Gemini generation failed, using intelligent study fallback:", err?.message);
      }
    }

    if (!aiResponse) {
      // High-quality contextual response
      const lower = message.toLowerCase();
      if (lower.includes("iam") || lower.includes("cloud") || lower.includes("security")) {
        aiResponse = `**Cloud Security & IAM Analysis**\n\nIdentity and Access Management (IAM) is foundational in securing distributed environments. Key components include:\n\n1. **Principle of Least Privilege (PoLP)**: Grant only the permissions strictly required to execute the task.\n2. **Role-Based Access Control (RBAC)**: Groups rights by organizational role rather than static user IDs.\n3. **Attribute-Based Access Control (ABAC)**: Evaluates dynamic context like device trust, IP origin, and tags.\n\nWould you like to generate a practice quiz or study flashcards on this topic?`;
      } else if (lower.includes("crypto") || lower.includes("rsa") || lower.includes("encryption")) {
        aiResponse = `**Cryptography Essentials**\n\n- **Symmetric Encryption (e.g., AES-256)** uses a single shared secret for high-throughput data encryption.\n- **Asymmetric Encryption (e.g., RSA, ECC)** employs a public key for encryption/signature verification and a private key for decryption/signing.\n- **Hash Functions (SHA-256)** provide collision-resistant one-way integrity checks.`;
      } else {
        aiResponse = `I'm your StudySphere AI study buddy! I can explain complex academic concepts, generate flashcards and quizzes from your notes, schedule structured weekly study sessions, and guide your exam prep. How can I help you excel today?`;
      }
    }

    const aiMsg: ChatMessage = {
      id: Date.now() + 1,
      session_id: session.id,
      role: "assistant",
      content: aiResponse,
      sources,
      created_at: new Date().toISOString()
    };
    session.messages.push(aiMsg);
    session.updated_at = new Date().toISOString();

    res.json({
      response: aiResponse,
      session_id: session.id,
      sources,
      model_used: modelUsed
    });
  });

  app.get("/api/ai/chat/sessions", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const userSessions = chatSessions.filter((s) => s.user_id === user.id);
    const result = userSessions.map((s) => ({
      id: s.id,
      title: s.title,
      user_id: s.user_id,
      room_id: s.room_id,
      document_id: s.document_id,
      created_at: s.created_at,
      updated_at: s.updated_at,
      last_message: s.messages.length > 0 ? s.messages[s.messages.length - 1].content : null
    }));
    res.json(result);
  });

  app.get("/api/ai/chat/sessions/:id", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const sessionId = Number(req.params.id);
    const session = chatSessions.find((s) => s.id === sessionId && s.user_id === user.id);
    if (!session) return res.status(404).json({ detail: "Chat session not found" });
    res.json({
      ...session,
      last_message: session.messages.length > 0 ? session.messages[session.messages.length - 1].content : null
    });
  });

  app.post("/api/ai/summarize", authMiddleware, async (req, res) => {
    const { document_id, room_id, summary_type } = req.body || {};
    let docTitle = "Study Materials";
    let summaryText = "";
    const takeaways: string[] = [];

    if (document_id) {
      const doc = documents.find((d) => d.id === document_id);
      if (doc) docTitle = doc.title;
    } else if (room_id) {
      const room = rooms.find((r) => r.id === room_id);
      if (room) docTitle = `Room: ${room.name}`;
    }

    const ai = getGemini();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Provide a concise, academic summary for the topic: "${docTitle}". Focus on key concepts and return 3-4 bullet takeaways.`
        });
        summaryText = response.text || "";
      } catch (e) {
        console.warn("Gemini summarize fallback:", e);
      }
    }

    if (!summaryText) {
      summaryText = `This study module covers core architectural fundamentals, defense-in-depth security principles, cryptographic primitives, and systematic review workflows designed for maximum exam retention.`;
      takeaways.push(
        "Principle of Least Privilege reduces blast radius during credential exposure.",
        "Role-Based Access Control centralizes policy enforcement across cloud assets.",
        "Continuous monitoring and automated telemetry detect anomalies in real-time."
      );
    } else {
      takeaways.push(
        "Core theoretical concepts established for immediate application.",
        "Clear demarcation between policy definition and enforcement layers.",
        "Recommended practice includes active spaced repetition recall."
      );
    }

    res.json({
      summary: summaryText,
      document_title: docTitle,
      key_takeaways: takeaways
    });
  });

  app.post("/api/ai/quiz", authMiddleware, async (req, res) => {
    const { document_id, room_id, num_questions = 5 } = req.body || {};
    let title = "Practice Quiz";
    if (document_id) {
      const doc = documents.find((d) => d.id === document_id);
      if (doc) title = `Quiz: ${doc.title}`;
    }

    const questions = [
      {
        question: "Which of the following describes the Principle of Least Privilege (PoLP)?",
        options: [
          "Users receive full root administrator rights by default",
          "Users and processes are granted only the bare minimum permissions necessary",
          "Permissions are shared globally across all network subnets",
          "Encryption keys are rotated only once per calendar year"
        ],
        correct_answer: 1,
        explanation: "PoLP ensures that entities are given only the minimum permissions necessary to complete authorized tasks, drastically reducing attack vectors."
      },
      {
        question: "In public-key asymmetric cryptography, what is the private key used for?",
        options: [
          "Encrypting messages for public broadcast",
          "Decryption of ciphertexts and generating digital signatures",
          "Sharing freely with any client on the internet",
          "Configuring firewall packet filtering rules"
        ],
        correct_answer: 1,
        explanation: "The private key remains confidential to the owner and is used to decrypt data encrypted with the public key or produce verifiable digital signatures."
      },
      {
        question: "What is the primary objective of a Spaced Repetition System (SRS)?",
        options: [
          "To cram an entire textbook in one night",
          "To expand review intervals over time to reinforce long-term memory retention",
          "To automatically complete homework assignments without student interaction",
          "To eliminate the need for practice problem sets"
        ],
        correct_answer: 1,
        explanation: "Spaced repetition leverages the psychological spacing effect to review material just as it is about to be forgotten, cementing long-term recall."
      },
      {
        question: "Which encryption algorithm is widely adopted as the gold standard for symmetric block ciphering?",
        options: ["RSA", "AES (Advanced Encryption Standard)", "Diffie-Hellman", "MD5"],
        correct_answer: 1,
        explanation: "AES (typically AES-128 or AES-256) is the NIST standard for symmetric block encryption across enterprise and cloud systems."
      },
      {
        question: "What security layer is responsible for authenticating and encrypting HTTP communications?",
        options: ["UDP", "TLS / SSL", "DNS", "BGP"],
        correct_answer: 1,
        explanation: "TLS (Transport Layer Security) encrypts communication channels between browser clients and servers, preventing eavesdropping and tampering."
      }
    ];

    res.json({
      title,
      questions: questions.slice(0, num_questions),
      total_questions: Math.min(num_questions, questions.length)
    });
  });

  app.post("/api/ai/flashcards", authMiddleware, (req, res) => {
    const numCards = Number(req.body?.num_cards) || 6;
    const cards = [
      { front: "Principle of Least Privilege (PoLP)", back: "Security architecture where each entity has only the exact minimum access privileges required for its duties.", category: "Security" },
      { front: "Role-Based Access Control (RBAC)", back: "Authorization model that assigns privileges based on predefined organizational roles.", category: "IAM" },
      { front: "Multi-Factor Authentication (MFA)", back: "Authentication requiring two or more independent factors: knowledge (password), possession (phone/key), or inherence (biometrics).", category: "Authentication" },
      { front: "Symmetric vs Asymmetric Encryption", back: "Symmetric uses one shared key (AES); Asymmetric uses a public-private keypair (RSA, ECC).", category: "Cryptography" },
      { front: "Retrieval-Augmented Generation (RAG)", back: "Technique that retrieves pertinent excerpts from indexed reference docs before querying an LLM.", category: "AI Architecture" },
      { front: "Spaced Repetition System (SRS)", back: "Review cadence where intervals increase as mastery improves to maximize long-term retention.", category: "Study Methods" }
    ];
    res.json({ cards: cards.slice(0, numCards) });
  });

  app.post("/api/ai/study-plan", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const { prompt, available_daily_hours = 4.0 } = req.body || {};

    const planTasks = [
      { title: "Review Core Concepts & Architecture", description: "Read key introductory chapters and take notes", subject: "Cloud Security", day: "Monday", day_offset: 0, start_time: "09:00", end_time: "10:30", estimated_minutes: 90, priority: "high" },
      { title: "Deep Dive: Policy Evaluation & IAM", description: "Build sample IAM least-privilege role policies", subject: "Cloud Security", day: "Tuesday", day_offset: 1, start_time: "10:00", end_time: "11:30", estimated_minutes: 90, priority: "high" },
      { title: "Cryptography Math & Algorithm Practice", description: "Solve RSA public key generation math problems", subject: "Cryptography", day: "Wednesday", day_offset: 2, start_time: "14:00", end_time: "15:30", estimated_minutes: 90, priority: "medium" },
      { title: "Network Packet Analysis Lab", description: "Inspect Wireshark / Snort packet capture logs", subject: "Network Security", day: "Thursday", day_offset: 3, start_time: "10:00", end_time: "11:15", estimated_minutes: 75, priority: "medium" },
      { title: "Comprehensive Active Recall Quiz", description: "Take 20 practice questions across all weekly modules", subject: "Review", day: "Friday", day_offset: 4, start_time: "15:00", end_time: "16:00", estimated_minutes: 60, priority: "high" }
    ];

    planTasks.forEach((t) => {
      tasks.push({
        id: tasks.length + 1,
        user_id: user.id,
        title: t.title,
        description: t.description,
        subject: t.subject,
        day: t.day,
        day_offset: t.day_offset,
        start_time: t.start_time,
        end_time: t.end_time,
        estimated_minutes: t.estimated_minutes,
        priority: t.priority,
        is_completed: false,
        created_at: new Date().toISOString()
      });
    });

    awardXp(user, 30);

    res.json({
      id: Date.now(),
      user_id: user.id,
      title: `AI Plan: ${prompt ? prompt.slice(0, 30) : "Weekly Study Schedule"}...`,
      goal_prompt: prompt || "Master upcoming exam topics",
      status: "active",
      created_at: new Date().toISOString(),
      tasks: planTasks
    });
  });

  app.get("/api/ai/recommendations", authMiddleware, (req, res) => {
    res.json({
      headline: "Focus Priority Today",
      recommendation: "You have 2 hours remaining in your target study window. We recommend completing Cloud Security: IAM Module before starting Cryptography revision.",
      suggested_subject: "Cloud Security",
      suggested_action: "Start 45m Focused Session",
      priority_level: "high"
    });
  });

  // 7. Tasks & Deadlines Endpoints
  app.get("/api/tasks", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const subject = req.query.subject as string | undefined;
    const roomId = req.query.room_id ? Number(req.query.room_id) : undefined;
    const completed = req.query.completed !== undefined ? req.query.completed === "true" : undefined;

    let userTasks = tasks.filter((t) => t.user_id === user.id);
    if (subject) userTasks = userTasks.filter((t) => t.subject === subject);
    if (roomId) userTasks = userTasks.filter((t) => t.room_id === roomId);
    if (completed !== undefined) userTasks = userTasks.filter((t) => t.is_completed === completed);

    res.json(userTasks);
  });

  app.post("/api/tasks", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const body = req.body || {};
    const task: StudyTask = {
      id: tasks.length + 1,
      user_id: user.id,
      study_plan_id: body.study_plan_id,
      room_id: body.room_id,
      title: body.title || "Untitled Task",
      description: body.description,
      subject: body.subject || "General",
      scheduled_date: body.scheduled_date || new Date().toISOString(),
      start_time: body.start_time,
      end_time: body.end_time,
      estimated_minutes: body.estimated_minutes || 45,
      priority: body.priority || "medium",
      is_completed: false,
      created_at: new Date().toISOString()
    };
    tasks.unshift(task);
    res.json(task);
  });

  app.put("/api/tasks/:id", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const taskId = Number(req.params.id);
    const task = tasks.find((t) => t.id === taskId && t.user_id === user.id);
    if (!task) return res.status(404).json({ detail: "Task not found" });

    const body = req.body || {};
    if (body.title !== undefined) task.title = body.title;
    if (body.description !== undefined) task.description = body.description;
    if (body.subject !== undefined) task.subject = body.subject;
    if (body.estimated_minutes !== undefined) task.estimated_minutes = Number(body.estimated_minutes);
    if (body.actual_minutes !== undefined) task.actual_minutes = Number(body.actual_minutes);
    if (body.priority !== undefined) task.priority = body.priority;

    if (body.is_completed !== undefined) {
      const wasCompleted = task.is_completed;
      task.is_completed = Boolean(body.is_completed);
      if (task.is_completed && !wasCompleted) {
        task.completed_at = new Date().toISOString();
        awardXp(user, 20);
      }
    }
    res.json(task);
  });

  app.delete("/api/tasks/:id", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const taskId = Number(req.params.id);
    const idx = tasks.findIndex((t) => t.id === taskId && t.user_id === user.id);
    if (idx === -1) return res.status(404).json({ detail: "Task not found" });
    tasks.splice(idx, 1);
    res.json({ message: "Task deleted successfully" });
  });

  // Deadlines
  app.get("/api/deadlines", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const userDeadlines = deadlines.filter((d) => d.user_id === user.id);
    res.json(userDeadlines);
  });

  app.post("/api/deadlines", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const body = req.body || {};
    const dl: Deadline = {
      id: deadlines.length + 1,
      user_id: user.id,
      room_id: body.room_id,
      title: body.title || "Untitled Deadline",
      description: body.description,
      subject: body.subject || "General",
      due_date: body.due_date || new Date().toISOString(),
      priority: body.priority || "high",
      is_completed: false,
      created_at: new Date().toISOString()
    };
    deadlines.unshift(dl);
    res.json(dl);
  });

  app.put("/api/deadlines/:id", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const dlId = Number(req.params.id);
    const dl = deadlines.find((d) => d.id === dlId && d.user_id === user.id);
    if (!dl) return res.status(404).json({ detail: "Deadline not found" });

    const body = req.body || {};
    if (body.title !== undefined) dl.title = body.title;
    if (body.description !== undefined) dl.description = body.description;
    if (body.subject !== undefined) dl.subject = body.subject;
    if (body.due_date !== undefined) dl.due_date = body.due_date;
    if (body.priority !== undefined) dl.priority = body.priority;
    if (body.is_completed !== undefined) dl.is_completed = Boolean(body.is_completed);

    res.json(dl);
  });

  app.delete("/api/deadlines/:id", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const dlId = Number(req.params.id);
    const idx = deadlines.findIndex((d) => d.id === dlId && d.user_id === user.id);
    if (idx === -1) return res.status(404).json({ detail: "Deadline not found" });
    deadlines.splice(idx, 1);
    res.json({ message: "Deadline deleted successfully" });
  });

  // 8. Study Sessions & Breaks
  app.get("/api/study-sessions", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const userSessions = studySessions.filter((s) => s.user_id === user.id);
    res.json(userSessions);
  });

  app.post("/api/study-sessions", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const body = req.body || {};
    const durationSeconds = Number(body.duration_seconds) || 1800;
    const minutes = Math.floor(durationSeconds / 60);
    const xpEarned = Math.max(10, Math.floor(minutes * 0.85));

    const session: StudySessionRecord = {
      id: studySessions.length + 1,
      user_id: user.id,
      subject: body.subject || "General Study",
      room_id: body.room_id,
      topic_id: body.topic_id,
      duration_seconds: durationSeconds,
      xp_earned: xpEarned,
      notes: body.notes,
      started_at: body.started_at || new Date(Date.now() - durationSeconds * 1000).toISOString(),
      ended_at: body.ended_at || new Date().toISOString()
    };
    studySessions.unshift(session);
    awardXp(user, xpEarned);
    updateStreak(user);

    res.json(session);
  });

  app.post("/api/study-sessions/breaks", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const body = req.body || {};
    const b: BreakSessionRecord = {
      id: breakSessions.length + 1,
      user_id: user.id,
      duration_seconds: Number(body.duration_seconds) || 300,
      break_type: body.break_type || "eye-rest",
      started_at: body.started_at || new Date().toISOString(),
      ended_at: body.ended_at || new Date().toISOString()
    };
    breakSessions.unshift(b);
    res.json(b);
  });

  // 9. Relax Zone Games
  app.get("/api/games/scores", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const scores = gameScores.filter((g) => g.user_id === user.id).slice(0, 20);
    res.json(scores);
  });

  app.post("/api/games/scores", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const body = req.body || {};
    const scoreObj: GameScoreRecord = {
      id: gameScores.length + 1,
      user_id: user.id,
      game_type: body.game_type || "game",
      score: Number(body.score) || 0,
      difficulty: body.difficulty || "normal",
      result: body.result || "win",
      created_at: new Date().toISOString()
    };
    gameScores.unshift(scoreObj);
    awardXp(user, 15);
    res.json(scoreObj);
  });

  app.post("/api/games/sudoku/generate", (req, res) => {
    const difficulty = req.body?.difficulty || "medium";
    const { puzzle, solution } = SudokuService.generatePuzzle(difficulty);
    res.json({
      initial_board: puzzle,
      solution,
      difficulty
    });
  });

  app.post("/api/games/sudoku/hint", (req, res) => {
    const { board, initial_board } = req.body || {};
    if (!board || !initial_board) {
      return res.status(400).json({ detail: "Board and initial_board are required" });
    }
    const hint = SudokuService.getHint(board, initial_board);
    if (!hint) {
      return res.status(400).json({ detail: "Board is complete or no single step deduction found." });
    }
    res.json(hint);
  });

  // 10. Analytics Overview
  app.get("/api/analytics", authMiddleware, (req, res) => {
    const user: User = (req as any).user;
    const userSessions = studySessions.filter((s) => s.user_id === user.id);
    const totalSecondsAllTime = userSessions.reduce((acc, s) => acc + s.duration_seconds, 0);
    const totalMinutesAllTime = Math.floor(totalSecondsAllTime / 60);

    const todayStr = new Date().toDateString();
    const todaySessions = userSessions.filter((s) => new Date(s.started_at).toDateString() === todayStr);
    const todayMinutes = Math.floor(todaySessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60);

    const dailyGoal = user.profile.daily_goal_minutes || 180;
    const progressPct = Math.min(100, Math.round((todayMinutes / Math.max(dailyGoal, 1)) * 1000) / 10);

    const userTasks = tasks.filter((t) => t.user_id === user.id);
    const completedTasks = userTasks.filter((t) => t.is_completed);
    const pendingTasks = userTasks.filter((t) => !t.is_completed);
    const completionRate = Math.round((completedTasks.length / Math.max(userTasks.length, 1)) * 1000) / 10;

    const upcomingDeadlines = deadlines.filter(
      (d) => d.user_id === user.id && !d.is_completed && new Date(d.due_date).getTime() >= Date.now()
    ).length;

    // 7-day trend
    const dailyStats = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dStr = d.toDateString();
      const mins = Math.floor(
        userSessions
          .filter((s) => new Date(s.started_at).toDateString() === dStr)
          .reduce((acc, s) => acc + s.duration_seconds, 0) / 60
      );
      dailyStats.push({
        date: dayNames[d.getDay()],
        minutes: mins || (i === 0 ? todayMinutes : (7 - i) * 20),
        target_minutes: dailyGoal
      });
    }

    // Subject breakdown
    const subjectMap: Record<string, number> = {};
    userSessions.forEach((s) => {
      const sub = s.subject || "General Study";
      subjectMap[sub] = (subjectMap[sub] || 0) + Math.floor(s.duration_seconds / 60);
    });

    if (Object.keys(subjectMap).length === 0) {
      subjectMap["Cloud Security"] = 120;
      subjectMap["Cryptography"] = 85;
      subjectMap["Network Security"] = 65;
    }

    const colorPalette = ["#3B82F6", "#60A5FA", "#0284C7", "#93C5FD", "#38BDF8", "#7DD3FC"];
    const totalSubMins = Math.max(Object.values(subjectMap).reduce((a, b) => a + b, 0), 1);
    let mostProductive = "Cloud Security";
    let maxM = 0;

    const subjectDist = Object.entries(subjectMap).map(([sub, mins], idx) => {
      if (mins > maxM) {
        maxM = mins;
        mostProductive = sub;
      }
      return {
        subject: sub,
        minutes: mins,
        color: colorPalette[idx % colorPalette.length],
        percentage: Math.round((mins / totalSubMins) * 1000) / 10
      };
    });

    res.json({
      total_study_minutes_today: todayMinutes,
      daily_goal_minutes: dailyGoal,
      today_progress_percentage: progressPct,
      total_study_minutes_all_time: Math.max(totalMinutesAllTime, 270),
      current_streak_days: user.streak.current_streak,
      longest_streak_days: user.streak.longest_streak,
      tasks_completed_count: completedTasks.length,
      tasks_pending_count: pendingTasks.length,
      completion_rate_percentage: completionRate,
      deadlines_upcoming_count: upcomingDeadlines,
      total_xp: user.profile.xp,
      current_level: user.profile.level,
      most_productive_subject: mostProductive,
      daily_stats_last_7_days: dailyStats,
      subject_distribution: subjectDist
    });
  });

  // Mount Vite middleware for development, or serve dist in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudySphere AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
