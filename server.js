import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import multer from "multer";
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
}

// Ensure "uploads" directory exists (Important for Render)
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Created 'uploads' directory");
}

const app = express();

// Updated CORS to be more permissive
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Nodemailer transporter (Check credentials)
console.log("📧 Configuring transporter with:", process.env.EMAIL ? "Email Found" : "Email Missing");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Transporter verification error:", error.message);
  } else {
    console.log("✅ Transporter is ready to send emails");
  }
});

/* CONTACT FORM - Book Appointment */
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log("📩 Contact request from:", email);

  try {
    if (!process.env.EMAIL || !process.env.PASS) {
      throw new Error("Missing email credentials in environment variables");
    }

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: `New Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage:\n${message}`,
    });
    console.log("✅ Contact email sent!");
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Contact error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* CAREER FORM - Apply */
app.post("/api/career", upload.single("resume"), async (req, res) => {
  const { firstName, lastName, email, phone, job, message } = req.body;
  console.log("📩 Career request from:", email);

  try {
    if (!process.env.EMAIL || !process.env.PASS) {
      throw new Error("Missing email credentials in environment variables");
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume is required" });
    }

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: `New Application: ${firstName} ${lastName} (${job})`,
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
    console.error("❌ Career error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});