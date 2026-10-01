# EduTrack: Institutional Student Management System

**🌍 Live Demo:** [https://student-management-system-ashen-two.vercel.app/](https://student-management-system-ashen-two.vercel.app/)

EduTrack is a production-ready, full-stack student management portal designed for academic institutions. It provides a secure, role-based platform for system administrators to manage student records, course catalogs, announcements, and educational resources, while offering students a seamless interface to enroll in courses, view materials, and track their academic progress.

---

## 🚀 Features

- **Role-Based Access Control (RBAC):** Distinct dashboards and capabilities for `admin` and `student` roles.
- **Course Catalog & Enrollment:** Students can browse available courses and seamlessly enroll. Admins maintain full CRUD control over the curriculum.
- **Resource Management:** Admins can upload specific course materials (PDFs, docs) and attach instructional messages. Powered by secure **Supabase Storage**.
- **Institutional Announcements:** Global announcement board allowing administrators to broadcast news to all students.
- **Dynamic Aesthetic UI:** Built with React, featuring a premium ivory and burgundy academic color palette, card-lift micro-animations, and responsive layouts.
- **Secure Authentication:** JWT-based authentication with bcrypt password hashing.

---

## 🏗 Architecture & Tech Stack

```mermaid
graph TD
    Client[React Frontend] -->|HTTPS / REST API| Server[Node.js / Express Backend]
    Server -->|SQL Queries| DB[(PostgreSQL Database)]
    Server -->|Upload / Download| Storage[(Supabase Storage)]
    
    subgraph Frontend
    A[Student Dashboard]
    B[Admin Dashboard]
    C[Course Catalog]
    end
    
    subgraph Backend
    D[Auth Middleware]
    E[Course Controller]
    F[User Controller]
    end
```

### Technology Stack
- **Frontend:** React (Vite), React Router, Tailwind CSS, Context API.
- **Backend:** Node.js, Express, jsonwebtoken, multer, cors.
- **Database:** PostgreSQL (pg module).
- **File Storage:** Supabase Storage.

---

## 🛠 Installation & Local Setup

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database
- Supabase account (for file storage)

### 1. Database Setup
Execute the SQL scripts in the `database/` folder to initialize the schema:
1. `schema.sql` - Core tables (users, courses, enrollments).
2. `seed.sql` - Sample data and initial admin account.

### 2. Backend Setup
Navigate to the `backend/` directory:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/edutrack
JWT_SECRET=your_super_secret_jwt_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_STORAGE_BUCKET=student-files
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the `frontend/` directory:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```

---

## 🛡 Security & Best Practices

- **Token Management:** JWTs are used for secure state management. Invalid or expired tokens trigger automatic local storage cleanup and redirect to `/login`.
- **Parametrized Queries:** All database interactions use `pg` parameterized queries to prevent SQL injection.
- **Data Validation:** File uploads check file size limits (10MB) and MIME types before sending data to Supabase.

---

## 📄 License
This project is proprietary software designed for institutional use.
