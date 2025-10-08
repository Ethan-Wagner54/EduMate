const axios = require('axios');

// Configuration - update these values as needed
const config = {
  baseURL: 'http://localhost:3000', // Update to your backend URL
  testSessionId: 1, // Update to an existing session ID
  studentToken: 'your_student_jwt_token_here' // Update with actual student JWT token
};

async function testJoinSession() {
  try {
    console.log('Testing joinSession API endpoint...');
    console.log(`Session ID: ${config.testSessionId}`);
    console.log(`Base URL: ${config.baseURL}`);
    
    const response = await axios.post(
      `${config.baseURL}/sessions/${config.testSessionId}/join`,
      {}, // Empty body
      {
        headers: {
          'Authorization': `Bearer ${config.studentToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('SUCCESS: Join session response:', response.status, response.data);
    
  } catch (error) {
    console.error('ERROR: Join session failed');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

async function getAuthTokenForTesting() {
  try {
    console.log('\nTrying to get auth token for testing...');
    
    // Try to login as a student to get a token
    const loginResponse = await axios.post(
      `${config.baseURL}/auth/login`,
      {
        email: 'student1@edumate.com', // Test student from seed data
        password: 'StudentPass123!'     // Test password from seed data
      }
    );
    
    if (loginResponse.data.token) {
      console.log('Got auth token successfully');
      return loginResponse.data.token;
    } else {
      console.log('Login response:', loginResponse.data);
      return null;
    }
    
  } catch (error) {
    console.error('Failed to get auth token:', error.response?.data || error.message);
    return null;
  }
}

async function listAvailableSessions() {
  try {
    console.log('\nListing available sessions...');
    
    const response = await axios.get(`${config.baseURL}/sessions`);
    
    console.log('Available sessions:');
    response.data.forEach(session => {
      console.log(`- Session ID: ${session.id}, Course: ${session.course}, Title: ${session.title}`);
    });
    
    return response.data;
    
  } catch (error) {
    console.error('Failed to list sessions:', error.response?.data || error.message);
    return [];
  }
}

async function main() {
  console.log('=== Join Session Test Script ===\n');
  
  // First, list available sessions
  const sessions = await listAvailableSessions();
  
  // If no token provided, try to get one
  if (config.studentToken === 'your_student_jwt_token_here') {
    console.log('\nNo token provided, attempting to get one...');
    const token = await getAuthTokenForTesting();
    if (token) {
      config.studentToken = token;
      console.log('Token obtained successfully');
    } else {
      console.log('Could not get token. Please update the script with:');
      console.log('1. A valid student JWT token');
      console.log('2. Valid test student credentials');
      console.log('3. Correct backend URL');
      return;
    }
  }
  
  // Use first available session if no specific session ID set
  if (config.testSessionId === 1 && sessions.length > 0) {
    config.testSessionId = sessions[0].id;
    console.log(`Using session ID: ${config.testSessionId}`);
  }
  
  // Test the join session endpoint
  await testJoinSession();
}

// Run the test
main().catch(console.error);