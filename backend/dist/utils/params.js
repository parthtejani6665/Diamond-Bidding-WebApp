"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIdParam = void 0;
const parseIdParam = (value) => {
    if (typeof value !== "string")
        return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0)
        return null;
    return n;
};
exports.parseIdParam = parseIdParam;
//# sourceMappingURL=params.js.map