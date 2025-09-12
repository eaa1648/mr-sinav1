import streamlit as st
import json
from pathlib import Path
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime
import uuid

# --- TEMEL AYARLAR VE VERİ YÖNETİMİ ---
DOSYA_YOLU = Path("tum_hastalar_klinik_veri.json")
ILAC_DB_YOLU = Path("psikiyatri_ilac_veritabani.json")

@st.cache_data
def veri_yukle():
    if DOSYA_YOLU.exists() and DOSYA_YOLU.stat().st_size > 0:
        with open(DOSYA_YOLU, "r", encoding="utf-8") as f:
            try: return json.load(f)
            except json.JSONDecodeError: return []
    return []

@st.cache_data
def ilac_veritabani_yukle():
    if not ILAC_DB_YOLU.exists(): return None
    with open(ILAC_DB_YOLU, "r", encoding="utf-8") as f: return json.load(f)

def veri_kaydet(kayitlar):
    with open(DOSYA_YOLU, "w", encoding="utf-8") as f:
        json.dump(kayitlar, f, indent=4, ensure_ascii=False)

# --- MR. SINA SİSTEM PUANI HESAPLAMA ---
def calculate_mr_sina_score(hasta_data):
    # Bu fonksiyonun içeriği önceki kodla aynı
    klinik_olcekler = hasta_data.get("klinikOlcekSonuclari", {})
    if not klinik_olcekler: return None
    raw_gaf = klinik_olcekler.get("GAF", {}).get("hamSkor", 55); raw_ymrs = klinik_olcekler.get("YMRS", {}).get("hamSkor", 0)
    raw_hdrs = klinik_olcekler.get("HDRS", {}).get("hamSkor", 0)
    if "ALDA" in klinik_olcekler: alda_puan = klinik_olcekler.get("ALDA", {}).get("hamSkor", 0)
    else:
        raw_alda_a = klinik_olcekler.get("ALDA_A", {}).get("hamSkor", 0); raw_alda_b = klinik_olcekler.get("ALDA_B", {}).get("hamSkor", 0)
        alda_puan = raw_alda_a - raw_alda_b
    raw_spaq = klinik_olcekler.get("SPAQ", {}).get("hamSkor", 0); raw_sao = klinik_olcekler.get("SAO", {}).get("hamSkor", 50)
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
    n_gaf = 1 - (gaf_puan / 9); n_ymrs = raw_ymrs / 25; n_hdrs = raw_hdrs / 30
    n_alda = 1 - (alda_puan / 10); n_spaq = raw_spaq / 15; n_sao = sao_puan / 2
    agirlikli_puan = ((n_gaf * 0.35) + (n_alda * 0.20) + (n_sao * 0.15) + (n_spaq * 0.15) + (n_ymrs * 0.075) + (n_hdrs * 0.075))
    return round(agirlikli_puan * 100, 1)

def idx(options, val):
    try: return options.index(val)
    except(ValueError, TypeError): return 0

