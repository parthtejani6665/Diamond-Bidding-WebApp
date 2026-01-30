import multer from "multer";
import path from "path";

const uploadRoot = path.resolve(process.cwd(), "uploads", "diamonds");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const ext = path.extname(safeOriginal) || "";
    const base = path.basename(safeOriginal, ext);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

export const diamondImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

