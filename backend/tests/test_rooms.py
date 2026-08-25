def test_rooms_crud(client):
    # Login
    auth_res = client.post("/api/auth/demo-login", json={"email": "roomtester@studysphere.ai", "full_name": "Room Tester"})
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Room
    create_res = client.post("/api/rooms", json={
        "name": "Distributed Systems",
        "description": "Consensus protocols, Raft, Paxos",
        "subject": "Distributed Systems",
        "color": "#3B82F6",
        "initial_topics": ["Raft", "Paxos", "MapReduce"]
    }, headers=headers)
    assert create_res.status_code == 200
    room_data = create_res.json()
    assert room_data["name"] == "Distributed Systems"
    assert len(room_data["topics"]) == 3
    room_id = room_data["id"]

    # Get Room Detail
    get_res = client.get(f"/api/rooms/{room_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Distributed Systems"

    # Add topic
    topic_res = client.post(f"/api/rooms/{room_id}/topics", json={"name": "Vector Clocks"}, headers=headers)
    assert topic_res.status_code == 200
    assert topic_res.json()["name"] == "Vector Clocks"
