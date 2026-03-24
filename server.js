import express from "express";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { Resend } from "resend";

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

// Resend client (HTTP-based, works on Render free tier)
const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = process.env.TO_EMAIL || "themastek.co@gmail.com";

// Ensure "uploads" directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const app = express();
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    resend_configured: !!process.env.RESEND_API_KEY,
    time: new Date().toISOString(),
  });
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* CONTACT FORM */
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  try {
    const { error } = await resend.emails.send({
      from: "Mastek Contact <onboarding@resend.dev>",
      to: [TO_EMAIL],
      subject: `New Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage:\n${message}`,
    });
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Contact error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* CAREER FORM */
app.post("/api/career", upload.single("resume"), async (req, res) => {
  const { firstName, lastName, email, phone, job, message } = req.body;
  try {
    if (!req.file) throw new Error("Resume required");

    // Read the uploaded file as base64
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileBase64 = fileBuffer.toString("base64");

    const { error } = await resend.emails.send({
      from: "Mastek Careers <onboarding@resend.dev>",
      to: [TO_EMAIL],
      subject: `New Application: ${firstName} ${lastName}`,
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\nPosition: ${job}\nMessage:\n${message}`,
      attachments: [
        {
          filename: req.file.originalname,
          content: fileBase64,
        },
      ],
    });
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Career error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));