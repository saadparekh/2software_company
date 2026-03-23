import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import multer from "multer";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Manual .env loading (dotenv v17 fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex > -1) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        process.env[key] = value;
      }
    }
  });
  console.log("✅ .env loaded — EMAIL:", process.env.EMAIL ? "SET" : "MISSING");
}

const app = express();
app.use(cors());
app.use(express.json());

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

/* CONTACT FORM - Book Appointment */
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log("📩 Contact form received:", { name, email, phone });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Contact Message",
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage:\n${message}`,
    });
    console.log("✅ Contact email sent!");
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Contact email error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* CAREER FORM - Apply */
app.post("/api/career", upload.single("resume"), async (req, res) => {
  const { firstName, lastName, email, phone, job, message } = req.body;
  console.log("📩 Career form received:", { firstName, lastName, email, job });
  console.log("📎 Resume file:", req.file ? req.file.originalname : "NOT UPLOADED");

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Resume is required" });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Job Application",
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nPosition: ${job}\nMessage:\n${message}`,
      attachments: [
        {
          filename: req.file.originalname,
          path: req.file.path,
        },
      ],
    });
    console.log("✅ Career email sent!");
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Career email error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));