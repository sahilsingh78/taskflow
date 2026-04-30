# ⚡ TaskFlow — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking team progress with role-based access control.

**Live Demo:** https://taskflow-lake-seven.vercel.app  
**GitHub:** https://github.com/sahilsingh78/taskflow

---

## 🧩 Problem Statement

Managing team tasks across multiple projects can become disorganized without a centralized system.  
This application solves that by providing a structured platform for project management, task tracking, and role-based collaboration.

---

## ⭐ Highlights

- Full-stack MERN application
- Role-based access control (Admin / Member)
- Project-level team management
- Task assignment with priority & deadlines
- Dashboard analytics with overdue tracking
- Secure JWT authentication
- Fully deployed (Vercel + Railway)

---

## 📸 Screenshots

*(Add screenshots here if available — or remove this section)*

---

## 🚀 Features

### 🔐 Authentication
- JWT-based login and registration
- Role selection on signup (Admin / Member)
- Protected routes with automatic redirection
- Axios interceptor attaches token to every request

---

### 📊 Dashboard
- Total tasks
- Completed tasks
- In-progress tasks
- Overdue tasks
- Total projects
- Quick overview of work status

---

### 📁 Project Management
- Create projects with name, description, color, and due date
- Project status: Active / Completed / On Hold
- View project details and associated tasks
- Only admins can edit project details

---

### ✅ Task Management
- Create tasks with:
  - Title
  - Description
  - Priority
  - Assigned member
  - Due date
- Update status (todo → in-progress → done)
- Overdue task detection
- Task deletion (admin/creator only)

---

### 👥 Team Management (Admin Only)
- View all users
- Search users by name/email
- Filter users by role
- Change user roles (Admin / Member)
- Admin cannot modify own role

---

### 📌 My Tasks
- View only assigned tasks
- Update task status directly
- Focused task management experience

---

## 🔐 Role-Based Access Control

| Feature | Member | Project Admin | Global Admin |
|--------|--------|--------------|--------------|
| View projects | ✅ | ✅ | ✅ |
| Create projects | ✅ | ✅ | ✅ |
| Add/remove members | ❌ | ✅ | ✅ |
| Edit project | ❌ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Delete tasks | ❌ | ✅ | ✅ |
| Team page access | ❌ | ❌ | ✅ |
| Change roles | ❌ | ❌ | ✅ |

---

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Axios
- CSS (custom styling)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for hashing
- express-validator

### Deployment
- Frontend → Vercel
- Backend → Railway
- Database → MongoDB Atlas

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification, admin guard
│   ├── models/
│   │   ├── User.js               # User schema with password hashing
│   │   ├── Project.js            # Project schema with members sub-array
│   │   └── Task.js               # Task schema with virtual isOverdue
│   ├── routes/
│   │   ├── auth.js               # POST /register, /login, GET /me
│   │   ├── projects.js           # CRUD + member management
│   │   ├── tasks.js              # CRUD + dashboard + my tasks
│   │   └── users.js              # List, search, role update
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express entry point
│
├── frontend/
│   └── src/
│       ├── components/
│       │   └── layout/
│       │       └── AppLayout.js  # Sidebar + hamburger menu
│       ├── context/
│       │   └── AuthContext.js    # Global auth state
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── DashboardPage.js
│       │   ├── ProjectsPage.js
│       │   ├── ProjectDetailPage.js  # Tasks + Members tabs
│       │   ├── MyTasksPage.js
│       │   └── TeamPage.js       # Admin-only user management
│       ├── utils/
│       │   └── api.js            # Axios instance with interceptors
│       ├── App.js
│       └── index.css
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works fine)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend proxies API calls to `localhost:5000` via the `proxy` field in `package.json`.

---

## 🌐 Deployment

### Backend → Railway
1. Create a new project on [railway.app](https://railway.app)
2. Connect your GitHub repo, select the `backend` folder as root
3. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`
4. Railway auto-detects the Node.js app and deploys

### Frontend → Vercel
1. Import the repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add env variable: `REACT_APP_API_URL=https://your-railway-backend.up.railway.app/api`
4. Deploy

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login |
| GET | `/api/auth/me` | Token | Get current user |
| GET | `/api/projects` | Token | List user's projects |
| POST | `/api/projects` | Token | Create project |
| GET | `/api/projects/:id` | Token | Get project details |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Owner | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:uid` | Admin | Remove member |
| GET | `/api/tasks?project=id` | Token | Get project tasks |
| GET | `/api/tasks/my` | Token | Get my tasks |
| GET | `/api/tasks/dashboard` | Token | Dashboard stats |
| POST | `/api/tasks` | Token | Create task |
| PUT | `/api/tasks/:id` | Member | Update task |
| DELETE | `/api/tasks/:id` | Creator/Admin | Delete task |
| GET | `/api/users` | Global Admin | List all users |
| GET | `/api/users/search?q=` | Token | Search users |
| PUT | `/api/users/:id/role` | Global Admin | Change user role |

---

##⚡ Challenges Faced

Designing role-based access across frontend and backend
Managing relationships between users, projects, and tasks
Handling edge cases like overdue tasks and permissions

---

## 👨‍💻 Author

**Sahil Singh**  
GitHub: [@sahilsingh78](https://github.com/sahilsingh78)
