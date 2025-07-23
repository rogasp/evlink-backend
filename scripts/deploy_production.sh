#!/bin/bash

# EVLink Backend Production Deployment Script
# Unified structure under /opt/evlinkha/

set -e  # Exit on any error

# Configuration
EVLINKHA_ROOT="/opt/evlinkha"
PRODUCTION_DIR="$EVLINKHA_ROOT/evlink-backend"
BACKUP_DIR="/opt/backups/evlink-backend"
CONFIG_DIR="$EVLINKHA_ROOT/config"
GITHUB_REPO="https://github.com/rogasp/evlink-backend.git"
BRANCH="security-and-performance-fixes"

echo "🚀 Starting EVLink Backend Production Deployment"
echo "================================================"

# 1. Create backup of current deployment
echo "📦 Creating backup of current deployment..."
if [ -d "$PRODUCTION_DIR" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r "$PRODUCTION_DIR" "$BACKUP_DIR/$BACKUP_NAME"
    echo "✅ Backup created at $BACKUP_DIR/$BACKUP_NAME"
else
    echo "ℹ️  No existing deployment found, skipping backup"
fi

# 2. Stop existing PM2 services (if running)
echo "⏹️  Stopping existing PM2 services..."
sudo pm2 stop evlink-backend 2>/dev/null || echo "ℹ️  Backend service was not running"
sudo pm2 stop evlink-frontend 2>/dev/null || echo "ℹ️  Frontend service was not running"

# Stop old systemd services if they exist (migration from systemd to PM2)
sudo systemctl stop evlink-backend 2>/dev/null || echo "ℹ️  No systemd evlink-backend service to stop"
sudo systemctl stop evlink-frontend 2>/dev/null || echo "ℹ️  No systemd evlink-frontend service to stop"

# 3. Update code from GitHub
echo "📥 Updating code from GitHub..."
if [ -d "$PRODUCTION_DIR" ]; then
    cd "$PRODUCTION_DIR"
    sudo -u fastapiserver git fetch origin
    sudo -u fastapiserver git reset --hard origin/$BRANCH
    echo "✅ Code updated from GitHub"
else
    sudo -u fastapiserver git clone "$GITHUB_REPO" "$PRODUCTION_DIR"
    cd "$PRODUCTION_DIR"
    sudo -u fastapiserver git checkout "$BRANCH"
fi

# 4. Set up backend Python environment
echo "🐍 Setting up backend Python environment..."
cd "$PRODUCTION_DIR/backend"
sudo rm -rf .venv
sudo -u fastapiserver python3 -m venv .venv
sudo -u fastapiserver .venv/bin/pip install --upgrade pip
sudo -u fastapiserver .venv/bin/pip install -r requirements.txt
echo "✅ Backend Python environment completed"

# 5. Set up frontend Node.js environment
echo "📦 Setting up frontend Node.js environment..."
cd "$PRODUCTION_DIR/frontend"
sudo rm -rf node_modules package-lock.json .next

# Create .env.local for frontend from shared config
echo "📝 Creating frontend environment configuration..."
# Source the main config and extract needed values
source "$CONFIG_DIR/.env"
sudo -u fastapiserver tee .env.local << EOF
# Supabase Configuration (from shared config)
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

sudo -u fastapiserver npm install
sudo -u fastapiserver npm run build
echo "✅ Frontend Node.js environment and build completed"

# 6. Verify configuration files exist
echo "⚙️  Verifying configuration files..."
if [ ! -f "$CONFIG_DIR/ecosystem.config.js" ]; then
    echo "❌ ERROR: ecosystem.config.js not found at $CONFIG_DIR!"
    exit 1
fi

# 7. Update deploy script if it exists in repository
echo "📜 Updating deploy script..."
if [ -f "$PRODUCTION_DIR/scripts/deploy_production.sh" ]; then
    sudo cp "$PRODUCTION_DIR/scripts/deploy_production.sh" "$EVLINKHA_ROOT/scripts/deploy-evlink-backend.sh"
    sudo chown fastapiserver:fastapiserver "$EVLINKHA_ROOT/scripts/deploy-evlink-backend.sh"
    sudo chmod +x "$EVLINKHA_ROOT/scripts/deploy-evlink-backend.sh"
    echo "✅ Deploy script updated from repository"
else
    echo "ℹ️  No deploy script update found in repository"
fi

# 8. Set proper permissions
echo "🔒 Setting proper permissions..."
sudo chown -R fastapiserver:fastapiserver "$PRODUCTION_DIR"

# 9. Start services with PM2
echo "🚀 Starting services with PM2..."
cd "$EVLINKHA_ROOT"
sudo pm2 start config/ecosystem.config.js --only evlink-backend
sudo pm2 start config/ecosystem.config.js --only evlink-frontend

# 10. Save PM2 configuration
echo "💾 Saving PM2 configuration..."
sudo pm2 save

# 11. Show service status
echo "📊 Service Status:"
sudo pm2 status

# 12. Test services
echo "🔍 Testing services..."
sleep 5

# Test backend health
if curl -f -s http://localhost:8005/api/health > /dev/null 2>&1; then
    echo "✅ Backend is responding on port 8005"
else
    echo "⚠️  Backend health check failed (may be starting up)"
fi

# Test frontend
if curl -f -s http://localhost:3005 > /dev/null 2>&1; then
    echo "✅ Frontend is responding on port 3005"
else
    echo "⚠️  Frontend health check failed (may be starting up)"
fi

echo ""
echo "🎉 EVLink Backend deployment completed successfully!"
echo "=================================================="
echo "📋 Next steps:"
echo "   1. Test backend at http://localhost:8005"
echo "   2. Test frontend at http://localhost:3005"
echo "   3. Check service logs: sudo pm2 logs evlink-backend evlink-frontend"
echo "   4. Monitor service status: sudo pm2 status"
echo ""
echo "🔗 Useful commands:"
echo "   • View backend logs: sudo pm2 logs evlink-backend"
echo "   • View frontend logs: sudo pm2 logs evlink-frontend"
echo "   • Restart services: sudo pm2 restart evlink-backend evlink-frontend"
echo "   • Stop services: sudo pm2 stop evlink-backend evlink-frontend"