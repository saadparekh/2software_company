import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

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

/* CONTACT FORM */
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Contact Message",
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage:\n${message}`,
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* CAREER FORM */
app.post("/api/career", upload.single("resume"), async (req, res) => {
  const { firstName, lastName, email, contactNumber, jobTitle, message } = req.body;

  if (!req.file) return res.status(400).json({ success: false, message: "Resume is required" });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Job Application",
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${contactNumber}\nPosition: ${jobTitle}\nMessage:\n${message}`,
      attachments: [
        {
          filename: req.file.originalname,
          path: req.file.path,
        },
      ],
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));