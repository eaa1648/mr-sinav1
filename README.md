# Mr. Sina - Psikiyatrik Hastalıklarda AI Destekli Klinik İzlem Sistemi

Bu proje, psikiyatrik hastalıklarda yapay zeka destekli klinik izlem ve görüntüleme temelli karar destek sistemi olan **Mr. Sina**'dır.

## 🧠 Özellikler

### Frontend (Next.js 15.5.2)
- **Modern React** uygulaması TypeScript ile
- **Tailwind CSS** ile responsive tasarım
- **JWT tabanlı** güvenli authentication
- **Role-based** yetkilendirme (Doktor/Admin)
- **Real-time** bildirim sistemi
- **Interactive demo** modal sistemi

### Backend Services
- **Next.js API Routes** ile RESTful API
- **Prisma ORM** ile PostgreSQL veritabanı
- **Python/PyTorch** servisleri ile AI analiz
- **File upload** sistemi (DICOM, NIfTI, TIFF, JPEG/PNG)
- **PDF report** oluşturma sistemi

### AI/ML Özellikleri
- **PyTorch ResNet50** tabanlı MR görüntü analizi
- **Beyin hacim analizi** (hippokampus, amygdala, frontal/temporal korteks)
- **Karşılaştırmalı analiz** iki MR arasında
- **Risk değerlendirmesi** ve klinik yorumlama
- **Heatmap görselleştirme** 

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- PostgreSQL
- Python 3.8+ (AI servisleri için)

### Kurulum

1. **Veritabanını başlatın:**
   ```bash
   # PostgreSQL'i başlatın ve veritabanı oluşturun
   createdb mrv1
   ```

2. **Environment değişkenlerini ayarlayın:**
   ```bash
   cp .env.example .env
   # .env dosyasını düzenleyin
   ```

3. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

4. **Veritabanı şemasını oluşturun:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Python AI servislerini başlatın:**
   ```bash
   cd python_services
   ./start_service.sh
   ```

6. **Next.js uygulamasını başlatın:**
   ```bash
   npm run dev
   ```

### Erişim
- **Ana uygulama:** http://localhost:3000
- **Python AI servisi:** http://localhost:8001
- **API dokümantasyonu:** http://localhost:8001/docs

## 🏗️ Sistem Mimarisi

### Frontend Stack
- **Next.js 15.5.2** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend Stack
- **Next.js API Routes** - RESTful API
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication

### AI/ML Stack
- **Python 3.8+** - Backend language
- **PyTorch** - Deep learning framework
- **ResNet50** - Pre-trained model
- **FastAPI** - API framework
- **OpenCV** - Image processing
- **Nibabel/PyDICOM** - Medical image handling

## 📊 Veritabanı Şeması

### Ana Tablolar
- **Kullanicilar** - Doktor ve admin kullanıcıları
- **Hastalar** - Hasta kayıtları
- **Klinik_Moduller** - Hastalık modülleri (Bipolar, Şizofreni, vb.)
- **MR_Goruntuleri** - MR görüntü verileri
- **Klinik_Olcek_Puanlari** - YMRS, HAM-D, PANSS, GAF skorları
- **Raporlar** - AI destekli analiz raporları
- **Ilac_Tedavileri** - Tedavi geçmişi

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Doktor girişi
- `POST /api/auth/register` - Doktor kaydı
- `GET /api/auth/me` - Kullanıcı bilgileri

### Hasta Yönetimi
- `GET /api/patients` - Hasta listesi
- `POST /api/patients` - Yeni hasta ekleme
- `GET /api/patients/[id]` - Hasta detayları

### MR Görüntü İşleme
- `POST /api/patients/[id]/mr-images` - MR yükleme
- `GET /api/patients/[id]/mr-images` - MR listesi

### Rapor Sistemi
- `GET /api/reports` - Rapor listesi
- `POST /api/reports` - Yeni rapor oluşturma
- `POST /api/reports/generate-pdf` - PDF oluşturma

## 🧪 AI Servisleri

### Python Service Endpoints
- `POST /compare-mrs` - İki MR karşılaştırması
- `POST /process-single-mr` - Tek MR analizi
- `POST /start-background-processing` - Arka plan işleme
- `GET /processing-status/{task_id}` - İşlem durumu

### Desteklenen Formatlar
- **DICOM** (.dcm) - Tıbbi görüntüleme standardı
- **NIfTI** (.nii, .nii.gz) - Nörogörüntüleme formatı
- **TIFF** - Yüksek kaliteli görüntüler
- **JPEG/PNG** - Genel formatlar
