# Sickdays Backend API

This is a simple Node.js API server using Express.

## Getting Started

1. Create .env file with structure described into .env.exmaple

2. Create an database with command: `docker compose up --build --force-recreate `

3. Fillup db with seed script, located into ./scripts/script.js. If you need to change initial data look into ./scripts/initialSeed.js

4. Install dependencies:

   ```sh
   npm install
   ```

5. Start the server in development mode:

   ```sh
   npm run dev
   ```

6. Or start the server in production mode:
   ```sh
   npm start
   ```

The server will run on [http://localhost:8000/api](http://localhost:8000/api) by default.

## Health Check

Visit [http://localhost:8000/health](http://localhost:8000/health) to check if the server is running.
