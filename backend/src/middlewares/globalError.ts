import type { Request, Response } from "express";
import config from "../config/env.js";

export const notFound = (req: Request, res: Response) => {
    res.status(404).json({
        status: "Failed",
        message: "Route: " + req.originalUrl + " not found"
    })
}

export const globalError = (error: any, req: Request, res: Response) => {
    const response = {
    status: error.status,
    message: error.message,
    stack: error.stack,
    error,
  };

  if (config.MODE === "production") {
    response.stack = undefined;
    response.error = undefined;
  }
  res.status(error.statusCode || 500).json(response);
}