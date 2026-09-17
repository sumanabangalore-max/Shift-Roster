# Running TeamOff & Shift Roster Manager on Docker Desktop

This application is fully containerized and ready to run on **Docker Desktop** (Windows, macOS, or Linux).

---

## Quick Start (Recommended)

Make sure **Docker Desktop** is running on your machine, then open your terminal or PowerShell in this project folder:

### 1. Build and Run with Docker Compose

```bash
docker compose up -d --build
```

*(If you are using an older version of Docker, use `docker-compose up -d --build`)*

### 2. Open the App in your Browser

Visit:
```text
http://localhost:3000
```

To stop the container:
```bash
docker compose down
```

---

## Alternative: Using the Docker CLI Directly

If you prefer building and running with standard Docker commands:

### 1. Build the Docker image
```bash
docker build -t teamoff-app .
```

### 2. Run the container
```bash
docker run -d -p 3000:3000 --name teamoff teamoff-app
```

### 3. Open in Browser
```text
http://localhost:3000
```

### Useful Management Commands:
- **View container logs:** `docker logs -f teamoff`
- **Stop container:** `docker stop teamoff`
- **Start container:** `docker start teamoff`
- **Remove container:** `docker rm -f teamoff`

---

## Development Mode with Live Code Reloading (Optional)

If you want to edit code locally and have it hot-reload inside Docker:

```bash
docker compose --profile dev up --build
```

Then open `http://localhost:3001` in your browser. Any changes to the `src/` directory on your host machine will instantly reflect.

---

## Docker Architecture Overview

- **Base Image:** Node 20 Alpine for building the React/Vite/Tailwind bundle.
- **Production Server:** High-performance `nginx:alpine` image (~25MB total footprint).
- **Port:** Configured to bind on port `3000` (mapped to `http://localhost:3000`).
- **Health Check:** Includes automated `/healthz` heartbeat checking every 30 seconds.
- **Routing:** Configured with SPA rewrite rules (`try_files $uri $uri/ /index.html`) so client-side routes never return 404.
