"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diamondImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uploadRoot = path_1.default.resolve(process.cwd(), "uploads", "diamonds");
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadRoot);
    },
    filename: (_req, file, cb) => {
        const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const ext = path_1.default.extname(safeOriginal) || "";
        const base = path_1.default.basename(safeOriginal, ext);
        cb(null, `${Date.now()}-${base}${ext}`);
    },
});
exports.diamondImageUpload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
//# sourceMappingURL=upload.js.map