import streamlit as st
import json
from pathlib import Path
import pandas as pd
import plotly.graph_objects as go
import plotly.figure_factory as ff
import plotly.express as px
from datetime import datetime
import uuid

# --- Harici İlaç Veritabanını Yükleme ---
ILAC_DB_YOLU = Path("psikiyatri_ilac_veritabani.json")

@st.cache_data
def ilac_veritabani_yukle():
    if not ILAC_DB_YOLU.exists(): return None
    with open(ILAC_DB_YOLU, "r", encoding="utf-8") as f: return json.load(f)

# --- TEMEL AYARLAR VE VERİ YÖNETİMİ ---
DOSYA_YOLU = Path("tum_hastalar_klinik_veri.json")

def veri_yukle():
    if DOSYA_YOLU.exists() and DOSYA_YOLU.stat().st_size > 0:
        with open(DOSYA_YOLU, "r", encoding="utf-8") as f:
            try: return json.load(f)
            except json.JSONDecodeError: return []
    return []

def veri_kaydet(kayitlar):
    with open(DOSYA_YOLU, "w", encoding="utf-8") as f:
        json.dump(kayitlar, f, indent=4, ensure_ascii=False)

# --- PUAN HESAPLAMA VE GRAFİK FONKSİYONLARI (DEĞİŞİKLİK YOK) ---
def calculate_mr_sina_score(hasta_data):
    # ... (Bu fonksiyonun içeriği önceki kodla aynı)
    klinik_olcekler = hasta_data.get("klinikOlcekSonuclari", {})
    if not klinik_olcekler: return None
    raw_gaf = klinik_olcekler.get("GAF", {}).get("hamSkor", 55); raw_ymrs = klinik_olcekler.get("YMRS", {}).get("hamSkor", 0)
    raw_hdrs = klinik_olcekler.get("HDRS", {}).get("hamSkor", 0); raw_alda_a = klinik_olcekler.get("ALDA_A", {}).get("hamSkor", 0)
    raw_alda_b = klinik_olcekler.get("ALDA_B", {}).get("hamSkor", 0); raw_spaq = klinik_olcekler.get("SPAQ", {}).get("hamSkor", 0)
    raw_sao = klinik_olcekler.get("SAO", {}).get("hamSkor", 50)
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
    alda_puan = raw_alda_a - raw_alda_b
    if raw_sao <= 41: sao_puan = 2
    elif raw_sao <= 58: sao_puan = 1
    else: sao_puan = 0
    n_gaf = 1 - (gaf_puan / 9); n_ymrs = raw_ymrs / 25; n_hdrs = raw_hdrs / 30
    n_alda = 1 - (alda_puan / 10); n_spaq = raw_spaq / 15; n_sao = sao_puan / 2
    agirlikli_puan = ((n_gaf * 0.35) + (n_alda * 0.20) + (n_sao * 0.15) + (n_spaq * 0.15) + (n_ymrs * 0.075) + (n_hdrs * 0.075))
    return round(agirlikli_puan * 100, 1)

