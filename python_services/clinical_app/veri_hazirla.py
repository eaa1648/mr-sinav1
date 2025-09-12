import pandas as pd
import json
from pathlib import Path

def veri_hazirla():
    """
    Projenin "ilaç kütüphanesini" hazırlayan tek seferlik bir araçtır.
    Ham CSV dosyalarını (diseasesInfo.csv, drugsInfo.csv vb.) okur, 
    psikiyatri ve nöroloji ile ilgili olanları filtreler ve 
    psikiyatri_ilac_veritabani.json dosyasını oluşturur.
    """
    
    # For demonstration purposes, we'll create a sample drug database
    # In a real implementation, you would read from actual CSV files
    
    # Sample drug database
    psikiyatri_ilac_veritabani = {
        "Lityum": {
            "grup": "Mood Stabilizer",
            "bilgi": "Bipolar bozukluk tedavisinde kullanılan birinci sıra ilaç. Kan seviyesinin düzenli olarak izlenmesi gerekir."
        },
        "Valproik Asit": {
            "grup": "Mood Stabilizer",
            "bilgi": "Bipolar bozukluk tedavisinde kullanılan bir diğer mood stabilizer. Karaciğer fonksiyonlarının izlenmesi gerekir."
        },
        "Karbamazepin": {
            "grup": "Mood Stabilizer",
            "bilgi": "Bipolar bozukluk ve nöropatik ağrı tedavisinde kullanılan ilaç. Kan seviyesinin izlenmesi gerekir."
        },
        "Lamotrijin": {
            "grup": "Mood Stabilizer",
            "bilgi": "Bipolar bozukluk tedavisinde kullanılan etkili bir ilaç. Döküntü gelişimine dikkat edilmelidir."
        },
        "Olanzapin": {
            "grup": "Atipik Antipsikotik",
            "bilgi": "Şizofreni ve bipolar bozukluk tedavisinde kullanılan atipik antipsikotik. Metabolik yan etkileri vardır."
        },
        "Risperidon": {
            "grup": "Atipik Antipsikotik",
            "bilgi": "Şizofreni ve bipolar bozukluk tedavisinde kullanılan atipik antipsikotik. Ekstrapiramidal yan etkileri olabilir."
        },
        "Seroquel": {
            "grup": "Atipik Antipsikotik",
            "bilgi": "Şizofreni ve bipolar bozukluk tedavisinde kullanılan atipik antipsikotik. Sedatif etkisi yüksektir."
        },
        "Aripiprazol": {
            "grup": "Atipik Antipsikotik",
            "bilgi": "Şizofreni ve bipolar bozukluk tedavisinde kullanılan kısmi agonist antipsikotik."
        },
        "Fluoksetin": {
            "grup": "SSRI Antidepresan",
            "bilgi": "Depresyon ve anksiyete bozukluklarında kullanılan SSRI antidepresan."
        },
        "Sertralin": {
            "grup": "SSRI Antidepresan",
            "bilgi": "Depresyon ve anksiyete bozukluklarında kullanılan SSRI antidepresan."
        },
        "Paroksetin": {
            "grup": "SSRI Antidepresan",
            "bilgi": "Depresyon ve anksiyete bozukluklarında kullanılan SSRI antidepresan. Yarı ömrü kısadır."
        },
        "Escitalopram": {
            "grup": "SSRI Antidepresan",
            "bilgi": "Depresyon ve anksiyete bozukluklarında kullanılan SSRI antidepresan. İyi tolere edilir."
        },
        "Venlafaksin": {
            "grup": "SNRI Antidepresan",
            "bilgi": "Depresyon tedavisinde kullanılan SNRI antidepresan. Doz artışı dikkatli yapılmalıdır."
        },
        "Duloksetin": {
            "grup": "SNRI Antidepresan",
            "bilgi": "Depresyon ve nöropatik ağrı tedavisinde kullanılan SNRI antidepresan."
        },
        "Bupropion": {
            "grup": "Atipik Antidepresan",
            "bilgi": "Depresyon tedavisinde kullanılan dopamin ve norepinefrin geri alım inhibitörü."
        },
        "Mirtazapin": {
            "grup": "NaSSA Antidepresan",
            "bilgi": "Depresyon tedavisinde kullanılan noradrenerjik ve spesifik serotonerjik antidepresan."
        }
    }
    
    # Save the drug database to a JSON file
    with open("psikiyatri_ilac_veritabani.json", "w", encoding="utf-8") as f:
        json.dump(psikiyatri_ilac_veritabani, f, indent=4, ensure_ascii=False)
    
    print("Psikiyatri ilaç veritabanı başarıyla oluşturuldu: psikiyatri_ilac_veritabani.json")

if __name__ == "__main__":
    veri_hazirla()