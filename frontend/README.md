# TaskFlow

A real-time Kanban board app. Users register, create boards, add columns and tasks, drag tasks between columns, and see changes from other open tabs or sessions instantly.

- **Frontend:** React 18, Vite 7, Tailwind CSS 4, dnd-kit, Socket.IO client
- **Backend:** Node.js, Express 5, Mongoose 9 (MongoDB), Passport (local + JWT), Socket.IO
- **Auth:** email and password, with a JWT stored in an HTTP-only cookie (no server-side sessions)

---

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Project structure](#project-structure)
3. [Quick start](#quick-start)
4. [Environment variables](#environment-variables)
5. [Running the app](#running-the-app)
6. [Running the tests](#running-the-tests)
7. [API reference](#api-reference)
8. [Real-time events](#real-time-events)
9. [Data model](#data-model)
10. [Production deployment notes](#production-deployment-notes)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 20.19 or newer (22 LTS recommended) | Required by Vite 7 and Mongoose 9 |
| npm | Comes with Node | |
| MongoDB | 6.0 or newer | Local install **or** a free MongoDB Atlas cluster |
| Git | Any recent version | |

Check your versions:

```bash
node -v
npm -v
```

### Getting a MongoDB instance

Pick one:

**Option A: Local MongoDB**

Install MongoDB Community Edition from the [official docs](https://www.mongodb.com/docs/manual/installation/) and make sure `mongod` is running on the default port `27017`. The default connection string is then `mongodb://127.0.0.1:27017/taskflow`.

**Option B: MongoDB Atlas (cloud)**

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user (Database Access) and note the username and password.
3. Allow your IP address (Network Access).
4. Click **Connect > Drivers** and copy the connection string. It looks like
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskflow?retryWrites=true&w=majority`.
5. URL-encode special characters in the password (for example `@` becomes `%40`).

---

## Project structure

```
TaskFlow/
└── backend/
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── jest.config.cjs
    ├── package.json
    ├── package-lock.json
    ├── nodemon.json
    ├── src/
    │   ├── app.js
    │   ├── server.js
    │   ├── config/
    │   │   └── database.js
    │   ├── controllers/
    │   │   ├── auth.controller.js
    │   │   ├── board.controller.js
    │   │   ├── column.controller.js
    │   │   └── task.controller.js
    │   ├── middleware/
    │   │   ├── auth.middleware.js
    │   │   ├── error.middleware.js
    │   │   └── validate.middleware.js
    │   ├── models/
    │   │   ├── user.model.js
    │   │   ├── board.model.js
    │   │   ├── column.model.js
    │   │   └── task.model.js
    │   ├── routes/
    │   │   ├── auth.routes.js
    │   │   ├── board.routes.js
    │   │   ├── column.routes.js
    │   │   └── task.routes.js
    │   ├── utils/
    │   │   └── jwt.utils.js
    │   └── validators/
    │       └── board.validator.js
    └── tests/
        ├── unit/
        └── integration/
└── frontend/
    ├── .eslintrc.cjs
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    ├── public/
    │   └── favicon.ico
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/
        │   ├── axios.js
        │   ├── auth.api.js
        │   ├── boards.api.js
        │   └── tasks.api.js
        ├── assets/
        │   └── images/
        ├── components/
        │   ├── common/
        │   │   ├── Button.jsx
        │   │   ├── Modal.jsx
        │   │   └── Dropdown.jsx
        │   ├── layout/
        │   │   ├── Navbar.jsx
        │   │   └── Sidebar.jsx
        │   ├── board/
        │   │   ├── BoardCard.jsx
        │   │   ├── Column.jsx
        │   │   └── TaskCard.jsx
        │   └── auth/
        │       ├── LoginForm.jsx
        │       └── RegisterForm.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   └── BoardContext.jsx
        ├── hooks/
        │   ├── useDebounce.js
        │   └── useBoards.js
        └── pages/
            ├── DashboardPage.jsx
            ├── BoardPage.jsx
            ├── LoginPage.jsx
            └── RegisterPage.jsx

```

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/anudeepthibotcha/TaskFlow.git
cd TaskFlow

# 2. Backend
cd backend
npm install
cp .env.example .env        # Windows (cmd): copy .env.example .env
# Edit .env: at minimum set JWT_SECRET (see below)
npm run dev

# 3. Frontend (in a second terminal)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

Open **http://localhost:5173**, register an account, and create your first board.

---

## Environment variables

### Backend: `backend/.env`

Copy `backend/.env.example` to `backend/.env` and edit it. This file is git-ignored; never commit it.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `MONGODB_URI` | **Yes** | none | MongoDB connection string. The server exits on startup if it is missing or the connection fails. |
| `JWT_SECRET` | **Yes** | none | Secret used to sign and verify login tokens (HS256). The app throws on startup if it is missing. |
| `PORT` | No | `5000` | Port the API and Socket.IO server listen on. |
| `CLIENT_URL` | No | `http://localhost:5173` | The exact origin of the frontend. Used for CORS (HTTP and Socket.IO) with credentials enabled. |
| `JWT_EXPIRES_IN` | No | `1d` | Token lifetime, in [`jsonwebtoken` format](https://github.com/vercel/ms) (`15m`, `12h`, `7d`). |
| `NODE_ENV` | No | none | Set to `production` in production. It switches cookies to `Secure` and `SameSite=None` (see [Production deployment notes](#production-deployment-notes)). |

Example for local development:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
CLIENT_URL=http://localhost:5173
JWT_SECRET=<paste a generated secret here>
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

#### Generating a `JWT_SECRET`

Use a long random value, never a word or phrase:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Notes:

- Changing `JWT_SECRET` invalidates every existing login. Users will need to sign in again.
- The login cookie (`taskflow_token`) is currently set to expire after 24 hours regardless of `JWT_EXPIRES_IN`. Setting a longer token lifetime will not extend the cookie. To support longer sessions, also change `ONE_DAY_MS` in `backend/src/routes/authRoutes.js`.

### Frontend: `frontend/.env`

Create `frontend/.env`. This file is git-ignored.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | No | `http://localhost:5000/api` | Base URL of the backend API, **including the `/api` suffix**. |

```env
VITE_API_URL=http://localhost:5000/api
```

> **Important: include `/api`.** The frontend appends paths such as `/boards` and `/auth/login` to this value, and the backend serves everything under `/api`. A value like `http://localhost:5000` (no `/api`) will cause every request to return 404. The Socket.IO client derives its server address from the origin of this same variable, so only one setting is needed.

Vite reads `VITE_*` variables at build time, so restart `npm run dev` after editing the file, and rebuild (`npm run build`) after changing it for a production bundle.

---

## Running the app

### Backend

```bash
cd backend
npm run dev     # nodemon, restarts on file changes
npm start       # plain node, for production
```

On success you will see:

```
MongoDB connected successfully
TaskFlow API running at http://localhost:5000
Socket.io enabled for http://localhost:5173
```

Verify it is healthy:

```bash
curl http://localhost:5000/api/health        # API is up
curl http://localhost:5000/api/health/db     # 200 if MongoDB is connected, 503 if not
```

### Frontend

```bash
cd frontend
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # production bundle in frontend/dist
npm run preview   # serve the built bundle locally
npm run lint      # ESLint
```

The backend and frontend must both be running. Use the same browser hostname for both (see [Troubleshooting](#troubleshooting)).

---

## Running the tests

```bash
cd backend
npm test
```

The suite uses Jest and Supertest and runs a handful of smoke tests (welcome route, health check, auth rejection, validation, 404). It imports the Express app directly and does **not** need a running MongoDB instance. If `JWT_SECRET` is not set, the tests use a built-in test-only value.

There is no frontend test suite yet; use `npm run lint` in `frontend/`.

---

## API reference

Base URL: `http://localhost:5000/api`. All responses are JSON. Routes marked **Auth** require the `taskflow_token` cookie set by `/auth/login`; requests from the browser must send credentials (`credentials: "include"`).

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | API liveness check |
| GET | `/health/db` | No | Database connection status |

### Authentication

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Create an account. Body: `name`, `email`, `password` (min 8 chars) |
| POST | `/auth/login` | No | Body: `email`, `password`. Sets the HTTP-only cookie |
| GET | `/auth/me` | Yes | Current user |
| POST | `/auth/logout` | No | Clears the cookie |

### Boards

Users can only access boards they own.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/boards` | Yes | List your boards |
| POST | `/boards` | Yes | Create a board (default columns are created with it) |
| GET | `/boards/:boardId` | Yes | Board with its columns and tasks |
| PATCH | `/boards/:boardId` | Yes | Update name or description |
| DELETE | `/boards/:boardId` | Yes | Delete the board, its columns and its tasks |

### Columns

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/boards/:boardId/columns` | Yes | List columns |
| POST | `/boards/:boardId/columns` | Yes | Create a column |
| PATCH | `/columns/:columnId` | Yes | Rename or reposition |
| DELETE | `/columns/:columnId` | Yes | Delete the column and its tasks |

### Tasks

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/boards/:boardId/tasks` | Yes | List tasks |
| POST | `/boards/:boardId/tasks` | Yes | Create a task |
| PATCH | `/boards/:boardId/tasks/reorder` | Yes | Bulk reorder or move tasks (drag and drop) |
| PATCH | `/tasks/:taskId` | Yes | Update fields or move to another column |
| DELETE | `/tasks/:taskId` | Yes | Delete a task |

Error responses have the shape `{ "success": false, "message": "..." }`.

---

## Real-time events

Socket.IO runs on the same port as the API. A connection is accepted only if the browser sends a valid `taskflow_token` cookie.

**Client to server**

| Event | Payload | Description |
| --- | --- | --- |
| `board:join` | `{ boardId }` (with ack) | Join a board room. Allowed only for the board owner |
| `board:leave` | `{ boardId }` (with ack) | Leave a board room |

**Server to clients in the board room**

`board:updated`, `board:deleted`, `column:created`, `column:updated`, `column:deleted`, `task:created`, `task:updated`, `task:moved`, `task:deleted`, `user:joined`, `user:left`

Each event includes the `boardId` and a `timestamp`.

---

## Data model

Four MongoDB collections, managed with Mongoose:

```
users ──< boards ──< columns ──< tasks
                └────────────────< tasks   (tasks also store boardId)
```

| Collection | Key fields |
| --- | --- |
| `users` | `name`, `email` (unique), `password` (bcrypt hash, never returned) |
| `boards` | `name`, `description`, `owner` (ref `users`) |
| `columns` | `title`, `boardId` (ref `boards`), `position` |
| `tasks` | `title`, `description`, `boardId`, `columnId`, `position`, `label`, `labels`, `priority` (`Low`/`Medium`/`High`), `dueDate`, `assignee` |

All collections have `createdAt` and `updatedAt` timestamps. There are no database-level cascades: deleting a board or column removes its children in application code.

---

## Production deployment notes

1. **Set `NODE_ENV=production`** on the backend. Cookies are then issued with `Secure` and `SameSite=None` so they work when the frontend and API are on different domains. This **requires HTTPS** on both; browsers will reject the cookie over plain HTTP.
2. **Set `CLIENT_URL`** to the exact deployed frontend origin, with no trailing slash, for example `https://taskflow.example.com`. A mismatch causes CORS errors on both the API and WebSocket connection.
3. **Set `VITE_API_URL`** to the deployed API, including `/api`, **before** running `npm run build` (for example `https://api.taskflow.example.com/api`). Deploy the contents of `frontend/dist` to any static host.
4. **Use a strong, unique `JWT_SECRET`** and store it in your host's secret manager, not in the repository.
5. **Use MongoDB Atlas or another managed instance**, restrict network access, and use a dedicated database user.
6. If you put the API behind a reverse proxy or load balancer, make sure it forwards WebSocket upgrade requests. With more than one backend instance you will also need sticky sessions or a Socket.IO adapter (for example Redis), because rooms are kept in process memory.
7. Start the API with `npm start` (not `npm run dev`).

---

## Troubleshooting

**`JWT_SECRET is missing from the .env file`**
Create `backend/.env` from `.env.example` and set `JWT_SECRET`. Make sure you run commands from inside `backend/`.

**`MONGODB_URI is missing` or `Failed to start TaskFlow: ...`**
Check the connection string. For a local database, confirm `mongod` is running. For Atlas, confirm your IP is allow-listed and the password is URL-encoded.

**Every request returns 404 or "Route not found" from the frontend**
`VITE_API_URL` is probably missing the `/api` suffix. Use `http://localhost:5000/api` and restart the Vite dev server.

**CORS errors in the browser console**
`CLIENT_URL` must exactly match the address in your browser's address bar, including the port. `http://localhost:5173` and `http://127.0.0.1:5173` are different origins.

**Login succeeds but you are logged out immediately, or `/auth/me` returns 401**
The cookie is not being stored or sent. In development, open the app and the API with the same hostname (use `localhost` for both, not a mix of `localhost` and `127.0.0.1`). In production, confirm both sites use HTTPS and `NODE_ENV=production` is set.

**Real-time updates do not appear**
Check the browser console for Socket.IO `connect_error` messages. "Authentication required" means the cookie was not sent. See the previous item. Also confirm `CLIENT_URL` is correct, since Socket.IO enforces CORS separately from the REST API.

**Port already in use**
Change `PORT` in `backend/.env` (and update `VITE_API_URL` to match), or stop the process using the port.

**`npm install` fails with engine or syntax errors**
Upgrade Node.js to 20.19 or newer.

---

## Security reminders

- Never commit `.env` files. Both `backend/.gitignore` and `frontend/.gitignore` already exclude them.
- Do not share the project folder or a zip of it with a populated `backend/.env` inside. If real secrets have been shared, generate a new `JWT_SECRET` and rotate the database password.