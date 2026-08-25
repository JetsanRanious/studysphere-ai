import datetime
from sqlalchemy.orm import Session
from app.models.user import User, UserProfile, UserStreak, Achievement
from app.models.room import StudyRoom, RoomMember, RoomTopic
from app.models.study_plan import StudyTask, Deadline
from app.models.session import StudySession
from app.core.security import get_password_hash

def seed_achievements(db: Session):
    achievements_data = [
        {"code": "FIRST_SESSION", "title": "First Step", "description": "Completed your first study session", "icon": "zap", "xp_reward": 50},
        {"code": "5_SESSIONS", "title": "Focus Scholar", "description": "Completed 5 study sessions", "icon": "flame", "xp_reward": 100},
        {"code": "3_DAY_STREAK", "title": "Consistency Starter", "description": "Maintained a 3-day study streak", "icon": "calendar", "xp_reward": 75},
        {"code": "7_DAY_STREAK", "title": "Streak Master", "description": "Maintained a 7-day study streak", "icon": "award", "xp_reward": 150},
        {"code": "DOC_MASTER", "title": "Knowledge Collector", "description": "Uploaded 3+ study documents", "icon": "book-open", "xp_reward": 80},
        {"code": "ROOM_CREATOR", "title": "Room Pioneer", "description": "Created or joined a study room", "icon": "users", "xp_reward": 50},
        {"code": "LEVEL_5", "title": "Ascended Scholar", "description": "Reached Level 5", "icon": "star", "xp_reward": 200},
        {"code": "PLANNER_PRO", "title": "Master Strategist", "description": "Generated an AI Weekly Study Plan", "icon": "compass", "xp_reward": 60}
    ]

    for ach in achievements_data:
        existing = db.query(Achievement).filter(Achievement.code == ach["code"]).first()
        if not existing:
            db.add(Achievement(**ach))
    db.commit()

def seed_demo_data(db: Session):
    seed_achievements(db)
    
    # Check if demo user exists
    demo_user = db.query(User).filter(User.email == "student@studysphere.ai").first()
    if not demo_user:
        demo_user = User(
            email="student@studysphere.ai",
            full_name="Jetsan",
            hashed_password=get_password_hash("DemoStudy2026!"),
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=Jetsan"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        profile = UserProfile(
            user_id=demo_user.id,
            major="Cloud & Cyber Security",
            university="Stanford University",
            bio="Focusing on distributed cloud security, zero trust architecture, and cryptography.",
            daily_goal_minutes=180,
            break_interval_minutes=30,
            default_session_minutes=45,
            xp=420,
            level=3
        )
        streak = UserStreak(
            user_id=demo_user.id,
            current_streak=7,
            longest_streak=12,
            last_activity_date=datetime.datetime.utcnow()
        )
        db.add(profile)
        db.add(streak)
        db.commit()

        # Seed Sample Rooms
        rooms_data = [
            {
                "name": "Cloud Security",
                "subject": "Cloud Security",
                "description": "IAM architectures, AWS/GCP security models, container isolation, and compliance.",
                "color": "#3B82F6",
                "icon": "cloud",
                "topics": ["Module 1: Cloud Architecture Basics", "Module 2: IAM & Least Privilege", "Module 3: Container Security", "Exam Revision"]
            },
            {
                "name": "Cryptography",
                "subject": "Cryptography",
                "description": "Symmetric/Asymmetric encryption, digital signatures, hashing, and zero-knowledge proofs.",
                "color": "#0284C7",
                "icon": "lock",
                "topics": ["Module 1: AES & Symmetric Ciphers", "Module 2: RSA & PKI Infrastructure", "Module 3: Hash Functions & MAC", "Assignment Prep"]
            },
            {
                "name": "Network Security",
                "subject": "Network Security",
                "description": "Firewall rules, packet inspection, intrusion detection systems (IDS/IPS), and TLS handshakes.",
                "color": "#60A5FA",
                "icon": "shield",
                "topics": ["Module 1: TCP/IP Security", "Module 2: Firewalls & Packet Filtering", "Module 3: TLS/SSL Deep Dive", "Lab Exercises"]
            }
        ]

        for r_data in rooms_data:
            room = StudyRoom(
                name=r_data["name"],
                subject=r_data["subject"],
                description=r_data["description"],
                color=r_data["color"],
                icon=r_data["icon"],
                created_by_id=demo_user.id
            )
            db.add(room)
            db.commit()
            db.refresh(room)

            member = RoomMember(room_id=room.id, user_id=demo_user.id, role="admin")
            db.add(member)

            for idx, top_name in enumerate(r_data["topics"]):
                topic = RoomTopic(room_id=room.id, name=top_name, order_index=idx)
                db.add(topic)

        # Seed sample tasks & deadlines
        tasks_data = [
            {"title": "Review Cloud Security Module 3", "subject": "Cloud Security", "priority": "high", "estimated_minutes": 45, "is_completed": False},
            {"title": "Implement RSA Key Generation Algorithm", "subject": "Cryptography", "priority": "high", "estimated_minutes": 60, "is_completed": True},
            {"title": "Configure Snort IDS Rules for Packet Inspection", "subject": "Network Security", "priority": "medium", "estimated_minutes": 45, "is_completed": False},
            {"title": "Solve 10 Practice MCQs on IAM Role Policies", "subject": "Cloud Security", "priority": "medium", "estimated_minutes": 30, "is_completed": True}
        ]
        for t in tasks_data:
            task = StudyTask(user_id=demo_user.id, **t)
            db.add(task)

        # Deadlines
        now = datetime.datetime.utcnow()
        deadlines_data = [
            {"title": "Cloud Security Midterm Exam", "subject": "Cloud Security", "due_date": now + datetime.timedelta(days=2), "priority": "high"},
            {"title": "Cryptography Problem Set #3", "subject": "Cryptography", "due_date": now + datetime.timedelta(days=5), "priority": "high"},
            {"title": "Network Security Lab Submission", "subject": "Network Security", "due_date": now + datetime.timedelta(days=7), "priority": "medium"}
        ]
        for d in deadlines_data:
            dl = Deadline(user_id=demo_user.id, **d)
            db.add(dl)

        # Seed recent study sessions
        sessions_data = [
            {"subject": "Cloud Security", "duration_seconds": 3600, "xp_earned": 50, "started_at": now - datetime.timedelta(hours=3), "ended_at": now - datetime.timedelta(hours=2)},
            {"subject": "Cryptography", "duration_seconds": 2700, "xp_earned": 40, "started_at": now - datetime.timedelta(days=1, hours=2), "ended_at": now - datetime.timedelta(days=1, hours=1)},
            {"subject": "Network Security", "duration_seconds": 2400, "xp_earned": 35, "started_at": now - datetime.timedelta(days=2, hours=3), "ended_at": now - datetime.timedelta(days=2, hours=2)}
        ]
        for s in sessions_data:
            sess = StudySession(user_id=demo_user.id, **s)
            db.add(sess)

        db.commit()