# --- YENİ: KAYIT DÜZENLEME FORMU ---
def render_edit_form(tum_kayitlar, ilac_veritabani):
    kayit_id = st.session_state.get('record_to_edit_id')
    kayit_index = next((i for i, kayit in enumerate(tum_kayitlar) if kayit.get("degerlendirmeMeta", {}).get("kayitId") == kayit_id), None)
    
    if kayit_index is None:
        st.error("Düzenlenecek kayıt bulunamadı.")
        st.session_state.view_mode = 'view'
        st.rerun()
        return

    kayit = tum_kayitlar[kayit_index]
    
    st.header("✍️ Tedavi Kaydını Düzenle")

    # Mevcut verilerle formu doldur
    tedavi_kayitlari = kayit.get("tedaviKayitlari", {})
    degerlendirme_tarihi_str = kayit.get("degerlendirmeMeta", {}).get("degerlendirmeTarihi")
    degerlendirme_tarihi_obj = datetime.fromisoformat(degerlendirme_tarihi_str.split('T')[0])

    yeni_tarih = st.date_input("Tedavi Tarihi", value=degerlendirme_tarihi_obj)
    
    # Düzenleme için ilaç listesini session state'e yükle
    if 'edit_ilac_listesi' not in st.session_state:
        st.session_state.edit_ilac_listesi = tedavi_kayitlari.get("ilaclar", [{"ad": None, "doz": "", "zamanlar": []}])

    for i, ilac in enumerate(st.session_state.edit_ilac_listesi):
        st.markdown(f"**İlaç #{i+1}**")
        ilac_adlari = [None] + list(ilac_veritabani.keys())+ ["-- Diğer (Manuel Giriş) --"]
        
        # Mevcut ilacın index'ini bul
        try:
            default_index = ilac_adlari.index(ilac.get('ad'))
        except ValueError:
            default_index = 0

        secilen_opsiyon = st.selectbox("İlaç Adı", ilac_adlari, key=f"edit_ad_{i}", index=default_index)
        
        ilac_adi_final = None
        if secilen_opsiyon == "-- Diğer (Manuel Giriş) --":
            ilac_adi_final = st.text_input("Lütfen İlaç Adını Girin:", value=ilac.get('ad', ''), key=f"edit_ad_manual_{i}")
        elif secilen_opsiyon is not None:
            ilac_adi_final = secilen_opsiyon

        st.session_state.edit_ilac_listesi[i]['ad'] = ilac_adi_final

        cols_ilac = st.columns([1,2])
        st.session_state.edit_ilac_listesi[i]['doz'] = cols_ilac[0].text_input("Doz (mg)", value=ilac.get('doz', ''), key=f"edit_doz_{i}")
        st.session_state.edit_ilac_listesi[i]['zamanlar'] = cols_ilac[1].multiselect("Kullanım Zamanı", ["Sabah", "Öğle", "Akşam", "Gece","Haftada", "Ayda"], default=ilac.get('zamanlar', []), key=f"edit_zaman_{i}")

    col1, col2 = st.columns(2)
    if col1.button("➕ İlaç Ekle"): st.session_state.edit_ilac_listesi.append({"ad": None, "doz": "", "zamanlar": []}); st.rerun()
    if col2.button("➖ Son İlacı Sil") and len(st.session_state.edit_ilac_listesi) > 1: st.session_state.edit_ilac_listesi.pop(); st.rerun()
    
    yeni_not = st.text_area("Doktor Notu", value=tedavi_kayitlari.get("not", ""))

    st.markdown("---")
    col_save, col_cancel = st.columns(2)
    if col_save.button("💾 Değişiklikleri Kaydet", type="primary"):
        # Verileri güncelle
        tum_kayitlar[kayit_index]["degerlendirmeMeta"]["degerlendirmeTarihi"] = yeni_tarih.strftime("%Y-%m-%dT%H:%M:%S")
        tum_kayitlar[kayit_index]["tedaviKayitlari"]["ilaclar"] = [ilac for ilac in st.session_state.edit_ilac_listesi if ilac.get('ad')]
        tum_kayitlar[kayit_index]["tedaviKayitlari"]["not"] = yeni_not
        
        veri_kaydet(tum_kayitlar)
        st.success("Kayıt başarıyla güncellendi!")
        st.session_state.view_mode = 'view'
        del st.session_state.edit_ilac_listesi
        st.rerun()

    if col_cancel.button("İptal"):
        st.session_state.view_mode = 'view'
        del st.session_state.edit_ilac_listesi
        st.rerun()

