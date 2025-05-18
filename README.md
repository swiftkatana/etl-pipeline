# ETL Assignment

## Requirements
- Node.js
- PostgreSQL

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

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
