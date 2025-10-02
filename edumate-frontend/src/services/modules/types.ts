/**
 * Module service related type definitions
 */

/**
 * Module interface representing a university module/course
 */
export interface Module {
  id: number;
  code: string;
  name: string;
  faculty?: string;
}

/**
 * Response from the modules API
 */
export interface ModulesResponse {
  success: boolean;
  data?: Module[];
  error?: string;
  message?: string;
}