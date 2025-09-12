# Mr. Sina Projesine MR İşleme Uygulamalarının Entegrasyonu

Bu belge, bilgi.txt dosyasında belirtilen MR (Manyetik Rezonans) görüntü işleme uygulamalarının mevcut Mr. Sina projesine nasıl entegre edileceğini açıklamaktadır.

## 1. Mevcut Yapı

Mr. Sina projesi şu anda aşağıdaki bileşenleri içermektedir:

- **Frontend**: Next.js ile oluşturulmuş bir web arayüzü
- **Backend**: Python tabanlı FastAPI servisi
- **MRI İşleme**: PyTorch tabanlı bir beyin MRI işlemcisi (brain_mri_processor.py)
- **Segmentasyon**: Hugging Face tabanlı beyin segmentasyonu (huggingface_brain_seg.py)

## 2. Yeni MR İşleme İş Akışı

bilgi.txt dosyasında tanımlanan yeni MR işleme iş akışı 5 ana aşamadan oluşmaktadır:

### 2.1. Ortam Kurulumu
- WSL2 ve Ubuntu
- NVIDIA CUDA Driver for WSL
- FreeSurfer yazılımı
- Yardımcı araçlar (tcsh, libgomp1, x11-apps, htop)

### 2.2. Veri Dönüştürme
- dcm2niix aracı ile DICOM formatından NIfTI formatına dönüşüm

### 2.3. Beyin Analizi
- FreeSurfer ile T1/T2 ağırlıklı MR görüntülerinin analizi
- recon-all komutu kullanımı

### 2.4. Otomasyon
- analiz_yoneticisi_nihai.sh betiği ile tüm sürecin otomasyonu

## 3. Entegrasyon Yaklaşımı

Mevcut PyTorch tabanlı sistem ile yeni Linux tabanlı FreeSurfer sistemini entegre etmek için aşağıdaki yaklaşımı öneriyoruz:

### 3.1. Backend (Python Servis) Entegrasyonu

#### 3.1.1. Sistem Gereksinimlerinin Kurulumu

Öncelikle, yeni MR işleme iş akışı için gerekli sistem bileşenlerini kurmak gerekmektedir:

1. **WSL2 ve Ubuntu Kurulumu** (Windows için):
   ```bash
   wsl --install
   ```

2. **FreeSurfer Kurulumu** (Ubuntu içinde):
   ```bash
   sudo apt-get update
   sudo apt-get install tcsh libgomp1 x11-apps htop
   wget [FreeSurfer indirme linki]
   ```

3. **dcm2niix Kurulumu**:
   - Windows için: GitHub'dan dcm2niix_win.zip indirilip kurulur
   - Ubuntu için: `sudo apt-get install dcm2niix`

#### 3.1.2. Python Servisine Yeni Endpoint'ler Ekleme

Mevcut `main.py` dosyasına yeni MR işleme iş akışı için yeni endpoint'ler eklenmelidir:

1. **DICOM'dan NIfTI'ye Dönüştürme Endpoint'i**:
   ```python
   @app.post("/convert-dicom-to-nifti")
   async def convert_dicom_to_nifti(file: UploadFile = File(...)):
       # dcm2niix aracını çağırarak dönüşüm işlemini yapar
       pass
   ```

2. **FreeSurfer ile Beyin Analizi Endpoint'i**:
   ```python
   @app.post("/freesurfer-analysis")
   async def freesurfer_analysis(nifti_file_path: str):
       # FreeSurfer'ın recon-all komutunu çağırır
       pass
   ```

3. **Otomasyon Betiğini Çalıştırma Endpoint'i**:
   ```python
   @app.post("/run-analysis-manager")
   async def run_analysis_manager():
       # analiz_yoneticisi_nihai.sh betiğini çalıştırır
       pass
   ```

#### 3.1.3. Sistem Komutlarını Çalıştırma

Yeni MR işleme iş akışı sistem seviyesinde komutların çalıştırılmasını gerektirir. Bu nedenle Python servisine aşağıdaki yardımcı fonksiyonlar eklenmelidir:

```python
import subprocess
import asyncio

def run_system_command(command: str) -> dict:
    """Sistem seviyesinde komut çalıştırır ve çıktıyı döner"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return {
            "success": True,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
```

### 3.2. Frontend Entegrasyonu

#### 3.2.1. Yeni MR İşleme Arayüzü

Frontend'e yeni MR işleme iş akışı için bir arayüz eklenmelidir:

1. **DICOM Yükleme Bileşeni**:
   - Kullanıcıların DICOM dosyalarını yükleyebileceği bir form
   - Dosya yükleme sonrası otomatik NIfTI dönüşümü

2. **İşlem Seçenekleri Bileşeni**:
   - Kullanıcıların işlem türünü seçebileceği seçenekler
   - FreeSurfer analizi için parametre ayarları

3. **İşlem Durumu İzleme Bileşeni**:
   - Uzun süren işlemler için gerçek zamanlı durum güncellemeleri
   - İlerleme çubuğu ve log görüntüleme

#### 3.2.2. Mevcut Arayüz ile Entegrasyon

Yeni MR işleme iş akışı mevcut arayüzle aşağıdaki şekilde entegre edilmelidir:

1. **Hasta Kayıt Sistemi**:
   - Yeni MR işlemleri mevcut hasta kayıt sistemi ile entegre edilmeli
   - Her işleme hasta ID'si atanmalı

2. **Rapor Görüntüleme**:
   - FreeSurfer analiz sonuçları mevcut raporlama sistemine entegre edilmeli
   - 3D görselleştirme sonuçları görüntülenebilmeli

## 4. Gerekli Değişiklikler

