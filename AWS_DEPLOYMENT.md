# AWS EC2 Deployment Guide

## Prerequisites
- AWS EC2 instance (Ubuntu 22.04 LTS)
- Domain name with DNS configured
- SSL certificates (Let's Encrypt recommended)
- PostgreSQL database (AWS RDS or local)

## Architecture
```
Frontend (Nginx) → https://yourdomain.com
Backend (Node.js + PM2) → https://api.yourdomain.com
Database (PostgreSQL) → AWS RDS or EC2
```

## 1. Server Setup

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PostgreSQL (if not using RDS)
sudo apt install -y postgresql postgresql-contrib

# Install PM2 globally
sudo npm install -g pm2

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

## 2. Backend Deployment

### Clone and Setup
```bash
# Clone repository
cd /var/www
sudo git clone <your-repo-url> educompass
cd educompass/backend

# Install dependencies
npm install --production

# Copy environment file
cp .env.example .env
sudo nano .env
```

### Configure Environment Variables
```env
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@your-rds-endpoint:5432/educompass_db

# URLs
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Google OAuth
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback

# Secrets
JWT_SECRET=<generate-strong-secret>
SESSION_SECRET=<generate-strong-secret>
```

### Start with PM2
```bash
# Start backend
pm2 start server.js --name educompass-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

## 3. Nginx Configuration

### Backend API (api.yourdomain.com)
```bash
sudo nano /etc/nginx/sites-available/educompass-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend (yourdomain.com)
```bash
sudo nano /etc/nginx/sites-available/educompass-frontend
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/educompass/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Sites
```bash
sudo ln -s /etc/nginx/sites-available/educompass-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/educompass-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. SSL Certificates

```bash
# Get SSL for API
sudo certbot --nginx -d api.yourdomain.com

# Get SSL for Frontend
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

## 5. Frontend Build & Deploy

```bash
cd /var/www/educompass/frontend

# Create production .env
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env.production

# Build
npm install
npm run build

# Verify build
ls -la dist/
```

## 6. Database Setup

### If using AWS RDS:
1. Create PostgreSQL instance in AWS RDS
2. Configure security group to allow EC2 access
3. Update `DATABASE_URL` in backend `.env`

### If using local PostgreSQL:
```bash
sudo -u postgres psql
CREATE DATABASE educompass_db;
CREATE USER educompass WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE educompass_db TO educompass;
\q

# Run migrations
cd /var/www/educompass/backend
node scripts/init_db.js
```

## 7. Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add Authorized Redirect URIs:
   - `https://api.yourdomain.com/api/auth/google/callback`
4. Update `GOOGLE_CALLBACK_URL` in backend `.env`

## 8. Firewall Configuration

```bash
# Allow HTTP, HTTPS, SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 9. Monitoring & Logs

```bash
# View PM2 logs
pm2 logs educompass-api

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitor PM2 processes
pm2 monit
```

## 10. Deployment Updates

```bash
# Pull latest changes
cd /var/www/educompass
sudo git pull

# Update backend
cd backend
npm install --production
pm2 restart educompass-api

# Update frontend
cd ../frontend
npm install
npm run build
```

## Health Check

Test your deployment:
- Backend: `https://api.yourdomain.com/api/health`
- Frontend: `https://yourdomain.com`

## Troubleshooting

### Backend not starting
```bash
pm2 logs educompass-api --lines 100
```

### CORS errors
- Verify `FRONTEND_URL` in backend `.env`
- Check Nginx proxy headers

### Google OAuth failing
- Verify callback URL in Google Console
- Check `GOOGLE_CALLBACK_URL` in `.env`
- Ensure SSL is working

### Database connection issues
- Check `DATABASE_URL` format
- Verify security group rules (if using RDS)
- Test connection: `psql $DATABASE_URL`
