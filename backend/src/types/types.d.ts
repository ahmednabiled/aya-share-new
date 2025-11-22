import * as express from "express";

declare global {
  namespace Express {
    interface User {
        id: string
        name: string
        email: string
        googleId: string
        videoCount: int
    }
  }
}