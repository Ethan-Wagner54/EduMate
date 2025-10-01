#!/bin/bash

# Ensure jq is installed
if ! command -v jq &> /dev/null
then
    echo "jq could not be found. Please install jq: brew install jq"
    exit
fi

BASE_URL="http://localhost:3000"

# Function to check if server is up
check_server() {
  echo "Checking if server is running at $BASE_URL..."
  for i in {1..10}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
    if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 600 ]; then
      echo "Server is up!"
      return 0
    fi
    echo "Server not ready yet... retrying in 2s"
    sleep 2
  done
  echo "Server did not respond. Make sure it is running!"
  exit 1
}

# Function to check DB connection via Prisma endpoint (optional)
check_db() {
  echo "Checking database connection..."
  DB_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" || echo "0")
  if [ "$DB_HEALTH" -ne 200 ]; then
    echo "Database or backend not ready. Ensure PostgreSQL is running and migrations are applied."
    exit 1
  fi
  echo "Database connection looks good!"
}

# Run checks
check_server
# Optional: if you have a /health endpoint uncomment this line
# check_db

echo
echo "=== STEP 1: Login as Tutor ==="
TUTOR_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"tutor@edumate.com","password":"TutorPass123"}' | jq -r '.token')

if [ "$TUTOR_TOKEN" = "null" ]; then
  echo "Failed to login as tutor. Check credentials or server logs."
  exit 1
fi

echo "Tutor token: $TUTOR_TOKEN"

echo
echo "=== STEP 2: Create New Session (Tutor) ==="
SESSION_JSON=$(curl -s -X POST "$BASE_URL/sessions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TUTOR_TOKEN" \
  -d '{
    "moduleId": 1,
    "startTime": "2025-10-01T14:00:00.000Z",
    "endTime": "2025-10-01T15:00:00.000Z",
    "location": "Virtual Meeting Room 1",
    "capacity": 20
  }')

SESSION_ID=$(echo "$SESSION_JSON" | jq -r '.id')
if [ "$SESSION_ID" = "null" ]; then
  echo "Failed to create session. Check server logs."
  exit 1
fi

echo "Created session with ID: $SESSION_ID"
echo "Session details: $SESSION_JSON"

echo
echo "=== STEP 3: Login as Student ==="
STUDENT_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@edumate.com","password":"Student1Pass123"}' | jq -r '.token')

if [ "$STUDENT_TOKEN" = "null" ]; then
  echo "Failed to login as student. Check credentials or server logs."
  exit 1
fi

echo "Student token: $STUDENT_TOKEN"

echo
echo "=== STEP 4: List Available Sessions ==="
curl -s "$BASE_URL/sessions" | jq

echo
echo "=== STEP 5: Join the Session (Student) ==="
JOIN_JSON=$(curl -s -X POST "$BASE_URL/sessions/$SESSION_ID/join" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
echo "Join response: $JOIN_JSON"

echo
echo "=== STEP 6: Leave the Session (Student) ==="
LEAVE_JSON=$(curl -s -X POST "$BASE_URL/sessions/$SESSION_ID/leave" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
echo "Leave response: $LEAVE_JSON"

echo
echo "=== ALL STEPS COMPLETED SUCCESSFULLY ==="
