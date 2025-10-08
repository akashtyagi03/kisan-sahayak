"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var authMiddleware = function (req, res, next) {
    var authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header missing" });
    }
    try {
        var decoded = jsonwebtoken_1.default.verify(authHeader, typeof process.env.JWT_SECRET);
        // how to override the type of the express request object
        //@ts-ignore
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(401).json({ error: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=middleware.js.map