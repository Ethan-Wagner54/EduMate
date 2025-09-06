
// Extend Express Request to include authenticated user
declare namespace Express {
  export interface UserPayload {
    id: number;
    role: "student" | "tutor" | "admin";
  }
  export interface Request {
    user?: UserPayload;
  }
}
export {};
