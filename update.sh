
#!/bin/bash

# Big Data Dashboard Update Script
echo "🔄 Big Data Dashboard Güncelleme Script'i"
echo "========================================="

APP_DIR="/var/www/big-data-dashboard/app"

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

cd "$APP_DIR"

# 1. Backup oluştur
log "Mevcut durum yedekleniyor..."
./backup-dashboard.sh

# 2. Git pull (eğer git repo ise)
if [ -d ".git" ]; then
    log "Git'ten güncellemeler çekiliyor..."
    git pull origin main
fi

# 3. Dependencies güncelle
log "Dependencies güncelleniyor..."
yarn install

# 4. Prisma güncelle
log "Prisma güncellemeler yapılıyor..."
npx prisma generate
npx prisma db push

# 5. Yeniden build
log "Yeniden build yapılıyor..."
yarn build

# 6. PM2 restart
log "Uygulama yeniden başlatılıyor..."
pm2 restart big-data-dashboard

# 7. Status kontrol
log "Status kontrol ediliyor..."
pm2 status

log "Güncelleme tamamlandı! ✅"
