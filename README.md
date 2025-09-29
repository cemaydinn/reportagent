# AI-Powered Report Agent 🤖📊

## 📋 Proje Özeti
Yapay zeka destekli, büyük veri setlerini analiz eden, özet çıkaran, trend belirleyen ve KPI'ları raporlayan akıllı raporlama asistanı.

## 🎯 Temel Özellikler
- 📁 Çoklu dosya formatı desteği (Excel, CSV, PDF, VR raporları)
- 🔍 Otomatik veri analizi ve özet çıkarma
- 📈 Trend analizi ve görselleştirme
- 🎯 KPI otomatik tespiti ve hesaplama
- 💬 Doğal dil ile soru-cevap (NLP)
- 📋 Aksiyon önerileri (Action Items)
- 🔄 Karşılaştırmalı analiz
- 📊 İnteraktif dashboard


### Backend
- **.NET Core 8.0** / **Node.js 20.x**
- **PostgreSQL** (Ana veritabanı)
- **Redis** (Cache)
- **RabbitMQ/Kafka** (Message Queue)

### Frontend
- **React 18.x** + **TypeScript**
- **Material-UI** / **Ant Design**
- **Chart.js** / **D3.js** (Görselleştirme)
- **Redux Toolkit** (State Management)

### AI/ML
- **Python FastAPI**
- **LangChain** / **OpenAI API**
- **Pandas** / **NumPy** (Veri işleme)
- **Scikit-learn** (ML modelleri)

### DevOps
- **Docker** + **Kubernetes**
- **GitHub Actions** (CI/CD)
- **Prometheus** + **Grafana** (Monitoring)

## 🚀 Kurulum

### Gereksinimler
- Docker & Docker Compose
- Node.js 20.x
- .NET SDK 8.0
- Python 3.11+
- PostgreSQL 15+

### Hızlı Başlangıç
```bash
# Repository'yi klonla
git clone git@github.com:cemaydinn/reportagent.git
cd ai-report-agent

# Environment dosyasını oluştur
cp .env.example .env

# Docker ile başlat
docker-compose up -d

# Frontend'i başlat
cd frontend
npm install
npm run dev

# Backend'i başlat
cd ../backend
dotnet restore
dotnet run
```

## 📊 Proje Durumu
- [x] Proje kurulumu
- [x] Temel API yapısı
- [ ] Dosya yükleme servisi
- [ ] Analiz motoru
- [ ] AI entegrasyonu
- [ ] Frontend dashboard
- [ ] Test coverage
- [ ] Production deployment

## 📄 Lisans
Bu proje [MIT Lisansı](./LICENSE) altında lisanslanmıştır.