# --- KENAR ÇUBUĞU VE ANA PANEL (ÇOK AZ DEĞİŞİKLİKLE) ---
def render_sidebar(tum_kayitlar, ilac_veritabani):
    st.sidebar.header("📝 Tedavi ve Not Ekleme")
    if ilac_veritabani is None:
        return None
    if not tum_kayitlar:
        st.sidebar.warning("Henüz `klinik_app.py` ile oluşturulmuş hasta kaydı bulunmuyor.")
        return None
        
    hasta_listesi = pd.DataFrame([
        k.get("hastaBilgileri", {}).get("sosyodemografik", {}) for k in tum_kayitlar
    ]).dropna(subset=['tcKimlikNo']).drop_duplicates(subset=['tcKimlikNo'])
    
    hasta_secenekleri = {f"{row['tcKimlikNo']} - {row['adSoyad']}": row['tcKimlikNo'] for index, row in hasta_listesi.iterrows()}
    
    secilen_hasta_str = st.sidebar.selectbox("Hasta Seçin:", options=list(hasta_secenekleri.keys()), index=None, placeholder="TC veya Ad Soyad ile arayın...")
    
    if not secilen_hasta_str:
        return None
        
    secilen_tc = hasta_secenekleri[secilen_hasta_str]
    
    hasta_kayitlari = [k for k in tum_kayitlar if k.get("hastaBilgileri", {}).get("sosyodemografik", {}).get("tcKimlikNo") == secilen_tc]
    hasta_kayitlari.sort(key=lambda x: x.get("degerlendirmeMeta", {}).get("degerlendirmeTarihi"), reverse=True)
    en_son_kayit = hasta_kayitlari[0]

    st.sidebar.markdown("---")
    st.sidebar.subheader("En Son Klinik Durum")
    son_klinik_skorlar = en_son_kayit.get("klinikOlcekSonuclari", {})
    cols = st.sidebar.columns(2)
    cols[0].metric("GAF", son_klinik_skorlar.get("GAF", {}).get("hamSkor", "N/A"))
    cols[1].metric("YMRS", son_klinik_skorlar.get("YMRS", {}).get("hamSkor", "N/A"))
    cols[0].metric("HDRS", son_klinik_skorlar.get("HDRS", {}).get("hamSkor", "N/A"))
    
    if "ALDA" in son_klinik_skorlar:
        alda_gosterim = son_klinik_skorlar.get("ALDA", {}).get("hamSkor", "N/A")
    else:
        alda_a = son_klinik_skorlar.get('ALDA_A', {}).get('hamSkor', 0)
        alda_b = son_klinik_skorlar.get('ALDA_B', {}).get('hamSkor', 0)
        alda_gosterim = alda_a - alda_b
    cols[1].metric("ALDA", alda_gosterim)
    
    st.sidebar.markdown("---")
    st.sidebar.subheader("Yeni Tedavi Kaydı Ekle")
    yeni_kayit_tarihi = st.sidebar.date_input("Tedavi Tarihi", datetime.now())
    
    if 'ilac_listesi' not in st.session_state:
        st.session_state.ilac_listesi = [{"ad": None, "doz": "", "zamanlar": []}]
    
    for i, ilac in enumerate(st.session_state.ilac_listesi):
        st.sidebar.markdown(f"**İlaç #{i+1}**")
        ilac_adlari = [None] + list(ilac_veritabani.keys()) + ["-- Diğer (Manuel Giriş) --"]
        secilen_opsiyon = st.sidebar.selectbox("İlaç Adı", ilac_adlari, key=f"ad_{i}", index=0)
        ilac_adi_final = None
        if secilen_opsiyon == "-- Diğer (Manuel Giriş) --":
            ilac_adi_final = st.sidebar.text_input("Lütfen İlaç Adını Girin:", key=f"ad_manual_{i}")
        elif secilen_opsiyon is not None:
            ilac_adi_final = secilen_opsiyon
            ilac_bilgisi = ilac_veritabani[secilen_opsiyon]
            st.sidebar.info(f"**Grup:** {ilac_bilgisi.get('grup', 'Belirtilmemiş')}\n\n**Bilgi:** {ilac_bilgisi.get('bilgi', 'Açıklama mevcut değil.')}")
        st.session_state.ilac_listesi[i]['ad'] = ilac_adi_final
        cols_ilac = st.sidebar.columns([1,2])
        st.session_state.ilac_listesi[i]['doz'] = cols_ilac[0].text_input("Doz (mg)", key=f"doz_{i}")
        st.session_state.ilac_listesi[i]['zamanlar'] = cols_ilac[1].multiselect("Kullanım Zamanı", ["Sabah", "Öğle", "Akşam", "Gece"], key=f"zaman_{i}")
    
    col1, col2 = st.sidebar.columns(2)
    if col1.button("➕ İlaç Ekle"):
        st.session_state.ilac_listesi.append({"ad": None, "doz": "", "zamanlar": []})
        st.rerun()
    if col2.button("➖ Son İlacı Sil") and len(st.session_state.ilac_listesi) > 1:
        st.session_state.ilac_listesi.pop()
        st.rerun()
    
    doktor_notu = st.sidebar.text_area("Doktor Notu")

    if st.sidebar.button("💾 Tedaviyi Kaydet", type="primary"):
        # --- DÜZELTME BURADA ---
        # Yeni kayıt oluşturulurken, 'hastaBilgileri' anahtarının içeriği
        # 'klinik_app.py' ile tam uyumlu hale getirildi.
        yeni_kayit = {
            "degerlendirmeMeta": {"kayitId": str(uuid.uuid4()), "degerlendirmeTarihi": yeni_kayit_tarihi.strftime("%Y-%m-%dT%H:%M:%S")},
            "hastaBilgileri": en_son_kayit.get("hastaBilgileri", {}), # En son kayıttaki tüm hasta bilgilerini kopyala
            "klinikOlcekSonuclari": en_son_kayit.get("klinikOlcekSonuclari", {}), # Klinik durumu şimdilik aynı kabul ediyoruz
            "tedaviKayitlari": {"ilaclar": [ilac for ilac in st.session_state.ilac_listesi if ilac.get('ad')], "not": doktor_notu}
        }
        # --- DÜZELTME SONU ---
        
        tum_kayitlar.append(yeni_kayit)
        veri_kaydet(tum_kayitlar)
        st.sidebar.success("Yeni tedavi kaydı eklendi!")
        del st.session_state.ilac_listesi
        st.rerun()

    return secilen_tc

