# ETL Assignment

## Requirements
- Node.js
- PostgreSQL

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

## Structure
```
etl-pipeline/
├── src/
│   ├── client/
│   │   └── index.js
│   ├── config/
│   │   └── db.js
│   ├── processor/
│   │   └── index.js
│   ├── server/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   └── events.js
│   │   └── services/
│   │       └── fileWriter.js
│   └── utils/
│       └── logger.js
├── db/
│   └── schema.sql
├── events.jsonl
├── .env.example
├── .gitignore
└── README.md


2. Create a `.env` file in the root with:
   ```env
   PORT=8000
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=etl_db
   AUTH_SECRET=secret
   ```

3. Setup Postgres:
   ```bash
   psql -U postgres -f db.sql
   ```

4. Open three terminal tabs and run each service:

   **Terminal 1: Start the server**
   ```bash
   node server.js
   ```

   **Terminal 2: Send events from client (will wait for server and re-send on file change)**
   ```bash
   node client.js
   ```

   **Terminal 3: Process data to DB**
   ```bash
   node data_processor.js
   ```

## Endpoints
- `POST /liveEvent`: Send a JSON event with `Authorization: secret`
- `GET /userEvents/:userId`: Get revenue data for user

---

## ⚠️ Troubleshooting

### ❌ `connect ECONNREFUSED 127.0.0.1:8000`
**Cause:** The server is not running.  
**Fix:** Start the server before running the client:
```bash
node server.js
```

### ❌ `connect ECONNREFUSED 127.0.0.1:5432`
**Cause:** PostgreSQL is not running.  
**Fix:** Start PostgreSQL:
```bash
brew services start postgresql@14
```

### ❌ `role "postgres" does not exist`
**Cause:** PostgreSQL doesn't have a `postgres` user.  
**Fix:** Either create the role or change `DB_USER` to your macOS username.
```sql
CREATE ROLE postgres WITH LOGIN SUPERUSER;
```

### ❌ `database "daniellevy" does not exist`
**Cause:** `.env` is missing, so it defaults to your macOS username as the DB name.  
**Fix:** Create a `.env` with `DB_NAME=etl_db`, and then:
```bash
createdb etl_db
```

### ❌ `relation "users_revenue" does not exist`
**Cause:** You didn’t create the required table.  
**Fix:** Run the schema script:
```bash
psql -U <your_user> -d etl_db -f db.sql
```

Replace `<your_user>` with your local DB user (e.g., `daniellevy`).

