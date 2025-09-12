import streamlit as st
import json
from pathlib import Path
import datetime
import uuid

# --- SAYFA AYARI (ilk satırlarda olmalı) ---
st.set_page_config(page_title="Mr. Sina", layout="wide")

# --- SABİT SEÇENEK LİSTELERİ ---
HASTALIK_SECENEKLERI = ["BP", "UP", "Siklotimi", "Distimi", "Şizofreni", "Panik Boz", "Alkol", "Madde", "İntihar", "Yeme Boz"]
BIRINCI_DERECE_AKRABALAR = ["Anne", "Baba", "Kardeş", "Çocuk"]
IKINCI_DERECE_AKRABALAR = ["Teyze", "Hala", "Amca", "Dayı", "Büyükbaba", "Büyükanne"]


# --- TEMEL AYARLAR VE VERİ YÖNETİMİ FONKSİYONLARI ---
DOSYA_YOLU = Path("tum_hastalar_klinik_veri.json")

def veri_yukle():
    if DOSYA_YOLU.exists() and DOSYA_YOLU.stat().st_size > 0:
        with open(DOSYA_YOLU, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def veri_kaydet(hastalar):
    with open(DOSYA_YOLU, "w", encoding="utf-8") as f:
        json.dump(hastalar, f, indent=4, ensure_ascii=False)

def idx(options, val):
    """Bir listedeki değerin indeksini güvenli bir şekilde bulur. Bulamazsa 0 döndürür."""
    try:
        return options.index(str(val)) # Gelen değeri string'e çevirerek uyumluluğu artır
    except (ValueError, TypeError):
        return 0
    
# klinik_app.py dosyanızın üst kısmına bu fonksiyonu ekleyin
def standart_icki_hesapla(icecek_turu, miktar_ml):
    """
    Verilen içecek türü ve miktarına göre standart içki sayısını hesaplar.
    1 Standart İçki = 10 gr saf alkol.
    """
    alkol_oranlari = {
        "Bira (Pilsner/Lager)": 5.0,
        "Şarap": 13.0,
        "Rakı/Votka/Viski/Cin": 40.0,
        "Likör": 25.0,
        "Güçlü Bira (Craft/IPA vb.)": 8.0
    }
    ALKOL_YOGUNLUGU = 0.789
    GRAM_PER_STANDART = 10

    if icecek_turu not in alkol_oranlari or miktar_ml is None or miktar_ml <= 0:
        return 0.0

    hacmen_alkol_orani = alkol_oranlari[icecek_turu] / 100
    toplam_alkol_gram = miktar_ml * hacmen_alkol_orani * ALKOL_YOGUNLUGU
    standart_icki_sayisi = toplam_alkol_gram / GRAM_PER_STANDART
    return standart_icki_sayisi
    
def render_aile_hastalik_formu(derece, akraba_listesi, default_data={}):
    derece_key = f"{derece}_derece"
    default_radio = "Evet" if derece_key in default_data and default_data[derece_key] else "Hayır"
    
    hastalik_var = st.radio(
        f"**{derece}. Derece Akrabalarda Hastalık Var mı?**",
        ["Hayır", "Evet"],
        key=f"hastalik_var_{derece_key}",
        horizontal=True,
        index=1 if default_radio == "Evet" else 0
    )

    if hastalik_var == "Evet":
        default_akrabalar = [item['akraba'] for item in default_data.get(derece_key, [])]
        secilen_akrabalar = st.multiselect(
            f"Hastalık gözlemlenen {derece}. derece akrabaları seçin:",
            options=akraba_listesi,
            key=f"secilen_akrabalar_{derece_key}",
            default=default_akrabalar
        )
        
        if secilen_akrabalar:
            st.markdown("---")
            for akraba in secilen_akrabalar:
                default_hastaliklar = []
                for item in default_data.get(derece_key, []):
                    if item.get('akraba') == akraba:
                        default_hastaliklar = item.get('hastaliklar', [])
                        break
                st.multiselect(
                    f"**{akraba}** için gözlemlenen hastalıklar:",
                    options=HASTALIK_SECENEKLERI,
                    key=f"hastaliklar_{derece_key}_{akraba}",
                    default=default_hastaliklar
                )

# --- FORM İÇERİĞİ ---
def hasta_formunu_goster(hasta_verisi=None):
    is_edit_mode = hasta_verisi is not None

    # Düzenleme modunda mevcut veriler
    sd = hasta_verisi.get("hastaBilgileri", {}).get("sosyodemografik", {}) if is_edit_mode else {}
    kg = hasta_verisi.get("hastaBilgileri", {}).get("klinikGecmis", {}) if is_edit_mode else {}
    dg = hasta_verisi.get("hastaBilgileri", {}).get("duygudurumGidis", {}) if is_edit_mode else {}
    eh = hasta_verisi.get("hastaBilgileri", {}).get("ekHastaliklarVeMadde", {}) if is_edit_mode else {}
    ko = hasta_verisi.get("klinikOlcekSonuclari", {}) if is_edit_mode else {}
    pm = eh.get("psikoaktifMaddeKullanimi", {}).get("detaylar", {}) if is_edit_mode else {}

    if "gecici_veri" not in st.session_state:
        st.session_state.gecici_veri = {}

    tab1, tab2, tab3, tab4 = st.tabs([
        "📄 Sosyodemografik ve Klinik Bilgiler",
        "📈 Duygudurum Gidiş Özellikleri",
        "💊 Ek Durumlar ve Madde Kullanımı",
        "📊 Periyodik Klinik Ölçekler"
    ])

    
    # --- TAB 1 ---
    with tab1:
        st.subheader("A. Sosyodemografik ve Genel Klinik Bilgiler")
        col1, col2, col3 = st.columns(3)
        with col1:
            ad_soyad   = st.text_input("Adı Soyadı", value=sd.get("adSoyad", ""), key="ad_soyad")
            adres      = st.text_area("Hasta adresi?", value=sd.get("adres", ""), key="adres")
            tc_kimlik  = st.text_input("T.C. Kimlik Numarası", value=sd.get("tcKimlikNo", ""), key="tc_kimlik")
            dosya_no   = st.text_input("Dosya No", value=sd.get("dosyaNo", ""), key="dosya_no")
        with col2:
            cinsiyet_opt = ["", "Kadın", "Erkek"]
            cinsiyet     = st.selectbox("Cinsiyet", cinsiyet_opt, index=idx(cinsiyet_opt, sd.get("cinsiyet","")), key="cinsiyet")
            dogum_tarihi = st.text_input("Doğum Tarihi (GG/AA/YYYY)", value=sd.get("dogumTarihi", ""), key="dogum_tarihi")
            ogr_opt      = ["", "Okuryazar Değil", "Okuryazar", "İlkokul", "Ortaokul", "Lise", "Yüksekokul", "Master/Doktora"]
            ogrenim_duzeyi = st.selectbox("Öğrenim Düzeyi", ogr_opt, index=idx(ogr_opt, sd.get("ogrenimDuzeyi","")), key="ogrenim_duzeyi")
        with col3:
            med_opt     = ["", "Bekar", "Evli", "Dul", "Boşanmış"]
            medeni_durum = st.selectbox("Medeni Durum", med_opt, index=idx(med_opt, sd.get("medeniDurum","")), key="medeni_durum")
            bir_opt     = ["", "Anne-Baba", "Eş-Çocuk", "Kardeş", "Akraba", "Arkadaş","Partner","Tek"]
            aile_yasamı = st.selectbox("Birlikte Yaşadığı Kişiler?", bir_opt, index=idx(bir_opt, sd.get("birlikteYasadigiKisiler","")), key="aile_yasamı")
            kard_opt    = ["","1","2","3","4","5+"]
            kardes_sayisi = st.selectbox("Kardeş Sayısı?", kard_opt, index=idx(kard_opt, sd.get("kardesSayisi","")), key="kardes_sayisi")
            cocuk_opt    = ["","1","2","3","4","5+"]
            cocuk_sayisi = st.selectbox("Çocuk Sayısı?", cocuk_opt, index=idx(cocuk_opt, sd.get("cocuk sayisi","")), key="cocuk_sayisi")
            calisma_durumu = st.text_input("Çalışma Durumu / Meslek", value=sd.get("calismaDurumu",""), key="calisma_durumu")
            meslek = st.text_input("Çalıştığı Meslek?", value=sd.get("meslek",""), key="meslek")
            sed_opt = ["", "Alt", "Orta-alt", "Orta", "Üst"]
            sosyoekonomik_durum = st.selectbox("Sosyo-ekonomik Durum", sed_opt, index=idx(sed_opt, sd.get("sosyoEkonomikDurum","")), key="sosyoekonomik_durum")

        st.divider()
        st.subheader("B. Klinik Geçmiş")
        col1_klinik, col2_klinik = st.columns(2)
        with col1_klinik:
            # 1. Aile Hastalık Öyküsü (Yeni Dinamik Form)
            st.markdown("##### Aile Hastalık Öyküsü")
            
            # Düzenleme modunda, hastanın kaydedilmiş verisini al
            default_aile_hastaliklari = kg.get("ailedeGorulenHastaliklar", {})
            
            # HATA DÜZELTME: Eski formatta (liste olarak) kaydedilmiş verilerle uyumluluk
            if not isinstance(default_aile_hastaliklari, dict):
                # Eğer veri bir sözlük değilse, formu boş başlatarak hatayı engelle
                default_aile_hastaliklari = {}
            
            # 1. Derece Akrabalar için dinamik formu oluştur
            with st.container(border=True):
                render_aile_hastalik_formu(1, BIRINCI_DERECE_AKRABALAR, default_aile_hastaliklari)
            
            st.markdown("---") # İki form arasında görsel ayırıcı
            
            # 2. Derece Akrabalar için dinamik formu oluştur
            with st.container(border=True):
                render_aile_hastalik_formu(2, IKINCI_DERECE_AKRABALAR, default_aile_hastaliklari)
            
            st.markdown("---") # Diğer alanlarla arasına görsel ayırıcı

            # 2. Diğer Klinik Geçmiş Bilgileri (Bu alanlar kalmalı)
            cocuk_hastalik = st.multiselect(
                "Çocuğunda görülen hastalıklar?",
                HASTALIK_SECENEKLERI,
                default=kg.get("cocukGorulenHastaliklar", []),
                key="cocuk_hastalik"
            )
            
            travma_oykusu = st.text_input(
                "Kötüye kullanım/Travma Öyküsü", 
                value=kg.get("kotuyeKullanimTravma",""), 
                key="travma_oykusu"
            )
            
            cocukluk_oykusu = st.text_input(
                "Çocukluk Öyküsü/Travma Öyküsü", 
                value=kg.get("cocuklukOykusu",""), 
                key="cocukluk_oykusu"
            )
        with col2_klinik:
            eslik_eden_tani = st.text_input("Eşlik eden psikiyatrik tanı (varsa)", value=kg.get("eslikEdenPsikiyatrikTani",""), key="eslik_eden_tani")
            gecmis_oyku = st.multiselect("Geçmiş Diğer Psikiyatrik Öykü (SCID)",
                ["Panik Boz", "Psikoz", "Sosyal fobi", "Hipokondriasis", "OKB", "Yeme boz", "Kişilik boz", "PTSD"],
                default=kg.get("gecmisDigerPsikiyatrikOyku", []), key="gecmis_oyku")
            ilk_tedavi_yasi = st.number_input("Herhangi bir nedenle ilk tedavi yaşı", min_value=0, step=1, value=kg.get("ilkTedaviYasi",0), key="ilk_tedavi_yasi")

    # --- TAB 2 ---
    with tab2:
        st.subheader("C. Duygudurum Bozukluğu Gidiş Özellikleri")
        col1_gidis, col2_gidis = st.columns(2)
        with col1_gidis:
            baslangic_yasi = st.number_input("Başlangıç yaşı", min_value=0, step=1, value=dg.get("baslangicYasi",0), key="baslangic_yasi")
            ilk_opt = ["", "Öforik mani", "Karma episod", "Hipomani", "Depresyon", "Siklotimi"]
            ilk_hastalik_donemi = st.selectbox("İlk hastalık dönemi (episod)", ilk_opt, index=idx(ilk_opt, dg.get("ilkHastalikDonemi","")), key="ilk_hastalik_donemi")
            yasam_opt = ["Yok", "Var", "Yetersiz Bilgi"]
            yasam_olayi = st.radio("Ortaya çıkışta yaşam olayı", yasam_opt, horizontal=True, index=idx(yasam_opt, dg.get("ortayaCikistaYasamOlayi","Yok")), key="yasam_olayi")
            sid_opt = ["", "Hafif", "Orta", "Şiddetli"]
            episod_siddeti = st.selectbox("Şiddeti", sid_opt, index=idx(sid_opt, dg.get("episodSiddetiOrtalama","")), key="episod_siddeti")
            ab_opt = ["", "Hızlı", "Yavaş"]
            alısagelmis_baslangic = st.selectbox("Alışagelmiş Başlangıç", ab_opt, index=idx(ab_opt, dg.get("alisagelmisBaslangic","")), key="alisagelmis_baslangic")
            alısagelmis_bitis = st.selectbox("Alışagelmiş Bitiş", ab_opt, index=idx(ab_opt, dg.get("alisagelmisBitis","")), key="alisagelmis_bitis")
            mevsimsellik = st.radio("Mevsimsellik Özellik", yasam_opt, horizontal=True, index=idx(yasam_opt, dg.get("mevsimsellik","Yok")), key="mevsimsellik")
            psikotik = st.radio("Psikotik Özellik", yasam_opt, horizontal=True, index=idx(yasam_opt, dg.get("psikotik","Yok")), key="psikotik")
        with col2_gidis:
            katatonik = st.radio("Katatonik Özellik", yasam_opt, horizontal=True, index=idx(yasam_opt, dg.get("katatonik","Yok")), key="katatonik")
            melankolik = st.radio("Melankolik Özellik", yasam_opt, horizontal=True, index=idx(yasam_opt, dg.get("melankolik","Yok")), key="melankolik")
            atipik_opt = ["Yok", "Var", "Yetersiz"]
            atipik_depresyon = st.radio("Atipik Depresyon Belirtisi", atipik_opt, horizontal=True, index=idx(atipik_opt, dg.get("atipikDepresyon","Yok")), key="atipik_depresyon")
            postpartum = st.radio("Postpartum Özellik", yasam_opt, horizontal=True, index=idx(yasam_opt, dg.get("postpartum","Yok")), key="postpartum")
            episodda_arasi = st.radio("Episodlar Arası Tam Düzelme ", yasam_opt, horizontal=True, index=idx(yasam_opt, dg.get("episodlarArasiTamDuzelme","Yok")), key="episodda_arasi")
            orunt_opt = ["", "D-M", "M-D","M-D-M-D", "UP-D", "D-M-Ö", "M-D-Ö", "UP-M", "Tutarsız"]
            episodda_oruntusu = st.selectbox("Episod Örüntüsü", orunt_opt, index=idx(orunt_opt, dg.get("episodOruntusu","")), key="episodda_oruntusu")
            toplam_episod_sayisi = st.number_input("Toplam episod sayısı", min_value=0, step=1, value=dg.get("toplamEpisodSayisi",0), key="toplam_episod_sayisi")
            igs_opt = ["", "0", "1", "2", "3+"]
            intihar_girisim_sayisi = st.selectbox("İntihar Girişim Sayısı", igs_opt, index=idx(igs_opt, dg.get("intiharGirisimSayisi","")), key="intihar_girisim_sayisi")
            intihar_yontem = st.multiselect("İntihar Yöntemi", ["İlaç", "Ası", "Atlama", "Ateşli silah", "Diğer"], default=dg.get("intiharYontem", []), key="intihar_yontem")
            a_igs_opt = ["", "0", "1", "2", "3+"]
            akraba_intihar_girisim_sayisi = st.selectbox("1. Derece akrabada İntihar Girişim Sayısı", a_igs_opt, index=idx(igs_opt, dg.get("akrabada_intiharGirisimSayisi","")), key="akrabada_intihar_girisim_sayisi")
            akraba_intihar_yontem = st.multiselect("1. Derece akrabada İntihar Yöntemi", ["İlaç", "Ası", "Atlama", "Ateşli silah", "Diğer"], default=dg.get("akrabada_intiharYontem", []), key="akrabada_intihar_yontem")
            toplam_yatis_sayisi = st.number_input("Hastanın toplam hastaneye yatış", min_value=0, step=1, value=dg.get("toplamYatisSayisi",0), key="toplam_yatis_sayisi")
            kronik_gidis = st.radio("Kronik gidiş (2 yıl < episod)", yasam_opt, horizontal=True, index=idx(yasam_opt, dg.get("kronikGidis","Yok")), key="kronik_gidis")
            hizli_dongululuk = st.radio("Hızlı döngülülük", yasam_opt, horizontal=True, index=idx(yasam_opt, dg.get("hizliDongululuk","Yok")), key="hizli_dongululuk")

    # --- TAB 3 ---
    with tab3:
        st.subheader("D. Ek Hastalıklar (Komorbiditeler)")
        
        # Seçenek listelerini tanımlayalım
        norolojik_opt = ["Epilepsi (Nöbet)", "Migren", "Demans", "Parkinson Hastalığı", "İnme (Felç) Geçmişi"]
        metabolik_opt = ["Tip 2 Diyabet (DM)", "Hipotiroidi", "Hipertiroidi", "Obezite", "Dislipidemi (Kolesterol Yüksekliği)"]
        kardiyo_opt = ["Hipertansiyon", "Koroner Arter Hastalığı", "Kalp Yetmezliği", "Ritim Bozukluğu"]
        solunum_opt = ["Astım", "KOAH", "Uyku Apnesi"]
        gastro_opt = ["Reflü (GÖRH)", "İrritabl Bağırsak Sendromu (IBS)", "Kronik Karaciğer Hastalığı", "Mide Ülseri"]
        diger_opt = ["Kronik Böbrek Yetmezliği", "Kronik Ağrı Sendromu (Fibromiyalji vb.)", "Romatoid Artrit", "Psöriasis (Sedef)", "Alerjiler", "Kanser Öyküsü"]

        # Düzenleme modunda mevcut veriyi alalım
        # Yeni yapıya uygun olarak "kronikHastaliklar" anahtarını kullanıyoruz.
        kronik_hastaliklar_data = eh.get("kronikHastaliklar", {})

        col1_ek, col2_ek = st.columns(2)
        with col1_ek:
            st.multiselect("Nörolojik Hastalıklar", norolojik_opt, 
                          default=kronik_hastaliklar_data.get("norolojik", []), 
                          key="ek_norolojik")
            st.multiselect("Metabolik/Endokrin Hastalıklar", metabolik_opt, 
                          default=kronik_hastaliklar_data.get("metabolik", []), 
                          key="ek_metabolik")
            st.multiselect("Kardiyovasküler Hastalıklar", kardiyo_opt, 
                          default=kronik_hastaliklar_data.get("kardiyovaskuler", []), 
                          key="ek_kardiyovaskuler")
        with col2_ek:
            st.multiselect("Solunum Sistemi Hastalıkları", solunum_opt, 
                          default=kronik_hastaliklar_data.get("solunum", []), 
                          key="ek_solunum")
            st.multiselect("Gastrointestinal Hastalıklar", gastro_opt, 
                          default=kronik_hastaliklar_data.get("gastrointestinal", []), 
                          key="ek_gastrointestinal")
            st.multiselect("Diğer Kronik Durumlar", diger_opt, 
                          default=kronik_hastaliklar_data.get("diger", []), 
                          key="ek_diger")

        

        st.divider()
        # <<< YENİ BÖLÜM BAŞLANGIÇ >>>
        st.subheader("E. Psikoaktif Madde Kullanımı")
        st.info("Bu bölüm interaktiftir. 'Evet' seçteğinizde ilgili maddenin özel alanları belirecektir.")

        maddeler = ["Etil Alkol", "Nikotin", "Kafein", "Marijuana", "Amfetamin", "Kokain", "PCP", "LSD", "Opiatlar"]
        madde_verileri = {}

        for madde in maddeler:
            madde_key = madde.lower().replace(" ", "_").replace("/", "_")
            # Düzenleme modu için mevcut veriyi çek (pm değişkeni fonksiyonun başında tanımlı)
            pm_def = pm.get(madde_key, {})
            kull_def = pm_def.get("kullanimDurumu", "Hayır")

            kullanim_durumu = st.radio(
                f"**{madde}** kullanıyor mu?", ["Hayır", "Evet"],
                horizontal=True, key=f"kullanim_{madde_key}",
                index=(1 if kull_def == "Evet" else 0)
            )
            madde_detaylari = {"kullanimDurumu": kullanim_durumu}

            if kullanim_durumu == "Evet":
                with st.container(border=True):
                    
                    # --- 1. ETİL ALKOL İÇİN ÖZEL BÖLÜM ---
                    if madde == "Etil Alkol":
                        st.markdown("###### Standart İçki Tüketimini Hesapla")
                        col1, col2 = st.columns(2)
                        icecek_secimi = col1.selectbox(
                            "Genellikle tüketilen içecek türü",
                            options=["Bira (Pilsner/Lager)", "Güçlü Bira (Craft/IPA vb.)", "Şarap", "Rakı/Votka/Viski/Cin", "Likör"],
                            key=f"alkol_tur_{madde_key}"
                        )
                        miktar = col2.number_input("Tek seferde ortalama tüketim (ml)", min_value=0, step=10, key=f"alkol_miktar_{madde_key}")

                        if miktar > 0:
                            standart_deger = standart_icki_hesapla(icecek_secimi, miktar)
                            st.info(f"Girilen miktar yaklaşık **{standart_deger:.2f} standart içkiye** denktir.")
                            madde_detaylari['standart_icki'] = f"{standart_deger:.2f}"

                        st.markdown("---")
                        ara_verdi_mi = st.checkbox("Geçmişte ara verdi mi?", key=f"alkol_ara_verdi_{madde_key}", value=pm_def.get("ara_verdi_mi", False))
                        madde_detaylari['ara_verdi_mi'] = ara_verdi_mi
                        
                        if ara_verdi_mi:
                            ara_verme_suresi = st.number_input("Kaç yıl ara verdi?", min_value=0, step=1, key=f"alkol_ara_sure_{madde_key}", value=int(pm_def.get("ara_verme_suresi", 0)))
                            madde_detaylari['ara_verme_suresi'] = ara_verme_suresi

                    # --- 2. NİKOTİN İÇİN ÖZEL BÖLÜM ---
                    elif madde == "Nikotin":
                        col1, col2 = st.columns(2)
                        gunluk_paket = col1.number_input("Günde kaç paket?", min_value=0.0, step=0.5, format="%.1f", key=f"nikotin_paket_{madde_key}", value=float(pm_def.get("gunluk_paket", 0.0)))
                        kullanim_yili = col2.number_input("Kaç yıldır kullanıyor?", min_value=0, step=1, key=f"nikotin_yil_{madde_key}", value=int(pm_def.get("kullanim_yili", 0)))
                        
                        madde_detaylari['gunluk_paket'] = gunluk_paket
                        madde_detaylari['kullanim_yili'] = kullanim_yili

                        birakti_mi = st.checkbox("Bıraktı mı?", key=f"nikotin_birakti_{madde_key}", value=pm_def.get("birakti_mi", False))
                        madde_detaylari['birakti_mi'] = birakti_mi
                        
                        if birakti_mi:
                            birakma_suresi = st.number_input("Kaç yıl önce bıraktı?", min_value=0, step=1, key=f"nikotin_birakma_sure_{madde_key}", value=int(pm_def.get("birakma_suresi", 0)))
                            madde_detaylari['birakma_suresi'] = birakma_suresi

                    # --- 3. KAFEİN İÇİN ÖZEL BÖLÜM ---
                    elif madde == "Kafein":
                        gunluk_mg = st.number_input(
                            "Günlük ortalama kafein tüketimi (mg)", 
                            min_value=0, step=10, 
                            key=f"kafein_mg_{madde_key}",
                            value=int(pm_def.get("gunluk_mg", 0)),
                            help="1 fincan filtre kahve ~95mg, 1 kupa siyah çay ~47mg, 1 kutu kola ~34mg"
                        )
                        madde_detaylari['gunluk_mg'] = gunluk_mg

                    # --- 4. DİĞER TÜM MADDELER İÇİN ---
                    else:
                        diger_not = st.text_input("Eklemek istediğiniz ", key=f"diger_not_{madde_key}", value=pm_def.get("diger_not", ""))
                        madde_detaylari['diger_not'] = diger_not

            madde_verileri[madde_key] = madde_detaylari
            
            if madde != maddeler[-1]:
                st.markdown("---")

        kotuye_kullanim_notu = st.text_area(
            "Kötüye kullanım ya da bağımlılık durumunu özetleyiniz",
            value=eh.get("psikoaktifMaddeKullanimi", {}).get("kotuyeKullanimNotu", "")
        )
        # Veriyi session_state'e kaydet (mevcut yapınızla uyumlu)
        st.session_state.gecici_veri['madde_verileri'] = madde_verileri
        st.session_state.gecici_veri['kotuye_kullanim_notu'] = kotuye_kullanim_notu
        # <<< YENİ BÖLÜM SON >>>

    # --- TAB 4 ---
    with tab4:
        st.subheader("F. Periyodik Değerlendirme Ölçekleri")
        col1_olcek, col2_olcek = st.columns(2)
        with col1_olcek:
            st.number_input("GAF (İşlevsellik) Skoru", 0, 100, int(ko.get("GAF",{}).get("hamSkor",70)), key="GAF")
            st.number_input("YMRS (Mani) Skoru", 0, 60,  int(ko.get("YMRS",{}).get("hamSkor",5)), key="YMRS")
            st.number_input("HDRS (Depresyon) Skoru", 0, 52,  int(ko.get("HDRS",{}).get("hamSkor",6)), key="HDRS")
        with col2_olcek:
            # GÜNCELLEME: ALDA A ve B yerine tek bir ALDA skoru girişi
            default_alda_a = int(ko.get("ALDA_A", {}).get("hamSkor", 0))
            default_alda_b = int(ko.get("ALDA_B", {}).get("hamSkor", 0))
            default_alda_score = int(ko.get("ALDA", {}).get("hamSkor", default_alda_a - default_alda_b))
            st.number_input("ALDA (Lityum Yanıtı) Skoru", -10, 10, default_alda_score, key="ALDA")
            
            # GÜNCELLEME: Açıklayıcı başlıklar eklendi
            st.number_input("SAÖ (Sabahçılık–Akşamcılık) Skoru", 16, 86, int(ko.get("SAO",{}).get("hamSkor",50)), key="SAO")
            st.number_input("SPAQ (Mevsimsellik) Skoru", min_value=0, step=1, value=int(ko.get("SPAQ",{}).get("hamSkor",0)), key="SPAQ")

    def verileri_topla():
        toplanan_veri = {}
        if st.session_state.get("hastalik_var_1_derece") == "Evet":
            toplanan_veri["1_derece"] = []
            secilen_akrabalar = st.session_state.get("secilen_akrabalar_1_derece", [])
            for akraba in secilen_akrabalar:
                hastaliklar = st.session_state.get(f"hastaliklar_1_derece_{akraba}", [])
                if hastaliklar: toplanan_veri["1_derece"].append({"akraba": akraba, "hastaliklar": hastaliklar})
        if st.session_state.get("hastalik_var_2_derece") == "Evet":
            toplanan_veri["2_derece"] = []
            secilen_akrabalar = st.session_state.get("secilen_akrabalar_2_derece", [])
            for akraba in secilen_akrabalar:
                hastaliklar = st.session_state.get(f"hastaliklar_2_derece_{akraba}", [])
                if hastaliklar: toplanan_veri["2_derece"].append({"akraba": akraba, "hastaliklar": hastaliklar})
        return toplanan_veri

    # Toplanan verileri döndür
    return {
        "ad_soyad": st.session_state.get("ad_soyad",""),
        "tc_kimlik": st.session_state.get("tc_kimlik",""),
        "adres": st.session_state.get("adres",""),
        "dosya_no": st.session_state.get("dosya_no",""),
        "cinsiyet": st.session_state.get("cinsiyet",""),
        "dogum_tarihi": st.session_state.get("dogum_tarihi",""),
        "ogrenim_duzeyi": st.session_state.get("ogrenim_duzeyi",""),
        "medeni_durum": st.session_state.get("medeni_durum",""),
        "aile_yasamı": st.session_state.get("aile_yasamı",""),
        "kardes_sayisi": st.session_state.get("kardes_sayisi",""),
        "cocuk_sayisi": st.session_state.get("cocuk_sayisi",""),
        "calisma_durumu": st.session_state.get("calisma_durumu",""),
        "meslek": st.session_state.get("meslek",""),
        "sosyoekonomik_durum": st.session_state.get("sosyoekonomik_durum",""),
        "akraba_hastalik": st.session_state.get("akraba_hastalik",[]),
        "akraba_hastaliklari_detayli": verileri_topla(), 
        "cocuk_hastalik": st.session_state.get("cocuk_hastalik",[]),
        "travma_oykusu": st.session_state.get("travma_oykusu",""),
        "cocukluk_oykusu": st.session_state.get("cocukluk_oykusu",""),
        "eslik_eden_tani": st.session_state.get("eslik_eden_tani",""),
        "gecmis_oyku": st.session_state.get("gecmis_oyku",[]),
        "ilk_tedavi_yasi": st.session_state.get("ilk_tedavi_yasi",0),
        "baslangic_yasi": st.session_state.get("baslangic_yasi",0),
        "ilk_hastalik_donemi": st.session_state.get("ilk_hastalik_donemi",""),
        "yasam_olayi": st.session_state.get("yasam_olayi","Yok"),
        "episod_siddeti": st.session_state.get("episod_siddeti",""),
        "alısagelmis_baslangic": st.session_state.get("alisagelmis_baslangic",""),
        "alısagelmis_bitis": st.session_state.get("alisagelmis_bitis",""),
        "mevsimsellik": st.session_state.get("mevsimsellik","Yok"),
        "psikotik": st.session_state.get("psikotik","Yok"),
        "katatonik": st.session_state.get("katatonik","Yok"),
        "melankolik": st.session_state.get("melankolik","Yok"),
        "atipik_depresyon": st.session_state.get("atipik_depresyon","Yok"),
        "postpartum": st.session_state.get("postpartum","Yok"),
        "episodda_arasi": st.session_state.get("episodda_arasi","Yok"),
        "episodda_oruntusu": st.session_state.get("episodda_oruntusu",""),
        "toplam_episod_sayisi": st.session_state.get("toplam_episod_sayisi",0),
        "intihar_girisim_sayisi": st.session_state.get("intihar_girisim_sayisi",""),
        "intihar_yontem": st.session_state.get("intihar_yontem",[]),
        "akrabada_intihar_girisim_sayisi": st.session_state.get("intihar_girisim_sayisi",""),
        "akrabada_intihar_yontem": st.session_state.get("intihar_yontem",[]),
        "toplam_yatis_sayisi": st.session_state.get("toplam_yatis_sayisi",0),
        "kronik_gidis": st.session_state.get("kronik_gidis","Yok"),
        "hizli_dongululuk": st.session_state.get("hizli_dongululuk","Yok"),
        "kronik_hastaliklar": {
            "norolojik": st.session_state.get("ek_norolojik", []),
            "metabolik": st.session_state.get("ek_metabolik", []),
            "kardiyovaskuler": st.session_state.get("ek_kardiyovaskuler", []),
            "solunum": st.session_state.get("ek_solunum", []),
            "gastrointestinal": st.session_state.get("ek_gastrointestinal", []),
            "diger": st.session_state.get("ek_diger", [])
        },
        "psikoaktif_madde_kullanimi": {
            "detaylar": st.session_state.gecici_veri.get('madde_verileri', {}),
            "kotuyeKullanimNotu": st.session_state.gecici_veri.get('kotuye_kullanim_notu', "")
        },
        "klinik_olcekler": {
            "GAF":    {"hamSkor": st.session_state.get("GAF",70)},
            "YMRS":   {"hamSkor": st.session_state.get("YMRS",5)},
            "HDRS":   {"hamSkor": st.session_state.get("HDRS",6)},
            "ALDA":   {"hamSkor": st.session_state.get("ALDA",0)}, # Artık tek ALDA
            "SAO":    {"hamSkor": st.session_state.get("SAO",50)},
            "SPAQ":   {"hamSkor": st.session_state.get("SPAQ",0)},
        }
    }

# --- LİSTE SAYFASI ---
def ana_sayfa_goster():
    st.header("📂 Kayıtlı Değerlendirmeler")
    if st.button("➕ Yeni Değerlendirme Kaydı Ekle", use_container_width=True, type="primary"):
        st.session_state.view = 'yeni_kayit'
        st.rerun()

    st.markdown("---")
    hastalar = veri_yukle()
    if not hastalar:
        st.warning("🔍 Henüz kayıtlı değerlendirme yok.")
    else:
        for index, hasta in enumerate(reversed(hastalar)):
            original_index = len(hastalar) - 1 - index
            meta_data = hasta.get("degerlendirmeMeta", {})
            kayit_id = meta_data.get("kayitId", f"eski_kayit_{original_index}")
            tarih = meta_data.get("degerlendirmeTarihi", "Tarih Yok").split("T")[0]
            ad_soyad_disp = hasta.get("hastaBilgileri", {}).get("sosyodemografik", {}).get("adSoyad", "İsimsiz")
            with st.container(border=True):
                col1, col2, col3 = st.columns([4, 1, 1])
                with col1:
                    st.subheader(f"{ad_soyad_disp}")
                    st.caption(f"Değerlendirme Tarihi: {tarih}")
                with col2:
                    if st.button("🔄 Düzenle", key=f"edit_{kayit_id}", use_container_width=True):
                        st.session_state.view = 'duzenle'
                        st.session_state.editing_id = kayit_id
                        st.rerun()
                with col3:
                    if st.button("❌ Sil", key=f"delete_{kayit_id}", use_container_width=True, type="primary"):
                        st.session_state.view = 'sil_onay'
                        st.session_state.deleting_id = kayit_id
                        st.rerun()

# --- YENİ KAYIT ---
def kayit_olustur_yapisi(toplanan_veriler, meta=None):
    if meta is None:
        meta = {"kayitId": str(uuid.uuid4()), "degerlendirmeTarihi": datetime.datetime.now().isoformat()}
    return {
        "degerlendirmeMeta": meta,
        "hastaBilgileri": {
            "sosyodemografik": {
                "adSoyad": toplanan_veriler["ad_soyad"],
                "tcKimlikNo": toplanan_veriler["tc_kimlik"],
                "adres": toplanan_veriler["adres"],
                "dosyaNo": toplanan_veriler["dosya_no"],
                "cinsiyet": toplanan_veriler["cinsiyet"],
                "dogumTarihi": toplanan_veriler["dogum_tarihi"],
                "ogrenimDuzeyi": toplanan_veriler["ogrenim_duzeyi"],
                "medeniDurum": toplanan_veriler["medeni_durum"],
                "birlikteYasadigiKisiler": toplanan_veriler["aile_yasamı"],
                "kardesSayisi": toplanan_veriler["kardes_sayisi"],
                "calismaDurumu": toplanan_veriler["calisma_durumu"],
                "meslek": toplanan_veriler["meslek"],
                "sosyoEkonomikDurum": toplanan_veriler["sosyoekonomik_durum"]
            },
            "klinikGecmis": {
                "ailedeGorulenHastaliklar": toplanan_veriler["akraba_hastaliklari_detayli"],
                "kotuyeKullanimTravma": toplanan_veriler["travma_oykusu"],
                "cocuklukOykusu": toplanan_veriler["cocukluk_oykusu"],
                "eslikEdenPsikiyatrikTani": toplanan_veriler["eslik_eden_tani"],
                "gecmisDigerPsikiyatrikOyku": toplanan_veriler["gecmis_oyku"],
                "ilkTedaviYasi": toplanan_veriler["ilk_tedavi_yasi"]
            },
            "duygudurumGidis": {
                "baslangicYasi": toplanan_veriler["baslangic_yasi"],
                "ilkHastalikDonemi": toplanan_veriler["ilk_hastalik_donemi"],
                "ortayaCikistaYasamOlayi": toplanan_veriler["yasam_olayi"],
                "episodSiddetiOrtalama": toplanan_veriler["episod_siddeti"],
                "alisagelmisBaslangic": toplanan_veriler["alısagelmis_baslangic"],
                "alisagelmisBitis": toplanan_veriler["alısagelmis_bitis"],
                "mevsimsellik": toplanan_veriler["mevsimsellik"],
                "psikotik": toplanan_veriler["psikotik"],
                "katatonik": toplanan_veriler["katatonik"],
                "melankolik": toplanan_veriler["melankolik"],
                "atipikDepresyon": toplanan_veriler["atipik_depresyon"],
                "postpartum": toplanan_veriler["postpartum"],
                "episodlarArasiTamDuzelme": toplanan_veriler["episodda_arasi"],
                "episodOruntusu": toplanan_veriler["episodda_oruntusu"],
                "toplamEpisodSayisi": toplanan_veriler["toplam_episod_sayisi"],
                "intiharGirisimSayisi": toplanan_veriler["intihar_girisim_sayisi"],
                "intiharYontem": toplanan_veriler["intihar_yontem"],
                "toplamYatisSayisi": toplanan_veriler["toplam_yatis_sayisi"],
                "kronikGidis": toplanan_veriler["kronik_gidis"],
                "hizliDongululuk": toplanan_veriler["hizli_dongululuk"]
            },
            "ekHastaliklarVeMadde": {
                "kronikHastaliklar": toplanan_veriler["kronik_hastaliklar"],
                "psikoaktifMaddeKullanimi": toplanan_veriler["psikoaktif_madde_kullanimi"]
            }
        },
        "klinikOlcekSonuclari": {olcek: puan for olcek, puan in toplanan_veriler["klinik_olcekler"].items()}
    }

def yeni_kayit_sayfasi_goster():
    st.header("📝 Yeni Değerlendirme Kaydı")

    # Form KULLANMADAN interaktif UI (psikoaktif bölümünün anında açılması için)
    toplanan_veriler = hasta_formunu_goster()

    col1_btn, col2_btn = st.columns(2)
    with col1_btn:
        if st.button("✅ Kaydı Ekle", use_container_width=True, type="primary"):
            if not toplanan_veriler["tc_kimlik"] or not toplanan_veriler["ad_soyad"]:
                st.error("❗ Lütfen en azından T.C. Kimlik Numarası ve Ad Soyad alanlarını doldurun.")
            else:
                hastalar = veri_yukle()
                yeni_kayit = kayit_olustur_yapisi(toplanan_veriler)
                hastalar.append(yeni_kayit)
                veri_kaydet(hastalar)
                st.success("✅ Yeni kayıt başarıyla eklendi!")
                st.session_state.view = 'list'
                st.rerun()
    with col2_btn:
        if st.button("Listeye Geri Dön", use_container_width=True):
            st.session_state.view = 'list'
            st.rerun()

# --- DÜZENLEME ---
def duzenleme_sayfasi_goster():
    kayit_id = st.session_state.editing_id
    hastalar = veri_yukle()
    index_to_edit = next((i for i, h in enumerate(hastalar) if h.get("degerlendirmeMeta", {}).get("kayitId") == kayit_id), None)
    if index_to_edit is None:
        st.error("Hata: Düzenlenecek kayıt bulunamadı.")
        st.session_state.view = 'list'
        st.rerun()
        return

    st.header("🔄 Kayıt Düzenleme")
    toplanan_veriler = hasta_formunu_goster(hastalar[index_to_edit])

    col1_save, col2_back = st.columns(2)
    with col1_save:
        if st.button("✅ Değişiklikleri Kaydet", use_container_width=True, type="primary"):
            meta = hastalar[index_to_edit].get("degerlendirmeMeta", {})
            guncel = kayit_olustur_yapisi(toplanan_veriler, meta=meta)
            hastalar[index_to_edit] = guncel
            veri_kaydet(hastalar)
            st.success("Kayıt başarıyla güncellendi!")
            st.session_state.view = 'list'
            st.rerun()
    with col2_back:
        if st.button("Listeye Geri Dön", use_container_width=True):
            st.session_state.view = 'list'
            st.rerun()

# --- SİLME ONAY ---
def silme_onay_sayfasi_goster():
    kayit_id = st.session_state.deleting_id
    hastalar = veri_yukle()
    index_to_delete = next((i for i, h in enumerate(hastalar) if h.get("degerlendirmeMeta", {}).get("kayitId") == kayit_id), None)
    if index_to_delete is None:
        st.error("Hata: Silinecek kayıt bulunamadı.")
        st.session_state.view = 'list'
        st.rerun()
        return

    ad_soyad_disp = hastalar[index_to_delete].get("hastaBilgileri", {}).get("sosyodemografik", {}).get("adSoyad", "İsimsiz")
    st.warning(f"**{ad_soyad_disp}** isimli hastanın kaydını kalıcı olarak silmek istediğinizden emin misiniz?")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("EVET, SİL", type="primary", use_container_width=True):
            hastalar.pop(index_to_delete)
            veri_kaydet(hastalar)
            st.success("Kayıt başarıyla silindi.")
            st.session_state.view = 'list'
            st.rerun()
    with col2:
        if st.button("HAYIR, İPTAL ET", use_container_width=True):
            st.session_state.view = 'list'
            st.rerun()

# --- SAYFA YÖNETİMİ ---
def main():
    st.title("🧠 Mr. Sina - Klinik Veri Yönetim Sistemi")
if 'view' not in st.session_state:
    st.session_state.view = 'list'
    st.session_state.editing_id = None
    st.session_state.deleting_id = None

if st.session_state.view == 'list':
    ana_sayfa_goster()
elif st.session_state.view == 'yeni_kayit':
    yeni_kayit_sayfasi_goster()
elif st.session_state.view == 'duzenle':
    duzenleme_sayfasi_goster()
elif st.session_state.view == 'sil_onay':
    silme_onay_sayfasi_goster()

# --- (İSTEĞE BAĞLI) KOD BLOĞU GÖRÜNMESİN DİYE FİLTRE ---
# Eğer bir yerlerde istemeden ````` açıldıysa ekrandaki code/pre bloklarını gizler.
st.markdown("""
<style>
.stMarkdown pre, pre code { display: none !important; }
</style>
""", unsafe_allow_html=True)

if __name__ == "__main__":
    main()