import multer from "multer";
import fs from "fs";
import path from "path";

/** --- Circular Upload (for Competitions) --- **/
const circularPath = "uploads/circulars";
if (!fs.existsSync(circularPath))
  fs.mkdirSync(circularPath, { recursive: true });

const circularStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, circularPath),
  filename: (req, file, cb) =>
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ),
});

const circularFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (extname) cb(null, true);
  else cb(new Error("Only PDF, DOC, DOCX files are allowed!"));
};

export const uploadCircular = multer({
  storage: circularStorage,
  fileFilter: circularFileFilter,
});

/** --- Aadhar Upload (for Athlete Registration) --- **/
const aadharPath = "uploads/aadhar";
if (!fs.existsSync(aadharPath)) fs.mkdirSync(aadharPath, { recursive: true });

const aadharStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, aadharPath),
  filename: (req, file, cb) =>
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ),
});

const aadharFileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase() === ".pdf";
  if (extname) cb(null, true);
  else cb(new Error("Only PDF files are allowed for Aadhar!"));
};

export const uploadAadhar = multer({
  storage: aadharStorage,
  fileFilter: aadharFileFilter,
});
