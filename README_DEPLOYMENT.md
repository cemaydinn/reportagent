
# 🚀 Big Data Dashboard - Kendi Sunucuya Deployment

Projenizi kendi sunucunuza deploy etmek için hazırladığım kapsamlı rehber ve otomatik script'ler.

## 📋 Hazırladığım Dosyalar

### 1. **DEPLOYMENT_GUIDE_TR.md**
- Detaylı, adım adım deployment rehberi
- Tüm gereksinimleri ve konfigürasyonları içerir
- Troubleshooting ve performans optimizasyon önerileri

### 2. **deploy.sh** (Otomatik Kurulum Script'i)
- Tek komutla tüm deployment sürecini otomatikleştirir
- PostgreSQL, Nginx, PM2 kurulumu ve konfigürasyonu
- Database oluşturma ve kullanıcı ayarları

### 3. **update.sh** (Güncelleme Script'i)
- Projenizi güvenli şekilde güncellemek için
- Backup alır, build yapar, PM2'yi restart eder

### 4. **check-health.sh** (Sağlık Kontrolü Script'i)
- Sistem durumunu kontrol eder
- Servislerin çalışıp çalışmadığını test eder
- Hataları tespit eder ve raporlar

## 🎯 Hızlı Başlangıç

### Adım 1: Sunucu Hazırlığı
```bash
# Ubuntu/Debian sunucunuza SSH ile bağlanın
ssh user@your-server-ip

# Proje dosyalarını sunucuya yükleyin (SCP, SFTP, Git vs.)
```

### Adım 2: Otomatik Deployment
```bash
# Script'i çalıştırın
./deploy.sh yourdomain.com

# Örnek:
./deploy.sh mydashboard.com
```

Bu script aşağıdakileri otomatik olarak yapar:
- ✅ Sistem güncellemesi
- ✅ Node.js, PostgreSQL, Nginx kurulumu
- ✅ Veritabanı oluşturma ve konfigürasyon
- ✅ Environment variables ayarlama
- ✅ Dependencies yükleme ve build
- ✅ PM2 ile process management
- ✅ Nginx reverse proxy konfigürasyonu
- ✅ Firewall ayarları

### Adım 3: Çevre Değişkenlerini Düzenleyin
```bash
nano /var/www/big-data-dashboard/app/.env
```

Önemli: Aşağıdaki değerleri kendi ayarlarınızla değiştirin:
- **AWS S3 ayarları** (file upload için)
- **ABACUSAI_API_KEY** (AI chat için)

### Adım 4: SSL Sertifikası
```bash
# Domain'iniz varsa SSL sertifikası alın
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🔧 Yönetim Komutları

### Uygulama Durumu Kontrol
```bash
# Sağlık kontrolü
./check-health.sh

# PM2 durumu
pm2 status
pm2 logs big-data-dashboard

# Nginx durumu
sudo systemctl status nginx
```

### Uygulama Güncelleme
```bash
# Güncelleme script'i
./update.sh
```

### Manuel Komutlar
```bash
# Uygulamayı restart et
pm2 restart big-data-dashboard

# Nginx reload
sudo systemctl reload nginx

# Veritabanı backup
~/backup-dashboard.sh
```

## 📊 Sunucu Gereksinimleri

### Minimum:
- **RAM**: 2GB
- **CPU**: 2 core
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+

### Önerilen:
- **RAM**: 4GB+
- **CPU**: 4 core+
- **Storage**: 50GB+ SSD
- **Network**: 1Gbps+

## 🔒 Güvenlik Özellikleri

Script otomatik olarak aşağıdaki güvenlik ayarlarını yapar:
- ✅ UFW Firewall konfigürasyonu
- ✅ SSL/HTTPS desteği (Let's Encrypt)
- ✅ Nginx güvenlik headers'ları
- ✅ PostgreSQL güvenli kullanıcı ayarları
- ✅ Environment variables güvenliği

## 🗄️ Backup Stratejisi

### Otomatik Backup:
```bash
# Günlük otomatik backup için crontab
crontab -e

# Ekleyin:
0 2 * * * ~/backup-dashboard.sh >> /var/log/backup.log 2>&1
```

### Manuel Backup:
```bash
# Backup çalıştır
~/backup-dashboard.sh

# Backup'ları kontrol et
ls -la ~/backups/
```

## 🌐 Domain Ayarları

DNS ayarlarınızda:
- **A Record**: `yourdomain.com` → `sunucu-ip-adresi`
- **A Record**: `www.yourdomain.com` → `sunucu-ip-adresi`

## 🚨 Sorun Giderme

### Yaygın Problemler:

#### Build Hatası
```bash
cd /var/www/big-data-dashboard/app
rm -rf node_modules .next
yarn install
yarn build
pm2 restart big-data-dashboard
```

#### Database Bağlantı Sorunu
```bash
sudo systemctl restart postgresql
# .env dosyasında DATABASE_URL'i kontrol edin
```

#### Nginx 502 Error
```bash
pm2 status  # Uygulama çalışıyor mu?
pm2 restart big-data-dashboard
sudo systemctl restart nginx
```

### Log Dosyaları:
```bash
# PM2 logs
pm2 logs big-data-dashboard

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

## 🎨 Özelleştirmeler

### Performance Tuning:
```bash
# PM2 cluster mode (CPU core sayısına göre)
pm2 start ecosystem.config.js

# Nginx worker processes ayarı
sudo nano /etc/nginx/nginx.conf
# worker_processes auto;
```

### Monitoring:
```bash
# PM2 monitoring (opsiyonel)
pm2 install pm2-server-monit

# System monitoring
sudo apt install htop iotop -y
```

## 📞 Destek

Herhangi bir sorun yaşarsanız:

1. **Sağlık kontrolü çalıştırın**: `./check-health.sh`
2. **Log dosyalarını kontrol edin**: `pm2 logs big-data-dashboard`
3. **Sistem kaynaklarını kontrol edin**: `htop`, `df -h`

## 🎉 Tamamlandı!

Bu rehber ve script'ler ile projenizi profesyonel düzeyde deploy edebilirsiniz. 

**Önemli**: 
- AWS S3 ayarlarınızı yapmayı unutmayın
- SSL sertifikası alın
- Düzenli backup yapın
- Sistem güncellemelerini takip edin

**Başarılar!** 🚀

---

*Bu deployment rehberi, Big Data Dashboard projeniz için özel olarak hazırlanmıştır.*
