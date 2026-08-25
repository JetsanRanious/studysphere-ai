def test_sudoku_service(client):
    # Generate board
    gen_res = client.post("/api/games/sudoku/generate", json={"difficulty": "easy"})
    assert gen_res.status_code == 200
    data = gen_res.json()
    assert len(data["initial_board"]) == 9
    assert len(data["solution"]) == 9

    # Request hint
    hint_res = client.post("/api/games/sudoku/hint", json={
        "board": data["initial_board"],
        "initial_board": data["initial_board"]
    })
    assert hint_res.status_code == 200
    hint_data = hint_res.json()
    assert "explanation" in hint_data
    assert "technique" in hint_data
    assert 1 <= hint_data["value"] <= 9

def test_ai_plan_and_chat(client):
    auth_res = client.post("/api/auth/demo-login", json={"email": "aitester@studysphere.ai", "full_name": "AI Tester"})
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Generate Study Plan
    plan_res = client.post("/api/ai/study-plan", json={
        "prompt": "Prepare for Cloud Security and Cryptography exams in 7 days",
        "available_daily_hours": 4.0
    }, headers=headers)
    assert plan_res.status_code == 200
    plan_data = plan_res.json()
    assert len(plan_data["tasks"]) > 0

    # Chat with AI
    chat_res = client.post("/api/ai/chat", json={
        "message": "Explain IAM Least Privilege and RBAC roles"
    }, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert len(chat_data["response"]) > 20
