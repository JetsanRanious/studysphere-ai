def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "StudySphere" in data["app"]

def test_demo_login(client):
    res = client.post("/api/auth/demo-login", json={"email": "tester@studysphere.ai", "full_name": "Test Student"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Test Student"
