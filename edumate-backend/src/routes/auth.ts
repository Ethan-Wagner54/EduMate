import { Router } from 'express';
import {
    register,
    login,
    forgotPassword,
    resetPassword,
    verifyResetToken,
} from '../controllers/auth.controller';

const router = Router();

// =========================================================================
// Swagger Documentation Blocks
// =========================================================================

/**
 * @openapi
 * /auth/register:
 * post:
 * summary: Register a new user account.
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
 * description: User registered successfully.
 * '400':
 * description: Invalid input or email already in use.
 */
router.post('/register', register);

/**
 * @openapi
 * /auth/login:
 * post:
 * summary: Authenticate user and return JWT token.
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
 * description: Login successful.
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
 * name: { type: 'string' },
 * role: { type: 'string', enum: ['student', 'tutor', 'admin'] }
 * '401':
 * description: Invalid credentials.
 */
router.post('/login', login);

/**
 * @openapi
 * /auth/forgot-password:
 * post:
 * summary: Request a password reset link.
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
 * email: { type: 'string', format: 'email', description: 'Email address to send the reset link to.' }
 * responses:
 * '200':
 * description: Password reset email sent (if email exists).
 */
router.post('/forgot-password', forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 * post:
 * summary: Reset user's password using a token.
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
 * newPassword: { type: 'string', format: 'password', description: 'The new secure password.' }
 * responses:
 * '200':
 * description: Password successfully reset.
 * '400':
 * description: Invalid or expired token.
 */
router.post('/reset-password', resetPassword);

/**
 * @openapi
 * /auth/verify-reset-token/{token}:
 * get:
 * summary: Verify if a password reset token is valid.
 * tags:
 * - Authentication
 * parameters:
 * - in: path
 * name: token
 * schema:
 * type: string
 * required: true
 * description: The password reset token.
 * responses:
 * '200':
 * description: Token is valid.
 * '400':
 * description: Invalid or expired token.
 */
router.get('/verify-reset-token/:token', verifyResetToken);

export default router;