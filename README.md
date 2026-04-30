# ⚡ TaskFlow — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking team progress with role-based access control.

**Live Demo:** https://taskflow-lake-seven.vercel.app  
**GitHub:** https://github.com/sahilsingh78/taskflow

---

## 📸 Screenshots

| Login | Dashboard | Projects | Task Detail |
|---|---|---|---|
| Auth with role selection | Stats overview | Project cards | Tasks + Members tabs |

---

## 🚀 Features

### Authentication
- JWT-based login and registration
- Role selection on signup (Admin / Member)
- Protected routes — unauthenticated users redirected to login
- Token auto-attached to every API request via Axios interceptor

### Dashboard
- Summary cards: Total Tasks, Completed, In Progress, Overdue, Projects
- Recent tasks assigned to the logged-in user
- Quick links to navigate to projects

### Project Management
- Create projects with name, description, color tag, and due date
- Project cards with member avatars and status badge
- Project status: Active / Completed / On Hold
- Only project admins and the owner can edit project details

### Task Management (inside each project)
- Create tasks with title, description, priority, status, assigned member, due date
- Filter tasks by status and priority
- Inline status dropdown to update task status without opening modal
- Overdue indicator for past-due incomplete tasks
- Edit and delete tasks (creator or project admin only)

### Team Management (Admin only)
- View all registered users in the system
- Search by name or email
- Filter by role (Admin / Member)
- Change any user's global role via dropdown
- Admins cannot change their own role

### Members (per project)
- Project admins can add members by email
- Members can be assigned a project-level role (Admin / Member)
- Project admins can remove members
- Member list visible to all project members

### Role-Based Access Control
| Feature | Member | Project Admin | Global Admin |
|---|---|---|---|
| View projects they're in | ✅ | ✅ | ✅ |
| Create projects | ✅ | ✅ | ✅ |
| Add/remove project members | ❌ | ✅ | ✅ |
| Edit project details | ❌ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Delete any task in project | ❌ | ✅ | ✅ |
| Access Team Management page | ❌ | ❌ | ✅ |
| Change global user roles | ❌ | ❌ | ✅ |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 (Create React App)
- React Router v6
- Axios for API calls
- Plain CSS with CSS Variables (no UI library)

**Backend**
- Node.js + Express
- MongoDB + Mongoose ODM
- JSON Web Tokens (JWT) for auth
- bcryptjs for password hashing
- express-validator for input validation

**Deployment**
- Frontend: Vercel
- Backend: Railway
- Database: MongoDB Atlas

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

## 👨‍💻 Author

**Sahil Singh**  
GitHub: [@sahilsingh78](https://github.com/sahilsingh78)
