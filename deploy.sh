#!/bin/bash

# NW Native Plant Explorer - Deployment Script
# Usage: ./deploy.sh [DROPLET_IP]

set -e

DROPLET_IP=$1
REMOTE_USER=${REMOTE_USER:-root}
APP_DIR="/opt/nw-plants"

if [ -z "$DROPLET_IP" ]; then
    echo "Usage: ./deploy.sh [DROPLET_IP]"
    echo "Example: ./deploy.sh 142.93.123.45"
    exit 1
fi

echo "🚀 Deploying NW Native Plant Explorer to $DROPLET_IP..."

# Create remote directory
echo "📁 Creating remote directory..."
ssh $REMOTE_USER@$DROPLET_IP "mkdir -p $APP_DIR"

# Copy files to droplet
echo "📤 Copying files to droplet..."
rsync -avz --exclude 'venv' \
           --exclude 'node_modules' \
           --exclude '.git' \
           --exclude '__pycache__' \
           --exclude 'frontend/dist' \
           --exclude 'frontend/.vite' \
           ./ $REMOTE_USER@$DROPLET_IP:$APP_DIR/

# Run deployment on droplet
echo "🔧 Setting up application on droplet..."
ssh $REMOTE_USER@$DROPLET_IP << 'ENDSSH'
set -e

cd /opt/nw-plants

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down || true

# Build and start containers
echo "Building and starting containers..."
docker-compose build
docker-compose up -d

# Check container status
echo "Checking container status..."
sleep 5
docker-compose ps

echo "✅ Deployment complete!"
echo "🌐 Access your app at: http://$(curl -s ifconfig.me)"
ENDSSH

echo ""
echo "✨ Deployment successful!"
echo "🌐 Your app is live at: http://$DROPLET_IP"
echo ""
echo "Useful commands:"
echo "  ssh $REMOTE_USER@$DROPLET_IP"
echo "  cd /opt/nw-plants && docker-compose logs -f"
echo "  cd /opt/nw-plants && docker-compose restart"