### 4.1. Backend Değişiklikleri

1. **Yeni Bağımlılıklar**:
   - `subprocess` modülünü kullanmak için ek bağımlılık gerekmez
   - Ancak sistem komutlarının çalışabilmesi için uygun izinler sağlanmalı

2. **Yeni Endpoint'ler**:
   - `main.py` dosyasına yeni 3 endpoint eklenmeli
   - Her endpoint için uygun hata işleme ve loglama yapılmalı

3. **Yapılandırma Dosyaları**:
   - FreeSurfer ve dcm2niix yolları için yapılandırma dosyası oluşturulmalı
   - WSL ile iletişim için gerekli ayarlamalar yapılmalı

### 4.2. Frontend Değişiklikleri

1. **Yeni Sayfalar**:
   - `/mr-processing` sayfası oluşturulmalı
   - DICOM yükleme ve işleme başlatma formu eklenmeli

2. **API Entegrasyonu**:
   - Yeni endpoint'ler için API servis fonksiyonları yazılmalı
   - Asenkron işlem durumu kontrolü için websocket veya polling mekanizması kurulmalı

3. **UI Bileşenleri**:
   - Yeni MR işleme iş akışı için özel bileşenler geliştirilmeli
   - 3D görselleştirme için uygun kütüphaneler entegre edilmeli

## 5. Dağıtım ve Kurulum

### 5.1. Geliştirme Ortamı

1. **Windows Geliştiriciler için**:
   - WSL2 kurulumu yapılması gereklidir
   - Ubuntu içinde gerekli tüm araçların kurulması
   - VS Code Remote-WSL eklentisinin kullanılması önerilir

2. **Linux Geliştiriciler için**:
   - Doğrudan gerekli araçların kurulması yeterlidir
   - FreeSurfer lisansının alınması gereklidir

### 5.2. Üretim Ortamı

1. **Sunucu Yapılandırması**:
   - Linux tabanlı bir sunucu kullanılmalı
   - FreeSurfer ve diğer araçlar sunucuya kurulmalı
   - Gerekli lisanslar sağlanmalı

2. **Docker Desteği**:
   - Uygun bir Docker imajı oluşturulmalı
   - FreeSurfer ve diğer araçlar için özel Dockerfile hazırlanmalı

## 6. Test Senaryoları

### 6.1. Birim Testleri

1. **DICOM'dan NIfTI'ye Dönüştürme Testi**:
   - Farklı DICOM dosyalarıyla dönüşüm testi
   - Hatalı dosyalar için hata işleme testi

2. **FreeSurfer Analiz Testi**:
   - Örnek NIfTI dosyalarıyla analiz testi
   - Bellek ve işlemci kullanımı izleme

### 6.2. Entegrasyon Testleri

1. **Tam İş Akışı Testi**:
   - DICOM yükleme → NIfTI dönüşüm → FreeSurfer analiz → Rapor oluşturma
   - Tüm adımların doğru sıralamala çalışması

2. **Hata Durumları Testi**:
   - Her adımda olası hataların doğru işlenmesi
   - Kullanıcıya uygun hata mesajlarının gösterilmesi

## 7. Güvenlik ve Performans

### 7.1. Güvenlik Önlemleri

1. **Sistem Komutları**:
   - Kullanıcı girdileri asla doğrudan sistem komutlarında kullanılmamalı
   - Tüm girdiler uygun şekilde temizlenmeli ve doğrulanmalı

2. **Dosya Yükleme**:
   - Yalnızca izin verilen dosya türlerinin kabul edilmesi
   - Dosya boyutu sınırlamalarının uygulanması

### 7.2. Performans Optimizasyonları

1. **Asenkron İşleme**:
   - Uzun süren işlemler için asenkron yapıların kullanılması
   - Kuyruk sistemi ile işlem yönetimi

2. **Kaynak Yönetimi**:
   - FreeSurfer analizleri için CPU ve bellek sınırlamaları
   - Paralel işlem desteği için gerekli yapılandırmalar

## 8. Sorun Giderme

### 8.1. Yaygın Sorunlar

1. **FreeSurfer Lisans Hatası**:
   - Çözüm: Geçerli bir FreeSurfer lisansının kurulumu

2. **WSL2 Bağlantı Problemleri**:
   - Çözüm: WSL2 servisinin yeniden başlatılması

3. **Bellek Yetersizliği**:
   - Çözüm: Sunucu kaynaklarının artırılması veya işlem sınırlamaları

### 8.2. Loglama ve İzleme

1. **Detaylı Loglama**:
   - Her adımda ayrıntılı log kayıtlarının tutulması
   - Hata durumlarında detaylı hata mesajlarının loglanması

2. **Performans İzleme**:
   - İşlem sürelerinin izlenmesi
   - Kaynak kullanımının raporlanması

## 9. Gelecekteki Geliştirmeler

1. **Makine Öğrenmesi Modeli ile Entegrasyon**:
   - FreeSurfer sonuçlarının mevcut PyTorch modelleriyle entegrasyonu
   - Hibrit analiz yaklaşımı geliştirilmesi

2. **Otomatik Kalite Kontrol**:
   - İşlem sonuçlarının otomatik olarak doğrulanması
   - Anormal sonuçlar için uyarı sistemleri

3. **Gelişmiş Görselleştirme**:
   - 3D beyin yapılarının interaktif görüntülenmesi
   - Zaman içindeki değişimin animasyonlu gösterimi

Bu entegrasyon rehberi, bilgi.txt dosyasında belirtilen MR işleme uygulamalarının Mr. Sina projesine sorunsuz bir şekilde entegre edilmesini sağlamayı amaçlamaktadır.