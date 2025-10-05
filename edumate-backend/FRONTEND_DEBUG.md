# Frontend Network Error Debugging Guide

## The Problem
You're seeing "Network Error" when logging in as a tutor, specifically when trying to fetch modules and sessions.

## Quick Diagnostics

### 1. Run Backend Test Script
```bash
cd edumate-backend
chmod +x test-backend.sh
./test-backend.sh
```

This will verify:
- Backend is running on port 3000
- Endpoints are responding
- CORS headers are present

### 2. Browser Console Checks

#### A. Check what URL is being called
In the browser console (where you see the errors), look for the actual URL:
- Should see: `GET http://localhost:3000/modules`
- Should see: `GET http://localhost:3000/sessions?tutorId=5`

#### B. Check if requests are even sent
- Open DevTools > Network tab
- Filter by "Fetch/XHR"
- Look for `/modules` and `/sessions` requests
- **If you DON'T see them**: Frontend isn't sending requests
- **If you see them with status (failed)**: Connection issue
- **If you see them with CORS error**: CORS configuration problem

### 3. Check Frontend Environment

#### Open browser console and run:
```javascript
// Check if config is correct
console.log('API URL:', localStorage.getItem('VITE_API_URL') || 'http://localhost:3000');

// Check if token exists
console.log('Has token:', !!localStorage.getItem('token'));

// Check auth service
import authService from './src/services/auth/auth';
console.log('User ID:', authService.getUserId());
console.log('User Role:', authService.getUserRole());
```

## Common Causes & Solutions

###  1. **Axios Not Configured Properly**

**Symptom**: Network Error immediately, no actual HTTP request sent

**Solution**: Ensure axios is using the correct base URL

Check in browser console:
```javascript
import axios from 'axios';
console.log('Axios defaults:', axios.defaults.baseURL);
```

### 2. **Authentication Token Issues**

**Symptom**: Works for students but not tutors

**Possible Cause**: Token might be expired or invalid when tutor logs in

**Solution**: Check token in browser:
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);

// Decode token (check expiration)
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Expires:', new Date(payload.exp * 1000));
  console.log('Is expired:', Date.now() > payload.exp * 1000);
}
```

### 3. **Backend Not Responding**

**Symptom**: Request hangs then times out with "Network Error"

**Check**:
```bash
# Test if backend is responsive
curl http://localhost:3000/health

# Check backend logs
# Look for any errors when tutor logs in
```

### 4. **CORS Preflight Failure**

**Symptom**: Browser console shows CORS error before Network Error

**Solution**: Already fixed in backend, but verify:
```bash
curl -I -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     http://localhost:3000/modules
```

Should return headers like:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Credentials: true
```

### 5. **Request Interceptor Issues**

**Symptom**: Requests work in curl but not in browser

**Possible Cause**: Axios interceptor might be rejecting requests

**Check**: Look in `edumate-frontend/src/config/axios.js`
- Make sure interceptor isn't blocking requests
- Check if auth header is being added correctly

### 6. **Browser Extensions**

**Symptom**: Works in incognito mode but not regular mode

**Solution**: Disable browser extensions (especially ad blockers, privacy extensions)

##  Most Likely Solutions

Based on your screenshot showing it works for students but not tutors, try these first:

### Solution 1: Clear Browser Storage and Re-login
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
// Then refresh and login again
```

### Solution 2: Check if Backend is Actually Receiving Requests

Add this to your backend to see all incoming requests:

In `src/app.ts`, find the line with `app.use(requestLogger);` and check if you see tutor requests in backend console.

### Solution 3: Try Direct Axios Call

In the browser console where you're logged in as tutor:
```javascript
import axios from 'axios';

// Test modules endpoint
axios.get('http://localhost:3000/modules')
  .then(res => console.log('Modules:', res.data))
  .catch(err => console.error('Error:', err));

// Test with auth header
const token = localStorage.getItem('token');
axios.get('http://localhost:3000/sessions', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(res => console.log('Sessions:', res.data))
  .catch(err => console.error('Error:', err));
```

## Quick Fix to Try

If everything else fails, try restarting both servers:

1. **Stop backend** (Ctrl+C in backend terminal)
2. **Stop frontend** (Ctrl+C in frontend terminal)
3. **Clear all processes on port 3000**:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```
4. **Clear all processes on port 5173**:
   ```bash
   lsof -ti:5173 | xargs kill -9
   ```
5. **Start backend** again
6. **Start frontend** again
7. **Clear browser cache** (Cmd+Shift+R on Mac)
8. **Try logging in as tutor** again

## Still Not Working?

If after all this it still doesn't work, run these commands and share the output:

```bash
# In backend terminal
cd edumate-backend
./test-backend.sh

# Check what backend shows when you try to login as tutor
# Look for any error messages or failed requests

# In browser console (when logged in as tutor)
console.log('Config:', {
  apiUrl: 'http://localhost:3000',
  token: !!localStorage.getItem('token'),
  userId: localStorage.getItem('userId'),
  role: localStorage.getItem('userRole')
});
```

Share the backend terminal output and browser console output.