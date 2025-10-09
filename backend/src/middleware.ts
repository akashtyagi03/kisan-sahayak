import { NextFunction, Request, Response } from "express";
import jwt  from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }
    const token = authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({ error: "Token missing" });
    }
    
    try {
        if (!process.env.JWT_SECRET) {
            // This is a server error, not a client one, so we log it and throw.
            console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
            throw new Error("Server configuration error.");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // how to override the type of the express request object
        //@ts-ignore
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ error: "Invalid token" });
    }
}