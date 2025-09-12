import streamlit as st
import json
from pathlib import Path
import pandas as pd
import plotly.graph_objects as go
import plotly.figure_factory as ff
import plotly.express as px
from datetime import datetime
import uuid

# --- TEMEL AYARLAR VE VERİ YÖNETİMİ ---
DOSYA_YOLU = Path("tum_hastalar_klinik_veri.json")

@st.cache_data
def veri_yukle():
    if DOSYA_YOLU.exists() and DOSYA_YOLU.stat().st_size > 0:
        with open(DOSYA_YOLU, "r", encoding="utf-8") as f:
            try: return json.load(f)
            except json.JSONDecodeError: return []
    return []

# --- PUAN HESAPLAMA VE YORUMLAMA FONKSİYONLARI ---
def calculate_mr_sina_score(hasta_data):
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

def get_mood_state_score(klinik_olcekler):
    ymrs_skor = klinik_olcekler.get("YMRS", {}).get("hamSkor", 0)
    hdrs_skor = klinik_olcekler.get("HDRS", {}).get("hamSkor", 0)
    if ymrs_skor >= 12: return 2
    elif ymrs_skor >= 7: return 1
    elif hdrs_skor >= 17: return -2
    elif hdrs_skor >= 8: return -1
    else: return 0