def ilac_kayit_formu(ilac_veritabani):
    st.sidebar.header("📝 Yeni Tedavi Kaydı Formu")
    
    # ... (Fonksiyonun başındaki diğer tüm kodlar aynı kalacak)
    tc_kimlik = st.sidebar.text_input("T.C. Kimlik Numarası")
    ad_soyad = st.sidebar.text_input("Ad Soyad")
    hastalik_tanisi = st.sidebar.text_input("Hastalık Tanısı", "Bipolar Bozukluk")
    degerlendirme_tarihi = st.sidebar.date_input("Değerlendirme Tarihi", datetime.now())
    
    st.sidebar.subheader("Klinik Ölçek Puanları")
    klinik_olcekler = {
        "YMRS": st.sidebar.number_input("YMRS Skoru", 0, 60, 5),
        "HDRS": st.sidebar.number_input("HDRS Skoru", 0, 52, 6),
        "GAF": st.sidebar.number_input("GAF Skoru", 0, 100, 75),
        "ALDA_A": st.sidebar.number_input("ALDA (A) Skoru", 0, 10, 8),
        "ALDA_B": st.sidebar.number_input("ALDA (B) Skoru", 0, 10, 0),
        "SPAQ": st.sidebar.number_input("SPAQ Skoru", 0, 50, 9),
        "SAO": st.sidebar.number_input("SAÖ (MEQ) Skoru", 16, 86, 50)
    }

    st.sidebar.subheader("Kullanılan İlaçlar")
    if 'ilac_listesi' not in st.session_state:
        st.session_state.ilac_listesi = [{"ad": "", "doz": ""}]

    for i, ilac in enumerate(st.session_state.ilac_listesi):
        cols = st.sidebar.columns([3, 2])
        st.session_state.ilac_listesi[i]['ad'] = cols[0].text_input(f"İlaç Adı #{i+1}", key=f"ad_{i}")
        st.session_state.ilac_listesi[i]['doz'] = cols[1].text_input(f"Dozaj (mg) #{i+1}", key=f"doz_{i}")

    col1, col2 = st.sidebar.columns(2)
    if col1.button("➕ İlaç Ekle"):
        st.session_state.ilac_listesi.append({"ad": "", "doz": ""})
        st.rerun()
    if col2.button("➖ Son İlacı Sil") and len(st.session_state.ilac_listesi) > 1:
        st.session_state.ilac_listesi.pop()
        st.rerun()

    st.sidebar.markdown("---")
    if st.sidebar.button("💾 Kaydı Sisteme Ekle", type="primary"):
        if tc_kimlik and ad_soyad:
            yeni_kayit = {
                "tcKimlikNo": tc_kimlik,
                "adSoyad": ad_soyad,
                "hastalikTanisi": hastalik_tanisi,
                "degerlendirmeTarihi": degerlendirme_tarihi.strftime("%Y-%m-%d"),
                "klinikOlcekler": klinik_olcekler,
                "ilaclar": [ilac for ilac in st.session_state.ilac_listesi if ilac['ad']]
            }
            
            tum_kayitlar = veri_yukle()
            tum_kayitlar.append(yeni_kayit)
            veri_kaydet(tum_kayitlar)
            st.sidebar.success("Kayıt başarıyla eklendi!")
            
            # --- DÜZELTME BURADA ---
            # st.rerun() komutunu kaldırıp, yerine bir durum değişkeni atıyoruz.
            st.session_state.kayit_basarili = True
            # --- DÜZELTME SONU ---
            
        else:
            st.sidebar.error("Lütfen T.C. Kimlik ve Ad Soyad alanlarını doldurun.")


