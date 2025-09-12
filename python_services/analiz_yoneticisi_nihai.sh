#!/bin/bash

# Mr. Sina MR Görüntü Analizi Yöneticisi
# Bu betik, FreeSurfer analizini otomatikleştirmek için tasarlanmıştır

# Renk tanımları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonu
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Yardım metni
show_help() {
    echo "Kullanım: $0 [SEÇENEKLER]"
    echo "Mr. Sina MR Görüntü Analizi Yöneticisi"
    echo ""
    echo "Seçenekler:"
    echo "  -h, --help              Bu yardım metnini gösterir"
    echo "  -i, --input DIR         Girdi dizini (DICOM dosyalarının bulunduğu dizin)"
    echo "  -o, --output DIR        Çıktı dizini (NIfTI ve analiz sonuçlarının kaydedileceği dizin)"
    echo "  -s, --subject ID        Konu ID'si (hasta kimliği)"
    echo "  -t, --type TYPE         MR tipi (T1, T2, FLAIR, vs.)"
    echo "  --force                 Mevcut analizi yeniden başlatır"
    echo ""
    echo "Örnek:"
    echo "  $0 -i /path/to/dicom -o /path/to/output -s subject001 -t T1"
}

# Varsayılan değerler
INPUT_DIR=""
OUTPUT_DIR=""
SUBJECT_ID=""
MR_TYPE=""
FORCE=false

# Argümanları işle
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -i|--input)
            INPUT_DIR="$2"
            shift 2
            ;;
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -s|--subject)
            SUBJECT_ID="$2"
            shift 2
            ;;
        -t|--type)
            MR_TYPE="$2"
            shift 2
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            log_error "Bilinmeyen seçenek: $1"
            show_help
            exit 1
            ;;
    esac
done

# Gerekli araçların mevcut olduğunu kontrol et
check_dependencies() {
    log "Gerekli araçlar kontrol ediliyor..."
    
    if ! command -v dcm2niix &> /dev/null; then
        log_error "dcm2niix bulunamadı. Lütfen dcm2niix'i kurun."
        exit 1
    fi
    
    if ! command -v recon-all &> /dev/null; then
        log_error "FreeSurfer (recon-all) bulunamadı. Lütfen FreeSurfer'i kurun."
        exit 1
    fi
    
    log_success "Tüm gerekli araçlar mevcut."
}

# DICOM'dan NIfTI'ye dönüşüm
convert_dicom_to_nifti() {
    local input_dir="$1"
    local output_dir="$2"
    local subject_id="$3"
    
    log "DICOM'dan NIfTI'ye dönüşüm yapılıyor: $subject_id"
    
    # Çıktı dizinini oluştur
    mkdir -p "$output_dir"
    
    # dcm2niix ile dönüşüm
    dcm2niix -f "${subject_id}_%s_%d" -o "$output_dir" "$input_dir"
    
    if [ $? -eq 0 ]; then
        log_success "DICOM'dan NIfTI'ye dönüşüm tamamlandı: $subject_id"
        return 0
    else
        log_error "DICOM'dan NIfTI'ye dönüşüm başarısız oldu: $subject_id"
        return 1
    fi
}

# FreeSurfer analizi
run_freesurfer_analysis() {
    local nifti_file="$1"
    local subject_id="$2"
    local output_dir="$3"
    
    log "FreeSurfer analizi başlatılıyor: $subject_id"
    
    # FreeSurfer SUBJECTS_DIR ayarla
    export SUBJECTS_DIR="$output_dir"
    
    # Analiz öncesi kontrol
    if [ "$FORCE" = false ] && [ -d "$SUBJECTS_DIR/$subject_id" ]; then
        log_warning "Konu zaten mevcut: $subject_id. Yeniden başlatmak için --force kullanın."
        return 0
    fi
    
    # Mevcut dizini temizle (force modda)
    if [ "$FORCE" = true ] && [ -d "$SUBJECTS_DIR/$subject_id" ]; then
        log_warning "Mevcut analiz siliniyor: $subject_id"
        rm -rf "$SUBJECTS_DIR/$subject_id"
    fi
    
    # recon-all komutunu çalıştır
    recon-all -i "$nifti_file" -s "$subject_id" -all
    
    if [ $? -eq 0 ]; then
        log_success "FreeSurfer analizi tamamlandı: $subject_id"
        return 0
    else
        log_error "FreeSurfer analizi başarısız oldu: $subject_id"
        return 1
    fi
}

