# EduMate API - End-to-End Testing Guide

This guide walks through a complete user flow: a tutor creates a session, and a student finds, joins, and then leaves that session.

## Prerequisites

- The backend server is running (`npm run dev`)
- The database has been seeded with test data (`npx prisma db seed`)
- You have an API client like **Postman**

## Step 1: Log in as a Tutor

First, get an authentication token for the seeded tutor user.

* **Method:** `POST`
* **URL:** `http://localhost:3000/auth/login`
* **Body (raw, JSON):**
    ```json
    {
      "email": "tutor@edumate.com",
      "password": "TutorPass123"
    }
    ```
* **Action:** Copy the `token` from the response. We'll call this the **TUTOR_TOKEN**.

## Step 2: Create a New Session

Now, use the tutor's token to create a new session for the "Software Engineering" module (which has `moduleId: 1`).

* **Method:** `POST`
* **URL:** `http://localhost:3000/sessions`
* **Authorization:** Set to **Bearer Token** and paste your **TUTOR_TOKEN**
* **Body (raw, JSON):**
    ```json
    {
      "moduleId": 1,
      "startTime": "2025-10-01T14:00:00.000Z",
      "endTime": "2025-10-01T15:00:00.000Z",
      "location": "Virtual Meeting Room 1",
      "capacity": 20
    }
    ```
* **Action:** You'll get a `201 Created` response with the new session object. Note the `id` of this session for the next steps. Let's assume the new session `id` is **`1`**.

## Step 3: Log in as a Student

Next, get an authentication token for one of the seeded student users.

* **Method:** `POST`
* **URL:** `http://localhost:3000/auth/login`
* **Body (raw, JSON):**
    ```json
    {
      "email": "student1@edumate.com",
      "password": "Student1Pass123"
    }
    ```
* **Action:** Copy the `token` from the response. We'll call this the **STUDENT_TOKEN**.

## Step 4: List Available Sessions

As a student, you'll want to see what sessions are available. This is a public endpoint, so no token is needed.

* **Method:** `GET`
* **URL:** `http://localhost:3000/sessions`
* **Action:** You should see a `200 OK` response with a list of sessions, including the one our tutor just created.

## Step 5: Join the Session

Now, use the student's token to join the session the tutor created.

* **Method:** `POST`
* **URL:** `http://localhost:3000/sessions/1/join` (replace `1` with your session's ID)
* **Authorization:** Set to **Bearer Token** and paste your **STUDENT_TOKEN**
* **Action:** You should get a `200 OK` response with `{ "ok": true }`.

## Step 6: Leave the Session

Student leaves the session.

* **Method:** `POST`
* **URL:** `http://localhost:3000/sessions/1/leave` (replace `1` with your session's ID)
* **Authorization:** Set to **Bearer Token** and paste your **STUDENT_TOKEN**
* **Action:** You should get a `200 OK` response with `{ "ok": true }`.