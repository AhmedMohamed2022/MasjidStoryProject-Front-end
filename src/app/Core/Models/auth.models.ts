// src/app/core/models/auth.models.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  userId: string;
  roles: string[];
}

export interface User {
  email: string;
  fullName: string;
  userId: string;
  roles: string[];
}

export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
}
