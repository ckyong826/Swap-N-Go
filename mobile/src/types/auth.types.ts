export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  phone_number: string;
  password: string;
  pin: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserInfo;
}

export interface RegisterResponse {
  message: string;
}
