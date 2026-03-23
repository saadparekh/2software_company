import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

/* CONTACT FORM */
app.post("/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Contact Message",
      text: `
Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}
      `,
    });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});

/* CAREER FORM */
app.post("/career", upload.single("resume"), async (req, res) => {
  const { firstName, lastName, email, phone, job, message } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Job Application",
      text: `
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Position: ${job}

Message:
${message}
      `,
      attachments: [
        {
          filename: req.file.originalname,
          path: req.file.path,
        },
      ],
    });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});