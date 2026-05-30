import requests
import uuid
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Credentials for test investor user
INVESTOR_EMAIL = "testinvestor@example.com"
INVESTOR_PASSWORD = "StrongPass!23"
INVESTOR_FULL_NAME = "Test Investor"

# Credentials for test founder user to create a project
FOUNDER_EMAIL = "testfounder@example.com"
FOUNDER_PASSWORD = "StrongPass!23"
FOUNDER_FULL_NAME = "Test Founder"

def register_user(email, password, full_name, role):
    url = f"{BASE_URL}/api/auth/register"
    payload = {
        "email": email,
        "password": password,
        "full_name": full_name,
        "role": role
    }
    resp = requests.post(url, json=payload, timeout=TIMEOUT)
    if resp.status_code == 409 and resp.json().get("error") == "email already exists":
        # User already exists, treat as success
        return True
    resp.raise_for_status()
    return True

def login_user(email, password):
    url = f"{BASE_URL}/api/auth/login"
    payload = {"email": email, "password": password}
    resp = requests.post(url, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    if "access_token" not in data:
        raise Exception("Login response missing access_token")
    return data["access_token"]

def create_project(token):
    url = f"{BASE_URL}/api/projects"
    headers = {"Authorization": f"Bearer {token}"}
    # Minimal valid project data
    payload = {
        "title": f"Test Project {uuid.uuid4()}",
        "category": "SaaS",
        "description": "Test project description",
        "funding_goal": 50000,
        "min_invest": 1000
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    project_id = data.get("projectId") or data.get("id")
    if not project_id:
        raise Exception("Project creation response missing projectId")
    return project_id

def delete_project(token, project_id):
    url = f"{BASE_URL}/api/projects/{project_id}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    # Accept 200, 204, or 404 (already deleted) as valid
    if resp.status_code not in (200, 204, 404):
        resp.raise_for_status()

def delete_investment(token, investment_id):
    # Not specified in PRD if deletion endpoint exists
    # If it exists, implement here, else skip
    # Skipping deletion as no API present in PRD
    pass

def test_post_api_invest_create_new_investment_record():
    # Register/login founder to create a project
    try:
        register_user(FOUNDER_EMAIL, FOUNDER_PASSWORD, FOUNDER_FULL_NAME, "founder")
    except requests.HTTPError as e:
        # Allow if already exists
        if e.response.status_code != 409:
            raise
    
    founder_token = login_user(FOUNDER_EMAIL, FOUNDER_PASSWORD)

    # Register/login investor to perform investment
    try:
        register_user(INVESTOR_EMAIL, INVESTOR_PASSWORD, INVESTOR_FULL_NAME, "investor")
    except requests.HTTPError as e:
        if e.response.status_code != 409:
            raise
    investor_token = login_user(INVESTOR_EMAIL, INVESTOR_PASSWORD)

    # Create project to invest in
    project_id = create_project(founder_token)

    investment_id = None
    try:
        url = f"{BASE_URL}/api/invest"
        headers = {"Authorization": f"Bearer {investor_token}", "Content-Type": "application/json"}
        payload = {
            "projectId": project_id,
            "amount": 5000,  # within allowed range 1000 - 10,000,000
            "notes": "Test investment"
        }
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Expected 201 Created but got {resp.status_code}"
        data = resp.json()
        # Validate response structure and fields
        assert data.get("success") is True, "Response success flag is not True"
        invest_data = data.get("data")
        assert invest_data is not None, "Response missing 'data' field"
        assert "investmentId" in invest_data and invest_data["investmentId"], "Missing investmentId"
        assert invest_data.get("projectId") == project_id, "projectId mismatch"
        assert invest_data.get("amount") == 5000, "amount mismatch"
        assert invest_data.get("status") == "pending", f"Expected status 'pending', got {invest_data.get('status')}"
        # stripeSessionId presence
        assert "stripeSessionId" in invest_data, "stripeSessionId missing in response data"
        investment_id = invest_data["investmentId"]

    finally:
        # Cleanup: delete the investment if possible - no API found, so skip

        # Delete project created for test
        delete_project(founder_token, project_id)

test_post_api_invest_create_new_investment_record()