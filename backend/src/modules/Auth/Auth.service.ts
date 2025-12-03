import { type Request, type Response, type NextFunction } from "express";
import config from "../../config/env.js";
import jwt from "jsonwebtoken";
import type { IUser, IToken } from "../../interfaces/types.js";
import prisma from "../../config/prisma.js";
import APIError from "../../utils/APIError.js";

export async function isAuth(req: Request, res: Response, next: NextFunction){
    const header = req.headers["authorization"];
    if(!header){
        return next(new APIError("Authorization header missing", 401));
    }

    if(!header.startsWith("Bearer ")){
        return next(new APIError("Invalid or missing Bearer token", 401));
    }

    const token = header.split(" ")[1];
    if(!token){
        return next(new APIError("Invalid or missing Bearer token", 401));
    }

    const decoded = jwt.verify(token, config.JWT_SECRET_KEY!) as IToken;
    const id = decoded.id;

    const user: IUser | null = await prisma.user.findUnique({
        where: {
            id: id
        }
    });

    if(!user){
        return next(new APIError("User not found", 404));
    }

    req.User = user;
    next();
}