def render_main_panel(patient_history):
    st.header(f"Hasta Analiz Paneli: {patient_history[0].get('hastaBilgileri',{}).get('sosyodemografik',{}).get('adSoyad','')}")
    # ... (Grafiklerin olduğu bölüm aynı kaldı) ...
    # ... Önceki cevaptaki kodun aynısı ...
    df = pd.DataFrame(); records_for_df = []
    for rec in patient_history:
        record_data = {"Tarih": pd.to_datetime(rec.get("degerlendirmeMeta", {}).get("degerlendirmeTarihi")), "SistemPuanı": calculate_mr_sina_score(rec), "İlaçlar": rec.get("tedaviKayitlari", {}).get("ilaclar", [])}
        for scale, data in rec.get("klinikOlcekSonuclari", {}).items(): record_data[scale] = data.get("hamSkor")
        records_for_df.append(record_data)
    df = pd.DataFrame(records_for_df).sort_values(by="Tarih").reset_index(drop=True)
    if df.empty: st.warning("Bu hasta için görüntülenecek veri bulunmuyor."); return
    st.subheader("1. Mr. Sina Sistem Puanı Değişimi (Genel Hastalık Yükü)")
    fig_puan = go.Figure(go.Scatter(x=df['Tarih'], y=df['SistemPuanı'], mode='lines+markers', name='Sistem Puanı'))
    if len(df) > 1:
        ilk_puan = df['SistemPuanı'].iloc[0]; son_puan = df['SistemPuanı'].iloc[-1]
        ilerleme = ((ilk_puan - son_puan) / ilk_puan) * 100 if ilk_puan > 0 else 0
        fig_puan.update_layout(title=f"Toplam İlerleme: %{ilerleme:.1f}", yaxis_range=[0,100], yaxis_title="Hastalık Yükü (%)")
    st.plotly_chart(fig_puan, use_container_width=True)
    st.markdown("---"); st.subheader("2. Klinik Ölçeklerin Zamanla Değişimi")
    olcek_secenekleri = [col for col in df.columns if col not in ['Tarih', 'SistemPuanı', 'İlaçlar']]
    secilen_olcekler = st.multiselect("Grafikte gösterilecek ölçekleri seçin:", olcek_secenekleri, default=["GAF", "YMRS", "HDRS"])
    if secilen_olcekler:
        fig_olcek = go.Figure()
        for olcek in secilen_olcekler: fig_olcek.add_trace(go.Scatter(x=df['Tarih'], y=df[olcek], name=olcek, mode='lines+markers'))
        fig_olcek.update_layout(title="Seçilen Klinik Ölçek Puanları", yaxis_title="Ham Skor")
        st.plotly_chart(fig_olcek, use_container_width=True)
    st.markdown("---"); st.subheader("3. İlaç Kullanım Zaman Çizelgesi (Gantt Chart)")
    gantt_data = []; renk_paleti = px.colors.qualitative.Plotly
    if len(df) > 1:
        for i in range(len(df) - 1):
            if df['İlaçlar'].iloc[i]:
                for ilac in df['İlaçlar'].iloc[i]: gantt_data.append(dict(Task=ilac['ad'], Start=df['Tarih'].iloc[i], Finish=df['Tarih'].iloc[i+1], Resource=ilac.get('doz', '')))
    if not df.empty and df['İlaçlar'].iloc[-1]:
        for ilac in df['İlaçlar'].iloc[-1]: gantt_data.append(dict(Task=ilac['ad'], Start=df['Tarih'].iloc[-1], Finish=datetime.now(), Resource=ilac.get('doz', '')))
    if gantt_data:
        ilac_renkleri = {}
        unique_ilaclar = pd.DataFrame(gantt_data)['Task'].unique()
        for i, ilac_adi in enumerate(unique_ilaclar): ilac_renkleri[ilac_adi] = renk_paleti[i % len(renk_paleti)]
        fig_gantt = ff.create_gantt(gantt_data, index_col='Task', colors=ilac_renkleri, show_colorbar=True, group_tasks=True, showgrid_x=True, title="İlaç Kullanım Süreleri")
        st.plotly_chart(fig_gantt, use_container_width=True)
    else: st.info("Bu hasta için zaman çizelgesi oluşturulacak ilaç kaydı bulunmuyor.")


    # --- YENİ: GEÇMİŞ KAYITLARI YÖNETME BÖLÜMÜ ---
    st.markdown("---")
    st.subheader(" geçmiş Tedavi Kayıtları ve Notlar")
    
    for record in reversed(patient_history): # En yeniden en eskiye listele
        kayit_id = record.get("degerlendirmeMeta", {}).get("kayitId")
        tarih = record.get("degerlendirmeMeta", {}).get("degerlendirmeTarihi", "").split("T")[0]
        tedavi = record.get("tedaviKayitlari", {})
        ilaclar = tedavi.get("ilaclar", [])
        not_ = tedavi.get("not", "Doktor notu yok.")

        with st.container(border=True):
            st.markdown(f"**Kayıt Tarihi:** {tarih}")
            
            if ilaclar:
                ilac_str = ", ".join([f"{i['ad']} ({i['doz']})" for i in ilaclar])
                st.markdown(f"**İlaçlar:** {ilac_str}")
            
            if not_:
                st.expander("Doktor Notunu Göster").write(not_)

            cols = st.columns([1, 1, 5])
            if cols[0].button("Düzenle", key=f"edit_{kayit_id}"):
                st.session_state.view_mode = 'edit_record'
                st.session_state.record_to_edit_id = kayit_id
                st.rerun()

            if cols[1].button("Sil", key=f"delete_{kayit_id}", type="secondary"):
                tum_kayitlar = veri_yukle()
                kayitlar_silinecek = [k for k in tum_kayitlar if k.get("degerlendirmeMeta", {}).get("kayitId") != kayit_id]
                veri_kaydet(kayitlar_silinecek)
                st.success(f"{tarih} tarihli kayıt silindi.")
                st.rerun()