# İstatistiksel verileri topla
collect_statistics() {
    local subject_id="$1"
    local output_dir="$2"
    
    log "İstatistiksel veriler toplanıyor: $subject_id"
    
    # FreeSurfer SUBJECTS_DIR ayarla
    export SUBJECTS_DIR="$output_dir"
    
    # aseg.stats dosyasını tabloya dönüştür
    asegstats2table --subjects "$subject_id" --meas volume --tablefile "$output_dir/${subject_id}_aseg_stats.txt"
    
    # aparc.stats dosyasını tabloya dönüştür (her iki hemisfer için)
    aparcstats2table --subjects "$subject_id" --hemi lh --meas thickness --tablefile "$output_dir/${subject_id}_lh_aparc_stats.txt"
    aparcstats2table --subjects "$subject_id" --hemi rh --meas thickness --tablefile "$output_dir/${subject_id}_rh_aparc_stats.txt"
    
    log_success "İstatistiksel veriler toplandı: $subject_id"
}

# Ana iş akışı
main() {
    # Gerekli araçları kontrol et
    check_dependencies
    
    # Gerekli parametrelerin sağlanıp sağlanmadığını kontrol et
    if [ -z "$INPUT_DIR" ] || [ -z "$OUTPUT_DIR" ] || [ -z "$SUBJECT_ID" ]; then
        log_error "Gerekli parametreler eksik. -i, -o ve -s seçeneklerini belirtin."
        show_help
        exit 1
    fi
    
    # Girdi dizininin mevcut olduğunu kontrol et
    if [ ! -d "$INPUT_DIR" ]; then
        log_error "Girdi dizini bulunamadı: $INPUT_DIR"
        exit 1
    fi
    
    log "MR Analiz Yöneticisi başlatılıyor"
    log "Konu ID: $SUBJECT_ID"
    log "Girdi dizini: $INPUT_DIR"
    log "Çıktı dizini: $OUTPUT_DIR"
    log "MR tipi: ${MR_TYPE:-Belirtilmemiş}"
    
    # 1. Adım: DICOM'dan NIfTI'ye dönüşüm
    if ! convert_dicom_to_nifti "$INPUT_DIR" "$OUTPUT_DIR" "$SUBJECT_ID"; then
        log_error "İşlem durduruldu: DICOM dönüşüm hatası"
        exit 1
    fi
    
    # Oluşturulan NIfTI dosyasını bul
    NIFTI_FILE=$(find "$OUTPUT_DIR" -name "${SUBJECT_ID}*.nii*" -type f | head -1)
    
    if [ -z "$NIFTI_FILE" ]; then
        log_error "Dönüştürülmüş NIfTI dosyası bulunamadı"
        exit 1
    fi
    
    log "NIfTI dosyası bulundu: $NIFTI_FILE"
    
    # 2. Adım: FreeSurfer analizi
    if ! run_freesurfer_analysis "$NIFTI_FILE" "$SUBJECT_ID" "$OUTPUT_DIR"; then
        log_error "İşlem durduruldu: FreeSurfer analiz hatası"
        exit 1
    fi
    
    # 3. Adım: İstatistiksel verileri topla
    collect_statistics "$SUBJECT_ID" "$OUTPUT_DIR"
    
    log_success "Tüm işlemler başarıyla tamamlandı: $SUBJECT_ID"
}

# Betiği çalıştır
main "$@"