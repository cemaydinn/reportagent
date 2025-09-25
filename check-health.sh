
#!/bin/bash

# Big Data Dashboard Health Check Script
echo "🏥 Big Data Dashboard Sağlık Kontrolü"
echo "===================================="

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local service=$1
    local status=$(sudo systemctl is-active $service)
    
    if [ "$status" == "active" ]; then
        echo -e "${GREEN}✅ $service: Aktif${NC}"
        return 0
    else
        echo -e "${RED}❌ $service: $status${NC}"
        return 1
    fi
}

check_port() {
    local port=$1
    local service=$2
    
    if netstat -tuln | grep -q ":$port "; then
        echo -e "${GREEN}✅ Port $port ($service): Açık${NC}"
        return 0
    else
        echo -e "${RED}❌ Port $port ($service): Kapalı${NC}"
        return 1
    fi
}

# Sistem kaynakları
echo "📊 Sistem Kaynakları:"
echo "===================="
echo "CPU Kullanımı: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')% kullanımda"
echo ""

# Servis kontrolleri
echo "🔧 Servis Durumları:"
echo "==================="
check_service postgresql
check_service nginx
echo ""

# Port kontrolleri
echo "🌐 Port Kontrolleri:"
echo "==================="
check_port 80 "HTTP"
check_port 443 "HTTPS"
check_port 3000 "Next.js App"
check_port 5432 "PostgreSQL"
echo ""

# PM2 durumu
echo "⚡ PM2 Durumu:"
echo "============="
pm2 status
echo ""

# Database bağlantı testi
echo "💾 Database Bağlantı Testi:"
echo "=========================="
cd /var/www/big-data-dashboard/app
if npm run db:test 2>/dev/null; then
    echo -e "${GREEN}✅ Database bağlantısı başarılı${NC}"
else
    echo -e "${YELLOW}⚠️ Database bağlantı testi mevcut değil${NC}"
fi
echo ""

# Nginx konfigürasyon testi
echo "🌍 Nginx Konfigürasyon Testi:"
echo "============================"
if sudo nginx -t 2>/dev/null; then
    echo -e "${GREEN}✅ Nginx konfigürasyonu geçerli${NC}"
else
    echo -e "${RED}❌ Nginx konfigürasyon hatası${NC}"
fi
echo ""

# SSL sertifika durumu
echo "🔒 SSL Sertifika Durumu:"
echo "======================"
if command -v certbot >/dev/null; then
    sudo certbot certificates 2>/dev/null | grep -E "(Certificate Name|Expiry Date)" || echo -e "${YELLOW}⚠️ SSL sertifikası bulunamadı${NC}"
else
    echo -e "${YELLOW}⚠️ Certbot yüklü değil${NC}"
fi
echo ""

# Log dosyaları kontrol
echo "📋 Son Hatalar:"
echo "==============="
echo "PM2 Hataları (son 10 satır):"
pm2 logs big-data-dashboard --err --lines 10 --nostream 2>/dev/null || echo "PM2 log bulunamadı"
echo ""

echo "Nginx Hataları (son 10 satır):"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "Nginx error log bulunamadı"
echo ""

echo "🎯 Sağlık kontrolü tamamlandı!"
