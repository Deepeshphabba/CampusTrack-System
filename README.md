# 🎓 CampusTrack

> A full-stack campus issue tracking and management system built with **React + Vite** and **Spring Boot**.

CampusTrack enables students, staff, and administrators to report, track, and resolve campus-related issues efficiently. It features role-based access control, a real-time analytics dashboard, team directory, and a complete ticket lifecycle management system.

---

## 🚀 Tech Stack

| Layer        | Technology                                                  |
|--------------|-------------------------------------------------------------|
| **Frontend** | React 18, Vite 5, React Router 6, Axios                    |
| **Backend**  | Java, Spring Boot, Spring Security, JPA / Hibernate         |
| **Database** | MySQL (local dev) / PostgreSQL (production)                 |
| **Auth**     | JWT (JSON Web Tokens)                                       |
| **Build**    | Maven (backend), npm (frontend)                             |
| **Deploy**   | Docker (Dockerfile included)                                |

---

## ✨ Key Features

- **🔐 Authentication & Authorization** — Secure login/register with JWT tokens and role-based access (Admin, Staff, Student).
- **📊 Analytics Dashboard** — Real-time statistics on issue counts, resolution rates, and category breakdowns.
- **🎫 Issue / Ticket Management** — Create, assign, update, and resolve campus issues with priority levels and status tracking.
- **👥 Team Directory** — View and manage staff and team members (Admin/Staff only).
- **🔔 Notifications** — Stay updated on ticket assignments and status changes.
- **📱 Responsive Design** — Modern, mobile-friendly UI with dark mode aesthetics.

---

## 📁 Project Structure

```
campustrack/
├── campustrack-backend/
│   └── campustrack-backend/
│       ├── src/main/java/com/campustrack/
│       │   ├── controller/       # REST API endpoints
│       │   ├── model/            # JPA entities (User, Issue)
│       │   ├── repository/       # Spring Data repositories
│       │   ├── service/          # Business logic
│       │   ├── security/         # JWT & Spring Security config
│       │   ├── dto/              # Data Transfer Objects
│       │   ├── config/           # App configuration & data seeder
│       │   └── exception/        # Custom exception handlers
│       ├── pom.xml               # Maven dependencies
│       └── Dockerfile            # Container deployment
├── campustrack-frontend/
│   └── ct-app/
│       ├── src/
│       │   ├── pages/            # Login, Register, Dashboard
│       │   ├── services/         # API service layer (Axios)
│       │   ├── App.jsx           # Route definitions
│       │   └── main.jsx          # Entry point
│       ├── package.json
│       └── vite.config.js
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- **Java 17+** and **Maven**
- **Node.js 18+** and **npm**
- **MySQL 8+** (or PostgreSQL for production)

### 1. Clone the Repository

```bash
git clone https://github.com/Deepeshphabba/CampusTrack-System.git
cd CampusTrack-System
```

### 2. Set Up the Database

Create a MySQL database (it will auto-create if configured):

```sql
CREATE DATABASE campustrack_db;
```

### 3. Run the Backend

```bash
cd campustrack-backend/campustrack-backend
mvn spring-boot:run
```

The backend will start on **http://localhost:8080**.

> **Note:** Default database credentials are configured in `application.properties`. For production, set environment variables:
> - `SPRING_DATASOURCE_URL`
> - `SPRING_DATASOURCE_USERNAME`
> - `SPRING_DATASOURCE_PASSWORD`
> - `JWT_SECRET`

### 4. Run the Frontend

```bash
cd campustrack-frontend/ct-app
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**.

---

## 🐳 Docker (Backend)

```bash
cd campustrack-backend/campustrack-backend
docker build -t campustrack-backend .
docker run -p 8080:8080 campustrack-backend
```

---

## 🔑 Default Roles

| Role      | Access Level                                      |
|-----------|---------------------------------------------------|
| **ADMIN** | Full access — manage users, issues, and analytics |
| **STAFF** | Manage issues, view team directory                |
| **STUDENT** | Submit issues, view personal dashboard          |

---

## 📄 API Endpoints

| Method | Endpoint             | Description              | Auth     |
|--------|----------------------|--------------------------|----------|
| POST   | `/api/auth/register` | Register a new user      | Public   |
| POST   | `/api/auth/login`    | Login and get JWT token  | Public   |
| GET    | `/api/issues`        | List all issues          | Required |
| POST   | `/api/issues`        | Create a new issue       | Required |
| PUT    | `/api/issues/{id}`   | Update an issue          | Required |
| DELETE | `/api/issues/{id}`   | Delete an issue          | Admin    |
| GET    | `/api/users`         | List all users           | Admin    |

---

## 👤 Author

**Deepesh Phabba**
- GitHub: [@Deepeshphabba](https://github.com/Deepeshphabba)

---

## 📝 License

This project is for educational purposes.
