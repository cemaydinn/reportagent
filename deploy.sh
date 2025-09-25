
#!/bin/bash

# Big Data Dashboard Deployment Script
# Usage: ./deploy.sh [domain] [db_password]

set -e

echo "🚀 Big Data Dashboard Deployment Script"
echo "========================================"

# Değişkenler
DOMAIN=${1:-"localhost"}
DB_PASSWORD=${2:-"$(openssl rand -base64 32)"}
PROJECT_DIR="/var/www/big-data-dashboard"
APP_DIR="$PROJECT_DIR/app"
DB_NAME="big_data_dashboard"
DB_USER="dashboard_user"

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonksiyonlar
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Root kontrolü
if [[ $EUID -eq 0 ]]; then
   error "Bu script'i root user ile çalıştırmayın!"
fi

# İşletim sistemi tespiti
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
else
    error "İşletim sistemi tespit edilemedi"
fi

log "İşletim sistemi: $OS"
log "Domain: $DOMAIN"
log "Database şifresi oluşturuldu: ${DB_PASSWORD:0:8}..."

# 1. Sistem güncellemesi
log "Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# 2. Gerekli paketleri yükle
log "Gerekli paketler yükleniyor..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib nginx git

# Node.js versiyonu kontrol
NODE_VERSION=$(node --version)
log "Node.js versiyonu: $NODE_VERSION"

# 3. Yarn ve PM2 kurulumu
log "Yarn ve PM2 yükleniyor..."
npm install -g yarn pm2

# 4. Proje dizinini oluştur
log "Proje dizini oluşturuluyor..."
if [ ! -d "$PROJECT_DIR" ]; then
    sudo mkdir -p "$PROJECT_DIR"
    sudo chown $USER:$USER "$PROJECT_DIR"
fi

# 5. PostgreSQL konfigürasyonu
log "PostgreSQL konfigürasyonu yapılıyor..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Veritabanı oluştur
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || warn "Veritabanı zaten mevcut"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>/dev/null || warn "Kullanıcı zaten mevcut"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

log "Veritabanı konfigürasyonu tamamlandı"

# 6. Proje dosyalarını kopyala (mevcut konumdan)
log "Proje dosyaları kopyalanıyor..."
if [ -d "/home/ubuntu/big_data_dashboard" ]; then
    cp -r /home/ubuntu/big_data_dashboard/* "$PROJECT_DIR/"
    log "Proje dosyaları kopyalandı"
else
    warn "Kaynak proje dizini bulunamadı. Manuel olarak kopyalamanız gerekebilir."
fi

# 7. Environment dosyası oluştur
log ".env dosyası oluşturuluyor..."
cat > "$APP_DIR/.env" << EOL
# Database
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

# NextAuth
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# AWS S3 - Kendi ayarlarınızı girin
AWS_PROFILE=default
AWS_REGION=eu-west-1
AWS_BUCKET_NAME=your-bucket-name
AWS_FOLDER_PREFIX=uploads/
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# LLM API - Kendi API key'inizi girin
ABACUSAI_API_KEY="your-api-key-here"

# Production
NODE_ENV=production
PORT=3000
EOL

log ".env dosyası oluşturuldu"

# 8. Node.js bağımlılıkları yükle
log "Node.js bağımlılıkları yükleniyor..."
cd "$APP_DIR"
yarn install

# 9. Prisma setup
log "Prisma konfigürasyonu yapılıyor..."
npx prisma generate
npx prisma db push

# 10. Next.js build
log "Next.js build yapılıyor..."
yarn build

log "Build tamamlandı"

# 11. PM2 ecosystem dosyası oluştur
log "PM2 konfigürasyonu yapılıyor..."
cat > "$APP_DIR/ecosystem.config.js" << EOL
module.exports = {
  apps: [{
    name: 'big-data-dashboard',
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/log/pm2/big-data-dashboard.log',
    error_file: '/var/log/pm2/big-data-dashboard-error.log',
    out_file: '/var/log/pm2/big-data-dashboard-out.log',
    time: true
  }]
};
EOL

# PM2 log dizini oluştur
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# 12. PM2 ile başlat
log "Uygulama PM2 ile başlatılıyor..."
pm2 start ecosystem.config.js
pm2 startup
pm2 save

# 13. Nginx konfigürasyonu
log "Nginx konfigürasyonu yapılıyor..."
sudo tee /etc/nginx/sites-available/big-data-dashboard > /dev/null << EOL
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        client_max_body_size 100M;
    }
    
    # Static files caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOL

# Nginx site'ı aktif et
sudo ln -sf /etc/nginx/sites-available/big-data-dashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx test ve restart
sudo nginx -t && sudo systemctl restart nginx
sudo systemctl enable nginx

# 14. Firewall konfigürasyonu
log "Firewall konfigürasyonu yapılıyor..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# 15. Backup script oluştur
log "Backup script'i oluşturuluyor..."
mkdir -p ~/backups

cat > ~/backup-dashboard.sh << 'EOL'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups"
DB_NAME="big_data_dashboard"
DB_USER="dashboard_user"

mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Proje dosyaları backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/big-data-dashboard

# Eski backup'ları sil (30 günden eski)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOL

chmod +x ~/backup-dashboard.sh

# 16. Status kontrolleri
log "Servis durumları kontrol ediliyor..."
echo "=================================="
echo "PostgreSQL: $(sudo systemctl is-active postgresql)"
echo "Nginx: $(sudo systemctl is-active nginx)"
echo "PM2 Processes:"
pm2 status

# 17. SSL sertifikası kurulumu (Let's Encrypt)
if [ "$DOMAIN" != "localhost" ]; then
    log "SSL sertifikası için Certbot yükleniyor..."
    sudo apt install certbot python3-certbot-nginx -y
    
    warn "SSL sertifikası almak için şu komutu çalıştırın:"
    echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# 18. Sonuç
echo ""
echo "🎉 Deployment tamamlandı!"
echo "=========================="
echo "Domain: http://$DOMAIN"
echo "Database: $DB_NAME"
echo "Database User: $DB_USER"
echo "Database Password: $DB_PASSWORD"
echo ""
echo "Önemli Notlar:"
echo "- .env dosyasında AWS S3 ve API key ayarlarını yapın"
echo "- SSL sertifikası için yukarıdaki certbot komutunu çalıştırın"
echo "- PM2 logları: pm2 logs big-data-dashboard"
echo "- Nginx logları: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "Backup script'i: ~/backup-dashboard.sh"
echo "Manuel backup: ./backup-dashboard.sh"
echo ""
log "Deployment başarıyla tamamlandı! 🚀"
