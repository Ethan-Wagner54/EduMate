#!/bin/bash

echo "=========================================="
echo "EduMate Backend Diagnostics"
echo "=========================================="
echo ""

# Check if backend is running
echo "1. Checking if backend is running on port 3000..."
if lsof -i:3000 > /dev/null 2>&1; then
    echo "✅ Backend is running on port 3000"
    lsof -i:3000 | grep LISTEN
else
    echo "❌ Backend is NOT running on port 3000"
    echo "   Start it with: npm run dev"
    exit 1
fi

echo ""
echo "2. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/health 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health endpoint working: $RESPONSE_BODY"
else
    echo "❌ Health endpoint failed (HTTP $HTTP_CODE)"
    echo "   Response: $RESPONSE_BODY"
fi

echo ""
echo "3. Testing modules endpoint..."
MODULES_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/modules 2>&1)
HTTP_CODE=$(echo "$MODULES_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Modules endpoint working"
    echo "   Found $(echo "$MODULES_RESPONSE" | head -n-1 | grep -o '"id"' | wc -l | tr -d ' ') modules"
else
    echo "❌ Modules endpoint failed (HTTP $HTTP_CODE)"
fi

echo ""
echo "4. Testing sessions endpoint..."
SESSIONS_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/sessions 2>&1)
HTTP_CODE=$(echo "$SESSIONS_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Sessions endpoint working"
    echo "   Found $(echo "$SESSIONS_RESPONSE" | head -n-1 | grep -o '"id"' | wc -l | tr -d ' ') sessions"
else
    echo "❌ Sessions endpoint failed (HTTP $HTTP_CODE)"
fi

echo ""
echo "5. Checking CORS headers..."
CORS_RESPONSE=$(curl -s -I -H "Origin: http://localhost:5173" http://localhost:3000/health 2>&1)
if echo "$CORS_RESPONSE" | grep -i "access-control-allow" > /dev/null; then
    echo "✅ CORS headers present"
    echo "$CORS_RESPONSE" | grep -i "access-control"
else
    echo "⚠️  CORS headers might be missing"
fi

echo ""
echo "6. Testing with authentication (if you have a token)..."
echo "   To test with auth, run:"
echo "   curl -H 'Authorization: Bearer YOUR_TOKEN' http://localhost:3000/sessions"

echo ""
echo "=========================================="
echo "Diagnostic complete"
echo "=========================================="
