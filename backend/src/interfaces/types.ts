import { type JwtPayload } from "jsonwebtoken";

export interface IToken extends JwtPayload {
  id: string;
}

export interface IUser {
  id: string
  name: string
  email: string
  googleId: string
  videoCount: number
}