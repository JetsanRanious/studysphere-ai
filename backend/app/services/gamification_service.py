import datetime
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.user import User, UserProfile, UserStreak, Achievement, UserAchievement

class GamificationService:
    LEVEL_XP_MULTIPLIER = 100  # Level N requires N * 100 XP

    @staticmethod
    def calculate_level(xp: int) -> int:
        """Calculates user level from cumulative XP."""
        # Level 1: 0-100, Level 2: 101-300, Level 3: 301-600, etc.
        level = 1
        threshold = 100
        while xp >= threshold:
            level += 1
            threshold += level * 100
        return level

    @staticmethod
    def award_xp(db: Session, user: User, amount: int) -> Tuple[int, int, bool]:
        """
        Awards XP to the user, checks for level up, and returns (new_xp, new_level, did_level_up).
        """
        if not user.profile:
            user.profile = UserProfile(user_id=user.id, xp=0, level=1)
            db.add(user.profile)
            
        old_level = user.profile.level
        user.profile.xp += amount
        new_level = GamificationService.calculate_level(user.profile.xp)
        did_level_up = new_level > old_level
        user.profile.level = new_level
        
        db.commit()
        db.refresh(user.profile)
        
        # Check achievement unlocks
        GamificationService.check_achievements(db, user)
        
        return user.profile.xp, new_level, did_level_up

    @staticmethod
    def record_activity(db: Session, user: User) -> int:
        """
        Updates daily streak when user performs learning activities.
        """
        now = datetime.datetime.utcnow()
        today = now.date()
        
        if not user.streak:
            user.streak = UserStreak(user_id=user.id, current_streak=1, longest_streak=1, last_activity_date=now)
            db.add(user.streak)
            db.commit()
            return 1
            
        last_date = user.streak.last_activity_date.date() if user.streak.last_activity_date else None
        
        if last_date is None:
            user.streak.current_streak = 1
        elif last_date == today:
            # Already active today, streak unchanged
            pass
        elif last_date == today - datetime.timedelta(days=1):
            # Consecutive day! Increment streak
            user.streak.current_streak += 1
            if user.streak.current_streak > user.streak.longest_streak:
                user.streak.longest_streak = user.streak.current_streak
        else:
            # Streak broken
            user.streak.current_streak = 1
            
        user.streak.last_activity_date = now
        db.commit()
        db.refresh(user.streak)
        
        # Check streak achievements
        GamificationService.check_achievements(db, user)
        
        return user.streak.current_streak

    @staticmethod
    def check_achievements(db: Session, user: User) -> List[str]:
        """
        Checks eligibility and unlocks achievements.
        Returns list of newly unlocked achievement titles.
        """
        unlocked_now = []
        all_achievements = db.query(Achievement).all()
        existing_ids = set(
            ua.achievement_id for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user.id).all()
        )

        for ach in all_achievements:
            if ach.id in existing_ids:
                continue

            should_unlock = False
            
            if ach.code == "FIRST_SESSION" and len(user.study_sessions) >= 1:
                should_unlock = True
            elif ach.code == "5_SESSIONS" and len(user.study_sessions) >= 5:
                should_unlock = True
            elif ach.code == "3_DAY_STREAK" and user.streak and user.streak.current_streak >= 3:
                should_unlock = True
            elif ach.code == "7_DAY_STREAK" and user.streak and user.streak.current_streak >= 7:
                should_unlock = True
            elif ach.code == "DOC_MASTER" and len(user.documents) >= 3:
                should_unlock = True
            elif ach.code == "ROOM_CREATOR" and len(user.memberships) >= 1:
                should_unlock = True
            elif ach.code == "LEVEL_5" and user.profile and user.profile.level >= 5:
                should_unlock = True
            elif ach.code == "PLANNER_PRO" and len(user.study_plans) >= 1:
                should_unlock = True

            if should_unlock:
                ua = UserAchievement(user_id=user.id, achievement_id=ach.id)
                db.add(ua)
                if user.profile:
                    user.profile.xp += ach.xp_reward
                unlocked_now.append(ach.title)

        if unlocked_now:
            db.commit()

        return unlocked_now
