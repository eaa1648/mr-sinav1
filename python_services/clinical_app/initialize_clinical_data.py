import json
from pathlib import Path

def initialize_data_files():
    """Initialize the clinical data files if they don't exist"""
    
    # Initialize the main clinical data file
    clinical_data_file = Path("tum_hastalar_klinik_veri.json")
    if not clinical_data_file.exists():
        with open(clinical_data_file, "w", encoding="utf-8") as f:
            json.dump([], f, indent=4, ensure_ascii=False)
        print(f"Created {clinical_data_file}")
    
    # Initialize the drug database file
    drug_db_file = Path("psikiyatri_ilac_veritabani.json")
    if not drug_db_file.exists():
        # Create an empty drug database
        drug_db = {}
        with open(drug_db_file, "w", encoding="utf-8") as f:
            json.dump(drug_db, f, indent=4, ensure_ascii=False)
        print(f"Created {drug_db_file}")
    
    print("Clinical data files initialized successfully!")

if __name__ == "__main__":
    initialize_data_files()