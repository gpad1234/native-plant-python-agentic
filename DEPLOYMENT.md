# Deployment Guide - DigitalOcean Droplet

## Prerequisites

1. **DigitalOcean Droplet** (Ubuntu 22.04 LTS recommended)
   - Minimum: 2GB RAM, 1 vCPU
   - Recommended: 4GB RAM, 2 vCPU

2. **SSH Access** to your droplet
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

## Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
./deploy.sh YOUR_DROPLET_IP
```

This will:
- Install Docker and Docker Compose
- Copy all files to the droplet
- Build and start containers
- Deploy at http://YOUR_DROPLET_IP

### Option 2: Manual Deployment

#### 1. Copy files to droplet
```bash
rsync -avz --exclude 'venv' --exclude 'node_modules' --exclude '.git' \
  ./ root@YOUR_DROPLET_IP:/opt/nw-plants/
```

#### 2. SSH into droplet
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/nw-plants
```

#### 3. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

#### 4. Install Docker Compose
```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 5. Build and start
```bash
docker-compose build
docker-compose up -d
```

## Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Test backend
curl http://localhost:8000/api/health

# Test frontend
curl http://localhost:80
```

## Managing the Application

### Start/Stop/Restart
```bash
docker-compose up -d      # Start
docker-compose down       # Stop
docker-compose restart    # Restart
```

### View Logs
```bash
docker-compose logs -f backend    # Backend logs
docker-compose logs -f frontend   # Frontend logs
docker-compose logs -f            # All logs
```

### Update Application
```bash
# On your local machine
./deploy.sh YOUR_DROPLET_IP

# Or manually on droplet
cd /opt/nw-plants
git pull  # if using git
docker-compose build
docker-compose up -d
```

## Setup Custom Domain (Optional)

### 1. Point domain to droplet IP
Add an A record in your DNS settings:
```
A    @    YOUR_DROPLET_IP
A    www  YOUR_DROPLET_IP
```

### 2. Install SSL with Let's Encrypt
```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Install certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Stop containers temporarily
cd /opt/nw-plants
docker-compose down

# Get SSL certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx.conf to include SSL
# Then restart
docker-compose up -d
```

## Firewall Setup

```bash
# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp  # SSH
ufw enable
```

## Monitoring

### Check resource usage
```bash
docker stats
```

### Check disk space
```bash
df -h
docker system df
```

### Clean up unused images
```bash
docker system prune -a
```

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port already in use
```bash
# Find process using port 80
lsof -i :80
kill -9 PID

# Or use different ports in docker-compose.yml
```

### Out of memory
```bash
# Check memory
free -h

# Restart containers
docker-compose restart
```

## Performance Optimization

### 1. Enable HTTP/2 in nginx
Add to nginx.conf:
```nginx
listen 443 ssl http2;
```

### 2. Add Redis cache (optional)
See docker-compose.yml for Redis service example

### 3. Setup monitoring
- DigitalOcean Monitoring (built-in)
- Or install Prometheus + Grafana

## Backup

### Backup application
```bash
# On droplet
cd /opt
tar -czf nw-plants-backup-$(date +%Y%m%d).tar.gz nw-plants/
```

### Restore backup
```bash
cd /opt
tar -xzf nw-plants-backup-YYYYMMDD.tar.gz
cd nw-plants
docker-compose up -d
```

## Costs Estimate

- **Droplet**: $12-24/month (2-4GB RAM)
- **Domain**: $10-15/year (optional)
- **SSL**: Free (Let's Encrypt)

**Total**: ~$12-24/month

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify containers: `docker-compose ps`
3. Test backend: `curl http://localhost:8000/api/health`
