# CodeDuel Arena — AWS EC2 Deployment Guide

This guide covers deploying **CodeDuel Arena** (Spring Boot 3 + TanStack Start SSR + Nginx + persistent database) to an **AWS EC2 instance**.

---

## Architecture Overview

```
                          Internet / Users
                                 │
                     Port 80 (HTTP) / Port 443 (HTTPS)
                                 │
                   ┌─────────────▼─────────────┐
                   │       Nginx Proxy         │
                   └──────┬─────────────┬──────┘
                          │             │
              /api/*, /ws/*             /*
                          │             │
             ┌────────────▼──────┐ ┌────▼─────────────┐
             │ Spring Boot API   │ │ TanStack Start   │
             │ & WebSockets      │ │ Node SSR Server  │
             │ (Port 8088)       │ │ (Port 3000)      │
             └────────────┬──────┘ └──────────────────┘
                          │
                   ┌──────▼──────┐
                   │ H2 Database │ (Mounted Volume: /app/data)
                   └─────────────┘
```

- **Single Inbound Port (Port 80)**: Only port 80 (and 443 for HTTPS) needs to be open in AWS Security Groups. Ports 8088 and 3000 are kept internal.
- **Persistent Data**: The embedded database is stored in `/app/data`, preserved across container restarts and updates via a Docker volume (`codeduel_data`).
- **WebSockets Enabled**: Real-time 1v1 arena duel events and progress bars pass seamlessly through Nginx connection upgrade headers.

---

## Step 1: Launch an AWS EC2 Instance

1. Log into your [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to **EC2** > **Launch Instance**:
   - **Name**: `codeduel-arena`
   - **AMI**: **Ubuntu Server 24.04 LTS** (or Ubuntu 22.04 LTS)
   - **Instance Type**: `t3.small` (2 vCPU, 2 GB RAM) or `t3.medium` (recommended for building images on the server).
   - **Key Pair**: Select or create an SSH key pair (`.pem` file).
   - **Storage**: Minimum `15 GB` gp3.
3. **Configure Security Group (Inbound Rules)**:
   Add the following inbound rules:
   | Type | Port | Source | Description |
   | --- | --- | --- | --- |
   | SSH | 22 | My IP (or `0.0.0.0/0`) | SSH access |
   | HTTP | 80 | `0.0.0.0/0` | Public Web traffic |
   | HTTPS | 443 | `0.0.0.0/0` | Secure SSL Web traffic |

---

## Step 2: Connect and Install Docker on EC2

SSH into your EC2 instance:
```bash
ssh -i /path/to/your-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
```

Update packages and install Docker with Docker Compose plugin:
```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker
```

Verify the installation:
```bash
docker --version
docker compose version
```

---

## Step 3: Deploy CodeDuel Arena

You can deploy using either **Method A** (easiest: build and run directly with Docker Compose) or **Method B** (push prebuilt image from Docker Hub / Amazon ECR).

### Method A: Git Clone + Docker Compose (Recommended)

1. Clone your repository onto the EC2 instance:
   ```bash
   git clone <YOUR_GIT_REPO_URL> codeduel-arena
   cd codeduel-arena
   ```

2. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Edit `.env` to configure your Judge0 API key or external RDS database:
   ```bash
   nano .env
   ```

3. Build and start the production container:
   ```bash
   docker compose up -d --build
   ```

4. Check the logs:
   ```bash
   docker compose logs -f
   ```

Once started, open your browser and navigate to:
```
http://<YOUR-EC2-PUBLIC-IP>
```

---

### Method B: Prebuilt Image from Docker Hub

If you prefer building locally or in CI/CD (GitHub Actions) and pushing to Docker Hub:

1. **On your local machine**:
   ```bash
   # Build multi-architecture image (or for linux/amd64 EC2)
   docker build --platform linux/amd64 -t <your-dockerhub-user>/codeduel:latest .
   docker push <your-dockerhub-user>/codeduel:latest
   ```

2. **On your EC2 instance**:
   ```bash
   docker run -d \
     --name codeduel \
     --restart unless-stopped \
     -p 80:80 \
     -v codeduel_data:/app/data \
     <your-dockerhub-user>/codeduel:latest
   ```

---

## Step 4: Verify Database Persistence

The H2 database is stored at `/app/data/codedueldb.mv.db` inside the Docker volume `codeduel_data`.

To verify your data volume:
```bash
docker volume ls
docker volume inspect codeduel_data
```

### Backing up the database:
```bash
docker cp codeduel-arena:/app/data/codedueldb.mv.db ./codedueldb_backup.mv.db
```

### Connecting to AWS RDS (PostgreSQL / MySQL):
If you later wish to use a managed AWS RDS database rather than the local file database, simply set these in your `.env`:
```env
SPRING_DATASOURCE_URL=jdbc:postgresql://<rds-endpoint>:5432/codeduel
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_secure_password
```
Restart the container with `docker compose up -d`. Spring Boot automatically boots against RDS!

---

## Step 5: (Optional) Set Up Free HTTPS with Let's Encrypt

If you have a domain pointing to your EC2 IP (e.g. `arena.yourdomain.com`):

1. Install Certbot on EC2:
   ```bash
   sudo apt-get install -y certbot
   ```

2. Stop the container temporarily to free port 80 for verification:
   ```bash
   docker compose down
   sudo certbot certonly --standalone -d arena.yourdomain.com
   ```

3. Mount the certificates into Nginx:
   In `nginx.conf`, add the SSL block referencing `/etc/letsencrypt/live/arena.yourdomain.com/fullchain.pem` and `/etc/letsencrypt/live/arena.yourdomain.com/privkey.pem`.

---

## Useful Maintenance Commands

| Action | Command |
| --- | --- |
| View live logs | `docker compose logs -f` |
| Restart application | `docker compose restart` |
| Rebuild and update | `docker compose up -d --build` |
| Stop application | `docker compose down` |
| Check memory/CPU | `docker stats` |
| View disk usage | `docker system df` |