# --- ANA UYGULAMA AKIŞI (YENİ STATE YÖNETİMİ İLE) ---
# --- ANA UYGULAMA AKIŞI (DOĞRU VE TEMİZ VERSİYON) ---
def main():
    st.set_page_config(page_title="Mr. Sina - Tedavi Yönetimi", layout="wide")
    st.markdown("""<style>[data-testid="stSidebar"] {width: 450px !important;}</style>""", unsafe_allow_html=True)

    # 1. Tüm verileri programın en başında tek seferde yükle
    ilac_db = ilac_veritabani_yukle()
    tum_kayitlar = veri_yukle()

    # İlaç veritabanı kontrolü
    if ilac_db is None:
        st.error("İlaç veritabanı (`psikiyatri_ilac_veritabani.json`) bulunamadı.")
        st.info("Lütfen önce `veri_hazirla.py` aracını çalıştırarak bu dosyayı oluşturun ve `ilac.py` ile aynı klasöre koyun.")
        st.stop()

    # 2. Sayfa durumunu (view_mode) session state'te başlat
    if 'view_mode' not in st.session_state:
        st.session_state.view_mode = 'view' # Varsayılan mod: ana paneli göster

    # 3. Hangi sayfanın gösterileceğine durum değişkenine göre karar ver
    if st.session_state.view_mode == 'edit_record':
        # Eğer mod "düzenleme" ise, sadece düzenleme formunu çiz
        render_edit_form(ilac_db) # ilac_db parametresini de gönderiyoruz
    
    # Gelecekte silme onayı için bu bloğu aktif edebiliriz
    # elif st.session_state.view_mode == 'confirm_delete':
    #     render_delete_confirmation(tum_kayitlar)

    else: # Varsayılan mod 'view' ise ana paneli ve kenar çubuğunu göster
        st.title("⚕️ Mr. Sina - Tedavi Yönetim Paneli")
        
        # Kenar çubuğunu çiz ve seçilen hastanın TC'sini al
        secilen_tc = render_sidebar(tum_kayitlar, ilac_db)
        
        if secilen_tc:
            # Eğer bir hasta seçildiyse, o hastanın kayıtlarını filtrele
            hasta_kayitlari = [k for k in tum_kayitlar if k.get("hastaBilgileri", {}).get("sosyodemografik", {}).get("tcKimlikNo") == secilen_tc]
            if hasta_kayitlari:
                # ve ana paneli (tüm grafikleriyle) çiz
                render_main_panel(hasta_kayitlari)
        else:
            # Eğer henüz bir hasta seçilmediyse, bilgi mesajı göster
            st.info("Lütfen soldaki menüden bir hasta seçerek analize başlayın.")

if __name__ == "__main__":
    main()