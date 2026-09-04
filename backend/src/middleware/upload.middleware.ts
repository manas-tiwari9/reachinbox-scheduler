import multer from 'multer';

// Multer configuration for handling file uploads in memory
const storage = multer.memoryStorage();

// File filter to allow only CSV or TXT
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'text/csv' || file.mimetype === 'text/plain' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV or TXT files are allowed'));
  }
};

export const uploadCSV = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});
