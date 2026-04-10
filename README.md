# ⚙️ Mastek Innovation – Backend

This is the backend server for the **Mastek Innovation** website built using **Node.js + Express**. It handles contact form submissions and job applications with email functionality.

## 🚀 Live API

🔗 [backend api](https://mastek-backend-new.onrender.com)

## 🔗 Frontend Repository

👉 [live link](https://onesoftware-company-1.onrender.com)

## 🛠️ Tech Stack

* Node.js
* Express.js
* Nodemailer
* Multer (File Upload)
* dotenv
* CORS

## 📂 Features

* Contact form API (send emails)
* Career application API with resume upload
* File handling using Multer
* Secure environment variables using dotenv
* Gmail SMTP integration via Nodemailer

## 📁 API Endpoints

### 📩 Contact API

POST `/contact`

**Body:**

```
{
  "name": "John",
  "email": "john@example.com",
  "message": "Hello"
}
```

---

### 💼 Career API

POST `/career`

**Form Data:**

* first_name
* last_name
* email
* phone
* job
* message
* resume (pdf file)

---

## ⚙️ Installation & Setup

```bash
# Clone the repo
git clone https://github.com/your-username/backend-repo.git

# Navigate into project
cd backend-repo

# Install dependencies
npm install

# Create .env file
```

## 🔐 Environment Variables

Create a `.env` file and add:

```
EMAIL=your-email@gmail.com
PASS=your-app-password
```

⚠️ Use Gmail App Password (not your real password)

---

## ▶️ Run Server

```bash
node index.js
```

Server will run on:

```
http://localhost:5000
```

---

## 📌 Notes

* Enable "Less secure apps" or use App Password in Gmail
* Ensure uploads folder exists
* Backend must be deployed for frontend forms to work

## 👨‍💻 Author

Developed by Saad Parekh
