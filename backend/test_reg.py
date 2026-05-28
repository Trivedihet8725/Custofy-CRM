import requests

try:
    url = "http://localhost:8002/api/auth/register"
    data = {
        "email": "test4_unique@example.com",
        "password": "Password123",
        "name": "Test User"
    }
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
