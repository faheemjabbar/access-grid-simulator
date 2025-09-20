# Access Grid Simulator

A MERN stack application that simulates time-based employee access to restricted rooms. 

---
### Prerequisites

Node.js (v14 or higher) \
MongoDB (v4.4 or higher) \
Git 

---

## ⚙️ Setup Instructions

### 1. Clone your GitHub repo (this gets the default branch: main)
```bash
git clone https://github.com/<your-username>/access-grid-simulator.git
cd access-grid-simulator
```
### 2. Fetch all branches
```bash
git fetch --all
```
### 3. Switch between branches

To see the README-only version:
```bash
git checkout main
```
To work on code:
```bash
git checkout dev
```
### 4. Backend Setup
```bash
cd backend
cp .env.example .env
```
Open .env and set your MongoDB connection string & PORT.

Install dependencies and start the server:
```bash
npm install
npm run dev
```
### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
