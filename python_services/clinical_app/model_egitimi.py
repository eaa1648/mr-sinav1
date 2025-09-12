import pandas as pd
import numpy as np
import json
from pathlib import Path
from sklearn.model_selection import train_test_split
import xgboost as xgb
import joblib
from datetime import datetime

print("Mr. Sina - Modelleme ve Eğitim Script'i Başlatıldı...")

# --- AYARLAR ---
VERI_DOSYASI = Path("tum_hastalar_klinik_veri.json")

def veri_yukle(dosya_yolu: Path) -> list:
    """Verilen yoldaki JSON dosyasını yükler."""
    try:
        with open(dosya_yolu, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"HATA: '{dosya_yolu}' dosyası bulunamadı.")
        return []
    except json.JSONDecodeError:
        print(f"HATA: '{dosya_yolu}' dosyası geçerli bir JSON formatında değil.")
        return []

# --- PUAN HESAPLAMA (analiz_raporlama.py'deki en güncel ve tutarlı versiyon) ---
def calculate_mr_sina_score(hasta_data):
    klinik_olcekler = hasta_data.get("klinikOlcekSonuclari", {})
    if not klinik_olcekler: return None
    
    raw_gaf = klinik_olcekler.get("GAF", {}).get("hamSkor", 55)
    raw_ymrs = klinik_olcekler.get("YMRS", {}).get("hamSkor", 0)
    raw_hdrs = klinik_olcekler.get("HDRS", {}).get("hamSkor", 0)
    
    # Hem eski (ALDA_A/B) hem de yeni (tek ALDA) formatını destekle
    if "ALDA" in klinik_olcekler:
        alda_puan = klinik_olcekler.get("ALDA", {}).get("hamSkor", 0)
    else:
        raw_alda_a = klinik_olcekler.get("ALDA_A", {}).get("hamSkor", 0)
        raw_alda_b = klinik_olcekler.get("ALDA_B", {}).get("hamSkor", 0)
        alda_puan = raw_alda_a - raw_alda_b
        
    raw_spaq = klinik_olcekler.get("SPAQ", {}).get("hamSkor", 0)
    raw_sao = klinik_olcekler.get("SAO", {}).get("hamSkor", 50)

    if raw_gaf is None or pd.isna(raw_gaf): return None

    if raw_gaf >= 90: gaf_puan = 0
    elif raw_gaf >= 80: gaf_puan = 1
    elif raw_gaf >= 70: gaf_puan = 2
    elif raw_gaf >= 60: gaf_puan = 3
    elif raw_gaf >= 50: gaf_puan = 4
    elif raw_gaf >= 40: gaf_puan = 5
    elif raw_gaf >= 31: gaf_puan = 6
    elif raw_gaf >= 20: gaf_puan = 7
    elif raw_gaf >= 10: gaf_puan = 8
    else: gaf_puan = 9
    
    if raw_sao <= 41: sao_puan = 2
    elif raw_sao <= 58: sao_puan = 1
    else: sao_puan = 0
    
    n_gaf = 1 - (gaf_puan / 9)
    n_ymrs = (raw_ymrs or 0) / 25
    n_hdrs = (raw_hdrs or 0) / 30
    n_alda = 1 - ((alda_puan or 0) / 10)
    n_spaq = (raw_spaq or 0) / 15
    n_sao = sao_puan / 2
    
    agirlikli_puan = ((n_gaf * 0.35) + (n_alda * 0.20) + (n_sao * 0.15) + (n_spaq * 0.15) + (n_ymrs * 0.075) + (n_hdrs * 0.075))
    return round(agirlikli_puan * 100, 1)

