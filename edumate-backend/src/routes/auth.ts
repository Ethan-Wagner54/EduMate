import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import {
    requestPasswordReset,
    resetPassword,
    verifyResetToken
} from "../controllers/passwordReset.controller";

const router = Router();

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /auth/register:
 * post:
 * summary: Registers a new user with default 'student' role.
 * tags:
 * - Authentication
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * - name
 * properties:
 * email: { type: 'string', format: 'email', description: 'User\'s email address (must be unique).' },
 * password: { type: 'string', format: 'password', description: 'User\'s secure password (min 8 chars).' },
 * name: { type: 'string', description: 'User\'s full name.' }
 * responses:
 * '201':
 * description: Registration successful. Returns user ID and role.
 * '400':
 * description: Invalid input or email already exists.
 */
router.post("/register", register);

/**
 * @openapi
 * /auth/login:
 * post:
 * summary: Authenticates a user and returns an access token.
 * tags:
 * - Authentication
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email: { type: 'string', format: 'email', description: 'User\'s email address.' },
 * password: { type: 'string', format: 'password', description: 'User\'s password.' }
 * responses:
 * '200':
 * description: Login successful. Returns the JWT access token and user info.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * token: { type: 'string', description: 'JWT access token for protected routes.' },
 * user:
 * type: object
 * properties:
 * id: { type: 'string' },
 * role: { type: 'string', enum: ['student', 'tutor', 'admin'] },
 * email: { type: 'string' }
 * '401':
 * description: Invalid credentials.
 * '403':
 * description: Account deactivated.
 */
router.post("/login", login);

/**
 * @openapi
 * /auth/forgot-password:
 * post:
 * summary: Requests a password reset token to be sent to the user's email.
 * tags:
 * - Authentication
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * properties:
 * email: { type: 'string', format: 'email', description: 'The email address associated with the account.' }
 * responses:
 * '200':
 * description: Password reset link sent if the email is registered.
 * '404':
 * description: User not found.
 */
router.post("/forgot-password", requestPasswordReset);

/**
 * @openapi
 * /auth/reset-password:
 * post:
 * summary: Resets the password using a valid token and sets a new password.
 * tags:
 * - Authentication
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - token
 * - newPassword
 * properties:
 * token: { type: 'string', description: 'The unique reset token received via email.' },
 * newPassword: { type: 'string', format: 'password', description: 'The new password for the account.' }
 * responses:
 * '200':
 * description: Password successfully reset.
 * '400':
 * description: Invalid or expired token, or password format invalid.
 */
router.post("/reset-password", resetPassword);

/**
 * @openapi
 * /auth/verify-reset-token/{token}:
 * get:
 * summary: Verifies the validity and expiration of a password reset token.
 * tags:
 * - Authentication
 * parameters:
 * - in: path
 * name: token
 * schema:
 * type: string
 * required: true
 * description: The password reset token to verify.
 * responses:
 * '200':
 * description: Token is valid.
 * '400':
 * description: Invalid or expired token.
 */
router.get("/verify-reset-token/:token", verifyResetToken);

export default router;