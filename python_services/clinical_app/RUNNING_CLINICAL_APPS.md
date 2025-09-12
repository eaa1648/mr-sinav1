# Running the Clinical Applications

This directory contains several Streamlit applications for clinical data management and analysis. Here's how to run each application:

## Prerequisites

1. Make sure you have Python 3.8 or higher installed
2. Install the required dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```

## Initializing Data Files

Before running any of the applications, you need to initialize the data files:

```bash
python initialize_clinical_data.py
```

This will create:
- `tum_hastalar_klinik_veri.json` - Main clinical data file
- `psikiyatri_ilac_veritabani.json` - Psychiatry drug database

To prepare the drug database from source data:

```bash
python veri_hazirla.py
```

## Running the Applications

### 1. Main Clinical Data Management Interface

```bash
streamlit run klinik_app.py
```

This is the main application for entering and managing patient clinical data.

### 2. Patient Progress Tracking Module

```bash
streamlit run hasta_gidisat.py
```

This module is used to track patient progress over time and compare different time points.

### 3. Treatment Management Module

```bash
streamlit run ilac.py
```

This module manages patient treatment plans and medication tracking.

### 4. General Analysis and Reporting Panel

```bash
streamlit run analiz_raporlama.py
```

This panel provides comprehensive analysis and reporting of patient data.

### 5. AI Model Training

```bash
python model_egitimi.py
```

This script trains the AI models for treatment effectiveness prediction and disease progression modeling.

## Data Files

- `tum_hastalar_klinik_veri.json` - Contains all patient clinical data
- `psikiyatri_ilac_veritabani.json` - Contains the psychiatry drug database

## Notes

- All applications share the same data files
- The applications are designed to be used together as part of a complete clinical data management system
- Make sure to run the initialization script before using any of the applications