# --- FAZ 1: İLAÇ ETKİNLİK MODELİ ---
def faz1_ilac_etkinlik_modeli_hazirla_ve_egit(tum_kayitlar: list):
    """Veriyi işler, XGBoost modelini eğitir ve kaydeder."""
    print("\n--- Faz 1: İlaç Etkinlik Modeli Başlatılıyor ---")
    if not tum_kayitlar:
        print("HATA: Eğitim için veri bulunamadı.")
        return

    # Veriyi DataFrame'e çevir ve puanları hesapla
    df_all_data = pd.json_normalize(tum_kayitlar, sep='_')
    df_all_data['mr_sina_score'] = [calculate_mr_sina_score(kayit) for kayit in tum_kayitlar]
    df_all_data.dropna(subset=['mr_sina_score'], inplace=True)

    # Benzersiz ilaçları bul
    tum_ilaclar = set(df_all_data['tedaviKayitlari_ilaclar'].explode().dropna().apply(lambda x: x.get('ad').lower().strip() if isinstance(x, dict) and x.get('ad') else None))
    tum_ilaclar.discard(None)
    print(f"Veri setinde toplam {len(tum_ilaclar)} benzersiz ilaç bulundu.")
    
    model_data = []
    
    # <<< HATA DÜZELTMESİ BU SATIRDA YAPILDI >>>
    # Farklı formatlardaki tarihleri otomatik olarak tanıması için format='mixed' eklendi.
    df_all_data['degerlendirmeMeta_degerlendirmeTarihi'] = pd.to_datetime(df_all_data['degerlendirmeMeta_degerlendirmeTarihi'], format='mixed')
    # <<< DÜZELTME SONU >>>
    
    df_all_data.sort_values(by=['hastaBilgileri_sosyodemografik_tcKimlikNo', 'degerlendirmeMeta_degerlendirmeTarihi'], inplace=True)

    for tc_no, group in df_all_data.groupby('hastaBilgileri_sosyodemografik_tcKimlikNo'):
        if len(group) > 1:
            for i in range(len(group) - 1):
                t1 = group.iloc[i]
                t2 = group.iloc[i+1]
                
                puan_t1 = t1['mr_sina_score']
                puan_t2 = t2['mr_sina_score']

                if pd.notna(puan_t1) and pd.notna(puan_t2) and puan_t1 > 0:
                    row = {}
                    row['ilerleme_yuzdesi'] = ((puan_t1 - puan_t2) / puan_t1) * 100
                    row['baslangic_mr_sina_puani'] = puan_t1
                    
                    for olcek in ['GAF', 'YMRS', 'HDRS', 'ALDA', 'SPAQ', 'SAO']:
                        row[f'baslangic_{olcek.lower()}'] = t1.get(f'klinikOlcekSonuclari_{olcek}_hamSkor')

                    for ilac in tum_ilaclar: row[f"ilac_{ilac}"] = 0
                    if isinstance(t1['tedaviKayitlari_ilaclar'], list):
                        for ilac_dict in t1['tedaviKayitlari_ilaclar']:
                            if isinstance(ilac_dict, dict) and ilac_dict.get('ad'):
                                ilac_adi = ilac_dict['ad'].lower().strip()
                                if ilac_adi in tum_ilaclar:
                                    row[f"ilac_{ilac_adi}"] = 1
                    model_data.append(row)

    df_model = pd.DataFrame(model_data)
    if df_model.empty:
        print("HATA: Model eğitimi için ardışık ziyaret verisi oluşturulamadı.")
        return
        
    df_model.dropna(inplace=True)

    if len(df_model) < 10:
        print(f"HATA: Eğitim için yeterli sayıda (en az 10) veri örneği bulunamadı. Bulunan: {len(df_model)}")
        return

    print(f"Model eğitimi için {len(df_model)} adet geçerli veri örneği kullanılıyor.")

    X = df_model.drop('ilerleme_yuzdesi', axis=1)
    y = df_model['ilerleme_yuzdesi']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("XGBoost modeli eğitiliyor...")
    model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
    model.fit(X_train, y_train)
    print("Model eğitimi tamamlandı.")
    
    skor = model.score(X_test, y_test)
    print(f"\nModelin Test Verisi Üzerindeki R^2 Skoru: {skor:.4f}")
    
    feature_importances = pd.DataFrame({
        'ozellik': X.columns,
        'onem_skoru': model.feature_importances_
    }).sort_values(by='onem_skoru', ascending=False)
    
    print("\nTedavi Başarısını Tahmin Etmedeki En Önemli 15 Faktör:")
    print(feature_importances.head(15).to_string(index=False))

    kayit_yolu = "ilac_etkinlik_modeli.joblib"
    joblib.dump(model, kayit_yolu)
    print(f"\nFaz 1 Modeli başarıyla '{kayit_yolu}' dosyasına kaydedildi.")
    return model
# --- FAZ 2: HASTALIK GİDİŞAT MODELİ (İSKELET) ---
def faz2_gidisat_modeli(df_all_data):
    print("\n--- Faz 2: Hastalık Gidişat Modeli (Neural ODE) Başlatılıyor ---")
    print("Bu fazın geliştirilmesi gerekiyor.")
    # Gelecekteki adımlar:
    # 1. Veriyi her hasta için zaman serisi formatına getirme
    # 2. PyTorch ile Neural ODE modelini tanımlama
    # 3. Modeli eğitme ve kaydetme (gidisat_modeli.pt)
    pass

# --- FAZ 3: TEDAVİ OPTİMİZASYON MODELİ (İSKELET) ---
def faz3_optimizasyon_modeli(ilac_etkinlik_modeli):
    print("\n--- Faz 3: Tedavi Optimizasyon Modeli (MILP) Başlatılıyor ---")
    print("Bu fazın geliştirilmesi gerekiyor.")
    # Gelecekteki adımlar:
    # 1. PuLP kütüphanesini kullanarak optimizasyon problemini tanımlama
    # 2. Amaç fonksiyonunu (ilaç etkinlik skorlarına göre) ve kısıtları (klinik kurallar) belirleme
    # 3. Belirli bir hasta durumu için modeli çözerek en uygun tedavi kombinasyonunu önerme
    pass

# --- ANA SCRIPT AKIŞI ---
if __name__ == "__main__":
    kayitlar = veri_yukle(VERI_DOSYASI)

    if kayitlar:
        # Faz 1'i çalıştır ve eğitilmiş modeli al
        model_faz1 = faz1_ilac_etkinlik_modeli_hazirla_ve_egit(kayitlar)
        
        # Faz 2 ve 3 için iskelet fonksiyonları çağır
        faz2_gidisat_modeli(kayitlar)
        if model_faz1:
            faz3_optimizasyon_modeli(model_faz1)
        else:
            print("Faz 3 atlandı çünkü Faz 1 modeli eğitilemedi.")

    print("\nScript tamamlandı.")