# 💎 Diamond Bidding System

A **role-based, time-controlled diamond bidding platform** built using **Node.js, React, TypeScript, Sequelize, and PostgreSQL**.
The system enforces **backend-driven business logic** to ensure fair, secure, and dynamic bidding across multiple users and devices.

---

## 🚀 Project Overview

The Diamond Bidding System allows:

* **Admins** to manage users, diamonds, bidding events, and declare results
* **Users** to participate in bidding within a defined time window
* **Backend** to strictly control bidding rules, timing, and winner calculation
* **Multiple users** from different browsers or devices to see consistent bid updates

All critical logic is handled on the **backend**, making the system secure and tamper-proof.

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express
* TypeScript
* Sequelize ORM
* PostgreSQL
* JWT Authentication

### Frontend

* React
* TypeScript

---

## 🗄️ Database Design

The project uses **6 database tables**:

| Table Name  | Description                           |
| ----------- | ------------------------------------- |
| users       | Stores admin and user accounts        |
| diamonds    | Stores diamond details                |
| bids        | Stores bidding events and time window |
| user_bids   | Stores current bid amount per user    |
| bid_history | Stores bid edit history               |
| results     | Stores final bid result               |

### Table Relationships

* One User → Many User Bids
* One Diamond → One Bid
* One Bid → Many User Bids
* One User Bid → Many Bid History records
* One Bid → One Result
* One User → Many Results (as winner)

---

## 📁 Project Structure

### Backend

```
backend/
├── src/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middlewares/
│   └── utils/
```

### Frontend

```
frontend/
├── src/
│   ├── context/
│   ├── routes/
│   ├── services/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   └── styles/
```

---

## ⚙️ Installation & Running the Project

Check versions:

```bash
node -v
npm -v
psql --version
```

---

## 📦 Clone the Repository

```bash
git clone <your-github-repo-url>
cd diamond-bidding-system
```

---

## 🗄️ Database Setup (PostgreSQL)

```bash
psql -U postgres
```

```sql
CREATE DATABASE diamond_bidding_db;
```

```sql
\q
```

---

## 🖥️ Backend Setup & Run

```bash
cd backend
npm install
```

Create `.env` file in `backend/`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=diamond_bidding_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

Start backend server:

```bash
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

## 🌐 Frontend Setup & Run

```bash
cd frontend
npm install
```

Create `.env` file in `frontend/` (optional):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

