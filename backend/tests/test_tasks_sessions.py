import datetime

def test_tasks_and_study_sessions(client):
    auth_res = client.post("/api/auth/demo-login", json={"email": "tasktester@studysphere.ai", "full_name": "Task Tester"})
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create task
    task_res = client.post("/api/tasks", json={
        "title": "Study Raft Consensus Algorithm",
        "subject": "Distributed Systems",
        "priority": "high",
        "estimated_minutes": 60
    }, headers=headers)
    assert task_res.status_code == 200
    task_id = task_res.json()["id"]

    # Complete task
    update_res = client.put(f"/api/tasks/{task_id}", json={"is_completed": True}, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["is_completed"] is True

    # Record study session
    now = datetime.datetime.utcnow()
    sess_res = client.post("/api/study-sessions", json={
        "subject": "Distributed Systems",
        "duration_seconds": 1800,
        "notes": "Studied leader election and log replication.",
        "started_at": (now - datetime.timedelta(minutes=30)).isoformat(),
        "ended_at": now.isoformat()
    }, headers=headers)
    assert sess_res.status_code == 200
    assert sess_res.json()["xp_earned"] > 0

    # Check analytics
    analytics_res = client.get("/api/analytics", headers=headers)
    assert analytics_res.status_code == 200
    adata = analytics_res.json()
    assert adata["tasks_completed_count"] >= 1
