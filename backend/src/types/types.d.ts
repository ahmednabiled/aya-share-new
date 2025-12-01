import * as express from "express";
import { IUser } from "../interfaces/types.ts";

declare global {
  namespace Express {
    interface User {
        id: string
        name: string
        email: string
        googleId: string
        videoCount: int
    }

    interface Request {
        User: IUser
    }
  }
}