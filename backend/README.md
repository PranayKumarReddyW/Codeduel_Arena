# CodeDuel Arena - Java Spring Boot Backend

A high-performance Java Spring Boot 3.4 REST API backend powering CodeDuel Arena, featuring real-time matchmaking, live multiplayer queues, JWT authentication, user accounts, Elo rating updates, problem management, leaderboards, and Judge0 code execution.

---

## 🚀 Quick Start

### Prerequisites
- **Java 21+** (OpenJDK 21 or 26)
- **Maven 3.9+**

### Run the Backend
From the project root:
```bash
npm run backend:run
```
Or directly using Maven:
```bash
mvn -f backend/pom.xml spring-boot:run
```

The backend starts on `http://localhost:8088`.

### Run Backend Tests
```bash
npm run backend:test
```

---

## 🔐 Authentication & User System

The backend provides full account registration and login with secure PBKDF2 password hashing and HMAC-SHA256 JWT tokens.

### Pre-Seeded Demo Accounts
For quick testing and pairing:
- **Username / Handle**: `alexr` | **Password**: `password123` *(Rating: 1180)*
- **Username / Handle**: `demo` | **Password**: `password123` *(Rating: 1250)*

### Endpoints
- `POST /api/auth/register`: Create a new user account with `name`, `handle`, `email`, and `password`. Returns JWT token and user profile.
- `POST /api/auth/login`: Authenticate with `usernameOrEmail` and `password`. Returns JWT token and user profile.
- `GET /api/auth/me`: Get current authenticated user profile via `Authorization: Bearer <token>`.

---

## ⚔️ Matchmaking Engine (Live Players vs Arena Challengers)

### How Matchmaking Works
1. **Live Multiplayer Queue**:
   When a user clicks **Find Match**, the backend places their ticket into the active multiplayer queue.
   - If **another real player** is waiting in the queue within a compatible rating range (±200 Elo), the engine pairs both players immediately into a **Live Player Duel** with the same `matchId` and challenge.
2. **Arena Challenger Fallback**:
   If no other player is in the queue within a few seconds (e.g., when testing or playing solo), the engine automatically matches you with an **Arena Challenger** (bot opponent calibrated to your rating).
3. **Queue Cancellation**:
   `POST /api/matchmaking/cancel` removes the user from the waiting queue if they cancel search.

---

## ⚡ Judge0 Integration

The backend is pre-configured to connect to the **Judge0 API** for compiling and executing code in Python 3, JavaScript, C++, and Java.

### Configuring Your Judge0 API Key
When you receive your Judge0 API key, configure it in **`backend/src/main/resources/application.properties`**:

```properties
# For RapidAPI Judge0:
judge0.api.url=https://judge0-ce.p.rapidapi.com
judge0.api.key=YOUR_RAPIDAPI_JUDGE0_KEY_HERE
judge0.api.host=judge0-ce.p.rapidapi.com
```

Or pass it as an environment variable:
```bash
export JUDGE0_API_KEY="YOUR_RAPIDAPI_KEY"
```

### Current Status (Zero-Config Fallback)
While the API key is not yet provided, the backend operates in **transparent fallback evaluation mode**:
- Checks code logic and implementation status.
- Evaluates test cases with simulated runtime and memory statistics.
- Returns identical response payloads as live Judge0 submissions.
- As soon as you set `judge0.api.key` (or `JUDGE0_API_KEY`), the service automatically switches to live Judge0 submissions!

---

## 📡 REST API Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new account.
- `POST /api/auth/login`: Login and receive JWT.
- `GET /api/auth/me`: Current user session.

### Problems (`/api/problems`)
- `GET /api/problems`: List coding problems.
- `GET /api/problems/{id}`: Problem details, test cases, and starter templates.

### Players & Leaderboard (`/api/players`)
- `GET /api/players`: List players ordered by rating.
- `GET /api/players/leaderboard?period={All-Time|Weekly|Monthly}&q={query}`: Filtered leaderboard.
- `GET /api/players/{id}`: Player profile.

### User Profile (`/api/user`)
- `GET /api/user/profile`: Profile, live stats, and match history.
- `PUT /api/user/profile`: Update bio, handle, or active languages.
- `GET /api/user/progression`: Rating progression history for charts.

### Matches (`/api/matches`)
- `GET /api/matches?outcome={All|win|loss}&difficulty={All|Easy|Medium|Hard}`: Match history.
- `GET /api/matches/{id}`: Detailed match outcome.
- `POST /api/matches`: Record match result and update Elo rating.

### Matchmaking (`/api/matchmaking`)
- `POST /api/matchmaking/find`: Queue for live player or arena challenger.
- `POST /api/matchmaking/cancel`: Cancel waiting queue ticket.

### Code Execution (`/api/code`)
- `POST /api/code/run`: Run sample tests via Judge0.
- `POST /api/code/submit`: Submit solution for hidden test cases via Judge0.

### Platform Info (`/api/platform`)
- `GET /api/platform/stats`: Live battlers online, queue count, total matches.
- `GET /api/platform/languages`: Supported languages.
- `GET /api/platform/tiers`: Rating tier thresholds.

---

## 🗄️ Database
- Built-in **H2 in-memory database** with automatic entity mapping and seeding.
- H2 Web Console: `http://localhost:8088/h2-console` (JDBC URL: `jdbc:h2:mem:codedueldb`, Username: `sa`, Password: empty).
