"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const JWT_SECRET = (process.env.JWT_SECRET || "dev_jwt_secret");
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const signToken = (payload) => {
    return (0, jsonwebtoken_1.sign)(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
exports.signToken = signToken;
const verifyToken = (token) => {
    return (0, jsonwebtoken_1.verify)(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=jwt.js.map