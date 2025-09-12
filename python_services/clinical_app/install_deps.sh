#!/bin/bash

# Install clinical application dependencies
echo "Installing clinical application dependencies..."

# Install Python packages
pip install -r ../requirements.txt

echo "Dependencies installed successfully!"
echo ""
echo "To initialize the clinical data files, run:"
echo "  python initialize_clinical_data.py"
echo "  python veri_hazirla.py"
echo ""
echo "To run the clinical applications, use:"
echo "  streamlit run klinik_app.py"
echo "  streamlit run hasta_gidisat.py"
echo "  streamlit run ilac.py"
echo "  streamlit run analiz_raporlama.py"
echo ""
echo "Or run all applications at once:"
echo "  python run_all_apps.py"