# --- ANA UYGULAMA ---
def main():
    st.set_page_config(page_title="Mr. Sina - Hasta Gidişatı", layout="wide")
    st.title("📈 Mr. Sina - Hasta Gidişat Takip ve Değerlendirme")

    tum_kayitlar = veri_yukle()
    ilac_db = ilac_veritabani_yukle()
    if ilac_db is None:
        st.error("İlaç veritabanı (`psikiyatri_ilac_veritabani.json`) bulunamadı."); st.stop()
    if not tum_kayitlar:
        st.warning("`klinik_app.py` ile kayıtlı hasta bulunmuyor."); st.stop()

    # Adım 1: Hasta Seçimi
    hasta_listesi = pd.DataFrame([k.get("hastaBilgileri", {}).get("sosyodemografik", {}) for k in tum_kayitlar]).dropna(subset=['tcKimlikNo']).drop_duplicates(subset=['tcKimlikNo'])
    hasta_secenekleri = {f"{row['tcKimlikNo']} - {row['adSoyad']}": row['tcKimlikNo'] for index, row in hasta_listesi.iterrows()}
    secilen_hasta_str = st.selectbox("İşlem yapılacak hastayı seçin:", options=list(hasta_secenekleri.keys()), index=None, placeholder="TC veya Ad Soyad ile arayın...")
    
    if secilen_hasta_str:
        secilen_tc = hasta_secenekleri[secilen_hasta_str]
        hasta_kayitlari = [k for k in tum_kayitlar if k.get("hastaBilgileri", {}).get("sosyodemografik", {}).get("tcKimlikNo") == secilen_tc]
        hasta_kayitlari.sort(key=lambda x: x.get("degerlendirmeMeta", {}).get("degerlendirmeTarihi"))

        # ... (Başlangıç Değerlendirmesi seçimi aynı)
        st.markdown("---")
        st.subheader("1. Karşılaştırma Dönemini Belirleyin")
        kayit_secenekleri = {f"{k.get('degerlendirmeMeta',{}).get('degerlendirmeTarihi').split('T')[0]}": k.get('degerlendirmeMeta',{}).get('kayitId') for k in hasta_kayitlari}
        secilen_t1_tarih = st.selectbox("Başlangıç Değerlendirmesi (T1) Seçin:", options=list(kayit_secenekleri.keys()))
        secilen_t1_id = kayit_secenekleri[secilen_t1_tarih]
        kayit_t1 = next((k for k in hasta_kayitlari if k.get("degerlendirmeMeta",{}).get('kayitId') == secilen_t1_id), None)
        
        st.markdown("---")
        st.subheader("2. Yeni Değerlendirme Bilgilerini Girin (T2)")
        
        with st.form("gidisat_form"):
            yeni_tarih = st.date_input("Güncel Değerlendirme Tarihi (T2)", datetime.now())
            
            st.write("**Güncel Klinik Ölçek Puanları**")
            col1, col2 = st.columns(2)
            with col1:
                yeni_gaf = st.number_input("GAF Skoru", 0, 100, 70)
                yeni_ymrs = st.number_input("YMRS Skoru", 0, 60, 5)
                yeni_hdrs = st.number_input("HDRS Skoru", 0, 52, 6)
            with col2:
                yeni_alda = st.number_input("ALDA Skoru", -10, 10, 0)
                yeni_sao = st.number_input("SAÖ Skoru", 16, 86, 50)
                yeni_spaq = st.number_input("SPAQ Skoru", 0, 50, 0)

            st.markdown("---")
            st.write("**Güncel Tedavi Planı**")
            
            # Dinamik İlaç listesini session_state'te yönet
            if 'form_ilac_listesi' not in st.session_state:
                st.session_state.form_ilac_listesi = [{"ad": None, "doz": "", "zamanlar": []}]
            
            for i, ilac in enumerate(st.session_state.form_ilac_listesi):
                st.markdown(f"**İlaç #{i+1}**")
                ilac_adlari = [None] + sorted(list(ilac_db.keys())) + ["-- Diğer (Manuel Giriş) --"]
                
                secilen_opsiyon = st.selectbox("İlaç Adı", ilac_adlari, key=f"ad_{i}", index=idx(ilac_adlari, ilac.get('ad')))
                
                if secilen_opsiyon == "-- Diğer (Manuel Giriş) --":
                    ilac['ad'] = st.text_input("Lütfen İlaç Adını Girin:", key=f"ad_manual_{i}")
                else:
                    ilac['ad'] = secilen_opsiyon
                
                if ilac['ad'] in ilac_db:
                    st.info(f"**Grup:** {ilac_db[ilac['ad']].get('grup', 'N/A')}")

                cols_ilac = st.columns([1,2])
                ilac['doz'] = cols_ilac[0].text_input("Doz (mg)", key=f"doz_{i}", value=ilac.get('doz',''))
                ilac['zamanlar'] = cols_ilac[1].multiselect("Kullanım Zamanı", ["Sabah", "Öğle", "Akşam", "Gece"], key=f"zaman_{i}", default=ilac.get('zamanlar', []))

            doktor_notu = st.text_area("Güncel Muayene Notu")
            
            submitted = st.form_submit_button("Analiz Et ve Kaydet", type="primary")

            if submitted:
                kayit_t2_skorlar = {
                    "GAF": {"hamSkor": yeni_gaf}, "YMRS": {"hamSkor": yeni_ymrs}, "HDRS": {"hamSkor": yeni_hdrs},
                    "ALDA": {"hamSkor": yeni_alda}, "SAO": {"hamSkor": yeni_sao}, "SPAQ": {"hamSkor": yeni_spaq}
                }
                yeni_kayit = {
                    "degerlendirmeMeta": {"kayitId": str(uuid.uuid4()), "degerlendirmeTarihi": yeni_tarih.strftime("%Y-%m-%dT%H:%M:%S")},
                    "hastaBilgileri": kayit_t1.get("hastaBilgileri"),
                    "klinikOlcekSonuclari": kayit_t2_skorlar,
                    "tedaviKayitlari": {"ilaclar": [i for i in st.session_state.form_ilac_listesi if i.get('ad')], "not": doktor_notu}
                }
                tum_kayitlar.append(yeni_kayit)
                veri_kaydet(tum_kayitlar)
                
                st.success("Yeni gidişat kaydı başarıyla eklendi!")
                del st.session_state.form_ilac_listesi
                st.rerun()

        # --- YENİ BÖLÜM: Formun Dışındaki Dinamik Butonlar ---
        col1, col2, col3 = st.columns([1,1,1])
        if col1.button("➕ Yeni İlaç Ekle"):
            if 'form_ilac_listesi' not in st.session_state:
                st.session_state.form_ilac_listesi = []
            st.session_state.form_ilac_listesi.append({"ad": None, "doz": "", "zamanlar": []})
            st.rerun()
            
        if col2.button("➖ Son İlacı Sil"):
            if 'form_ilac_listesi' in st.session_state and len(st.session_state.form_ilac_listesi) > 1:
                st.session_state.form_ilac_listesi.pop()
                st.rerun()
                
        if col3.button("🔄 Formu Temizle"):
            if 'form_ilac_listesi' in st.session_state:
                del st.session_state.form_ilac_listesi
            st.rerun()

if __name__ == "__main__":
    main()