# --- YENİ BİRLEŞİK GRAFİK FONKSİYONU ---
def create_combined_scale_drug_chart(df, secilen_olcekler):
    """Seçilen ölçekleri ve ilaçları aynı grafikte birleştirir."""
    fig = go.Figure()
    for olcek in secilen_olcekler:
        fig.add_trace(go.Scatter(
            x=df['Tarih'], y=df[olcek], name=olcek, mode='lines+markers',
            hovertext=df['İlaçlarMetin'],
            hovertemplate=f"<b>Tarih:</b> %{{x|%d-%m-%Y}}<br><b>{olcek} Skoru:</b> %{{y}}<br><b>Tedavi:</b><br>%{{hovertext}}<extra></extra>"
        ))
    for index, row in df.iterrows():
        if secilen_olcekler:
             fig.add_annotation(
                x=row['Tarih'], y=row[secilen_olcekler[0]],
                text=row['İlaçlarKısa'],
                showarrow=True, arrowhead=1, ax=0, ay=-30,
                bgcolor="rgba(255,255,255,0.8)", borderpad=4, font=dict(size=10)
            )
    fig.update_layout(
        title_text='<b>Klinik Ölçekler ve Tedavi Seyri</b>',
        xaxis_title='Tarih', yaxis_title='Ham Skor',
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    return fig

# --- GRAFİK OLUŞTURMA FONKSİYONLARI (Orijinal kodunuzdaki gibi) ---
def create_gauge_chart(score):
    fig = go.Figure(go.Indicator(
        mode = "gauge+number", value = score,
        title = {'text': "<b>Anlık Hastalık Yükü</b><br><span style='font-size:0.8em;color:gray'>Mr. Sina Puanı (%)</span>"},
        gauge = {'axis': {'range': [0, 100]}, 'bar': {'color': "rgba(0,0,0,0.4)"},
                 'steps': [{'range': [0, 33], 'color': 'mediumseagreen'}, {'range': [33, 66], 'color': 'yellow'}, {'range': [66, 100], 'color': 'crimson'}]}))
    fig.update_layout(height=250, margin=dict(l=10, r=10, t=60, b=10))
    return fig

def create_mood_life_chart(df):
    fig = go.Figure(go.Scatter(x=df['Tarih'], y=df['MoodState'], mode='lines+markers', name='Duygudurum Seyri', line=dict(color='royalblue', width=3), marker=dict(size=8)))
    fig.add_hrect(y0=0.5, y1=2.5, line_width=0, fillcolor="red", opacity=0.1, layer="below")
    fig.add_hrect(y0=-0.5, y1=0.5, line_width=0, fillcolor="green", opacity=0.1, layer="below")
    fig.add_hrect(y0=-2.5, y1=-0.5, line_width=0, fillcolor="blue", opacity=0.1, layer="below")
    fig.update_layout(title_text='<b>Klinik Yaşam Çizelgesi</b>', yaxis_title='Duygudurum', yaxis=dict(tickmode='array', tickvals=[2, 1, 0, -1, -2], ticktext=['<b>Mani</b>', 'Hipomani', 'Ötimi', 'Hafif Dep.', '<b>Ağır Dep.</b>']))
    return fig

# --- HASTA PANELİNİ OLUŞTURAN ANA FONKSİYON (GÜNCELLENDİ) ---
def render_patient_dashboard(patient_history, secilen_hasta_key):
    st.header(f"Hasta Analiz Paneli: {patient_history[0].get('hastaBilgileri',{}).get('sosyodemografik',{}).get('adSoyad','')}")

    # GÜNCELLEME: Grafik verileri, ilaç metinlerini de içerecek şekilde hazırlanıyor
    records_for_df = []
    mood_map = {2: 'Mani', 1: 'Hipomani', 0: 'Ötimi', -1: 'Hafif Depresyon', -2: 'Ağır Depresyon'}
    for rec in patient_history:
        klinik_olcekler = rec.get("klinikOlcekSonuclari", {})
        ilaclar = rec.get("tedaviKayitlari", {}).get("ilaclar", [])
        record_data = {
            "Tarih": pd.to_datetime(rec.get("degerlendirmeMeta", {}).get("degerlendirmeTarihi")),
            "SistemPuanı": calculate_mr_sina_score(rec),
            "İlaçlar": ilaclar,
            "İlaçlarMetin": "<br>".join([f"{i.get('ad', 'İsimsiz')} ({i.get('doz', 'N/A')})" for i in ilaclar]) or "İlaç Kaydı Yok",
            "İlaçlarKısa": " & ".join([i.get('ad','').split(' ')[0] for i in ilaclar]) or "-",
            "MoodState": get_mood_state_score(klinik_olcekler)
        }
        for scale, data in klinik_olcekler.items():
            record_data[scale] = data.get("hamSkor")
        records_for_df.append(record_data)
    
    df = pd.DataFrame(records_for_df).sort_values(by="Tarih").reset_index(drop=True)

    if df.empty:
        st.warning("Bu hasta için görüntülenecek veri bulunmuyor.")
        return

    # Orijinal kodunuzdaki "Anlık Durum Özeti" korunuyor
    st.subheader("Anlık Durum Özeti (En Son Kayda Göre)")
    son_kayit = df.iloc[-1]
    col1, col2 = st.columns([1, 2])
    with col1:
        gauge_fig = create_gauge_chart(son_kayit['SistemPuanı'])
        st.plotly_chart(gauge_fig, use_container_width=True)
    with col2:
        st.metric("Mevcut Duygudurum", mood_map[son_kayit['MoodState']])
        if len(df) > 1:
            ilk_puan = df['SistemPuanı'].iloc[0]; son_puan = df['SistemPuanı'].iloc[-1]
            ilerleme = ((ilk_puan - son_puan) / ilk_puan) * 100 if ilk_puan > 0 else 0
            st.metric("Genel İlerleme (İlk Kayda Göre)", f"{ilerleme:.1f}%", delta=f"{-ilerleme:.1f}% (Düşüş İyidir)")
        
        son_ilaclar = son_kayit['İlaçlar']
        if son_ilaclar:
            ilac_str = ", ".join([f"{ilac.get('ad', 'İsimsiz')} ({ilac.get('doz', 'N/A')})" for ilac in son_ilaclar])
            st.markdown(f"**Güncel Tedavi:** {ilac_str}")

    st.markdown("---")
    
    # Orijinal kodunuzdaki "Zaman Serisi Analizleri" bölümü geliştiriliyor
    st.subheader("Zaman Serisi Analizleri")
    
    # YENİ BÖLÜM: İnteraktif İlaç-Ölçek Karşılaştırması
    st.markdown("##### 📈 İnteraktif İlaç-Ölçek Karşılaştırması")
    if len(df) < 2:
        st.info("Karşılaştırmalı analiz yapmak için en az 2 kayıt gereklidir.")
    else:
        tarih_secenekleri = df['Tarih'].dt.strftime('%Y-%m-%d').tolist()
        secilen_tarihler = st.multiselect("Analiz için tarihleri seçin (T1, T2, T3...):", options=tarih_secenekleri, default=tarih_secenekleri, key=f"tarih_{secilen_hasta_key}")
        
        olcek_secenekleri = [col for col in df.columns if col not in ['Tarih', 'SistemPuanı', 'İlaçlar', 'DoktorNotu', 'MoodState', 'İlaçlarMetin', 'İlaçlarKısa']]
        secilen_olcekler = st.multiselect("Grafikte gösterilecek ölçekleri seçin:", olcek_secenekleri, default=["GAF", "YMRS", "HDRS"], key=f"olcek_{secilen_hasta_key}")
        
        if secilen_tarihler and secilen_olcekler:
            df_filtrelenmis = df[df['Tarih'].dt.strftime('%Y-%m-%d').isin(secilen_tarihler)]
            if not df_filtrelenmis.empty:
                combined_fig = create_combined_scale_drug_chart(df_filtrelenmis, secilen_olcekler)
                st.plotly_chart(combined_fig, use_container_width=True)
            else:
                st.warning("Seçilen tarih aralığında veri bulunamadı.")
    
    st.markdown("---")

    # Orijinal kodunuzdaki sekmeler bir expander içine alınıyor
    with st.expander("Diğer Zaman Serisi Grafikleri ve Muayene Detayları"):
        tab1, tab2, tab3, tab4 = st.tabs(["Klinik Yaşam Çizelgesi", "Sistem Puanı Seyri", "İlaç Kullanımı", "Muayene Detayları"])

        with tab1:
            if len(df) > 1:
                mood_chart_fig = create_mood_life_chart(df)
                st.plotly_chart(mood_chart_fig, use_container_width=True)
            else:
                st.info("Yaşam çizelgesi için en az 2 kayıt gereklidir.")
        
        with tab2:
            if len(df) > 1:
                fig_puan = go.Figure(go.Scatter(x=df['Tarih'], y=df['SistemPuanı'], mode='lines+markers', name='Sistem Puanı'))
                fig_puan.update_layout(title="Mr. Sina Sistem Puanı Değişimi", yaxis_range=[0,100], yaxis_title="Hastalık Yükü (%)")
                st.plotly_chart(fig_puan, use_container_width=True)
            else:
                st.info("Puan seyri için en az 2 kayıt gereklidir.")

        with tab3:
            gantt_data = []; renk_paleti = px.colors.qualitative.Plotly
            if len(df) > 1:
                for i in range(len(df) - 1):
                    if df['İlaçlar'].iloc[i]:
                        for ilac in df['İlaçlar'].iloc[i]: gantt_data.append(dict(Task=ilac['ad'], Start=df['Tarih'].iloc[i], Finish=df['Tarih'].iloc[i+1], Resource=ilac.get('doz', '')))
            if not df.empty and df['İlaçlar'].iloc[-1]:
                for ilac in df['İlaçlar'].iloc[-1]: gantt_data.append(dict(Task=ilac['ad'], Start=df['Tarih'].iloc[-1], Finish=datetime.now(), Resource=ilac.get('doz', '')))
            if gantt_data:
                ilac_renkleri = {}; unique_ilaclar = pd.DataFrame(gantt_data)['Task'].unique()
                for i, ilac_adi in enumerate(unique_ilaclar): ilac_renkleri[ilac_adi] = renk_paleti[i % len(renk_paleti)]
                fig_gantt = ff.create_gantt(gantt_data, index_col='Task', colors=ilac_renkleri, show_colorbar=True, group_tasks=True, showgrid_x=True, title="İlaç Kullanım Süreleri")
                st.plotly_chart(fig_gantt, use_container_width=True)
            else:
                st.info("Bu hasta için zaman çizelgesi oluşturulacak ilaç kaydı bulunmuyor.")
        
        with tab4:
             st.write("Her bir muayene kaydının detayları aşağıdadır.")
             # Ham veri popover'ı yerine daha okunaklı bir liste
             for index, record in enumerate(patient_history):
                tarih_str = pd.to_datetime(record.get("degerlendirmeMeta", {}).get("degerlendirmeTarihi")).strftime('%d-%m-%Y')
                with st.popover(f"{tarih_str} Tarihli Ham Veri"):
                    st.json(record)

# --- ANA UYGULAMA AKIŞI (Orijinal kodunuzdaki gibi) ---
def main():
    st.set_page_config(page_title="Mr. Sina - Analiz Paneli", layout="wide")
    st.title("📊 Mr. Sina - Genel Analiz ve Raporlama Paneli")
    tum_kayitlar = veri_yukle()
    if not tum_kayitlar:
        st.warning("Analiz edilecek hasta kaydı bulunmuyor.")
        st.stop()
    
    hasta_listesi = pd.DataFrame([k.get("hastaBilgileri", {}).get("sosyodemografik", {}) for k in tum_kayitlar])
    hasta_listesi = hasta_listesi.dropna(subset=['tcKimlikNo']).drop_duplicates(subset=['tcKimlikNo'])
    hasta_secenekleri = {f"{row['tcKimlikNo']} - {row['adSoyad']}": row['tcKimlikNo'] for index, row in hasta_listesi.iterrows()}
    
    secilen_hasta_str = st.selectbox("Analiz edilecek hastayı seçin:", options=list(hasta_secenekleri.keys()), index=None, placeholder="TC veya Ad Soyad ile arayın...")
    
    if secilen_hasta_str:
        secilen_tc = hasta_secenekleri[secilen_hasta_str]
        hasta_kayitlari = [k for k in tum_kayitlar if k.get("hastaBilgileri", {}).get("sosyodemografik", {}).get("tcKimlikNo") == secilen_tc]
        if hasta_kayitlari:
            # GÜNCELLEME: Benzersiz bir anahtar gönderiliyor
            render_patient_dashboard(hasta_kayitlari, secilen_hasta_str)
    else:
        st.info("Lütfen bir hasta seçerek analize başlayın.")

if __name__ == "__main__":
    main()