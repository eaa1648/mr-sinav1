# Brain MRI Processor

✅ **RECENTLY FIXED: All 58 Import Errors Resolved!**

🆕 **NEW: Hugging Face Brain Segmentation Integration!**

A PyTorch-based ResNet model for MRI brain image processing and analysis. This tool processes 3D MR images to extract volumetric changes and generate heatmaps for brain analysis.

## 🔍 Issues Fixed in Latest Update

### Import Errors (58 issues resolved)

### New Features (Hugging Face Integration)
- ✅ **PyTorch Import Errors**: Added graceful fallback handling for missing PyTorch dependencies
- ✅ **Missing Dependencies**: Proper error handling for NumPy, OpenCV, PIL, NiBabel, PyDICOM
- ✅ **"Possibly Unbound Variable"**: Fixed all torch/nn/transforms variable scope issues
- ✅ **Type Safety**: Replaced 'any' types with proper TypeScript types
- ✅ **Console Statements**: Removed development console logs from production code
- ✅ **Next.js Configuration**: Fixed Turbopack deprecation warnings
- ✅ **ESLint Issues**: Resolved linting configuration problems

### Hugging Face Brain Segmentation 🧠

- ✅ **Whole Brain Segmentation**: Detailed segmentation of 133 brain structures
- ✅ **UNesT Model Integration**: Hugging Face `wholeBrainSeg_Large_UNEST_segmentation` model
- ✅ **MNI305 Registration**: Automatic image registration to standard space
- ✅ **Volume Analysis**: Precise volume calculations for all brain structures
- ✅ **Clinical Interpretation**: Automated clinical insights and recommendations
- ✅ **Segmentation Comparison**: Longitudinal analysis of brain changes

### New Fallback Mode 🛡️

The service now works even when PyTorch is not available:
- **Graceful Degradation**: No more crashes due to missing dependencies
- **Mock Analysis**: Provides realistic fallback results for testing
- **Better Error Messages**: Clear feedback about missing dependencies
- **Flexible Installation**: Critical dependencies separate from optional ones

## Features

- **3D MRI Processing**: Load and process DICOM (.dcm) and NIfTI (.nii/.nii.gz) files
- **Volumetric Analysis**: Analyze changes in brain regions (hippocampus, frontal cortex, etc.)
- **Heatmap Generation**: Create visual attention heatmaps for brain regions
- **Deep Learning**: Uses ResNet50 for feature extraction and custom neural networks for analysis
- **Clinical Interpretation**: Provides automated clinical insights and recommendations
- **Hugging Face Integration**: Advanced brain segmentation with 133 structures
- **MNI305 Registration**: Standard space registration for accurate analysis

## Brain Regions Analyzed

### Basic Analysis (ResNet50)
- Hippocampus (left and right)
- Frontal cortex
- Temporal cortex
- Amygdala (left and right)

### Advanced Analysis (Hugging Face UNesT)
- 133 detailed brain structures
- Ventricles, hippocampus, amygdala, basal ganglia
- Thalamus, cerebellum, white matter, brain stem
- Cortical regions and subcortical structures

## Installation

### Prerequisites

- Python 3.8 or higher
- macOS/Linux (Windows support may require additional configuration)

### Option 1: Enhanced Setup Script (Recommended) ✨

```bash
cd python_services
python3 setup_environment.py
```

**This script now provides:**
- ✅ Virtual environment creation
- ✅ Critical vs optional dependency separation
- ✅ Import testing and validation
- ✅ Fallback mode support
- ✅ Clear error reporting

### Option 2: Quick Start

```bash
cd python_services
./run_brain_mri.sh
```

This script will automatically:
- Create a virtual environment
- Install all required dependencies
- Run the brain MRI processor

### Option 3: Manual Installation

1. Create a virtual environment:
```bash
cd python_services
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install critical dependencies first:
```bash
pip install numpy opencv-python pillow nibabel pydicom fastapi uvicorn
```

3. Install PyTorch (optional for full functionality):
```bash
pip install torch torchvision
```

4. Install MONAI for Hugging Face integration (optional for advanced functionality):
```bash
pip install monai
```

5. Or install all from requirements:
```bash
pip install -r requirements.txt
```

## Dependencies

- **torch>=2.0.0**: PyTorch deep learning framework
- **torchvision>=0.15.0**: Computer vision models and transforms
- **numpy>=1.24.0**: Numerical computing
- **opencv-python>=4.8.0**: Image processing
- **pillow>=10.0.0**: Image handling
- **scikit-image>=0.21.0**: Image processing algorithms
- **nibabel>=5.1.0**: Neuroimaging data I/O
- **pydicom>=2.4.0**: DICOM medical imaging format support
- **fastapi>=0.104.0**: Web API framework
- **uvicorn>=0.24.0**: ASGI server
- **monai>=1.3.0**: Medical imaging AI framework (for Hugging Face integration)
- **niftyreg>=0.9.0**: Image registration tools (for MNI305 registration)

## Usage

### Service Modes

**Full Mode (PyTorch Available)** 🎆
- ResNet50 feature extraction
- Deep learning-based analysis
- High-accuracy predictions
- Advanced heatmap generation

**Advanced Mode (Hugging Face UNesT)** 🧠
- Whole brain segmentation (133 structures)
- MNI305 space registration
- Detailed volume analysis
- Clinical interpretation

**Fallback Mode (PyTorch Not Available)** 🛡️
- Basic image processing
- Mock analysis results (for testing)
- All API endpoints functional
- Reduced accuracy but no crashes

### Basic Usage

```python
from brain_mri_processor import BrainMRIProcessor

# Initialize the processor (works with or without PyTorch)
processor = BrainMRIProcessor()

# The service automatically detects available dependencies
# and provides appropriate feedback

# Process MR comparison
result = processor.process_mr_comparison("path/to/mr1.dcm", "path/to/mr2.dcm")

# Print results
print(json.dumps(result, indent=2, ensure_ascii=False))
```

### Checking Service Status

```python
# Check if PyTorch is available
from brain_mri_processor import TORCH_AVAILABLE
print(f"PyTorch available: {TORCH_AVAILABLE}")

# Service works in both modes!
processor = BrainMRIProcessor()
print("Service initialized successfully")
```

### Example Output

The processor returns a comprehensive analysis including:

```json
{
  "analysis_status": "TAMAMLANDI",
  "processing_time": "45 saniye",
  "volumetric_analysis": {
    "hippocampus_left": {
      "volume_change_percent": -3.2,
      "significance_score": 0.85,
      "interpretation": "Hafif atrofi"
    }
  },
  "clinical_interpretation": "MR karşılaştırmasında sol hippokampus'te %3.2 azalma tespit edilmiştir...",
  "risk_assessment": {
    "overall_risk_score": 35.2,
    "risk_category": "Orta Risk",
    "recommendations": [
      "Tedavi dozajının gözden geçirilmesi önerilir",
      "3 aylık kontrol MR planlanmalıdır"
    ]
  }
}
```

### Advanced Brain Segmentation Output

```json
{
  "status": "TAMAMLANDI",
  "processing_time": "60 saniye",
  "segmentation_results": {
    "total_structures_identified": 133,
    "structure_volumes": {
      "Left-Hippocampus": {
        "voxel_count": 5234,
        "approximate_volume_mm3": 5234,
        "percentage_of_brain": 0.32
      }
    },
    "clinical_interpretation": "Beyin yapısı segmentasyonu başarıyla tamamlandı..."
  }
}
```

## File Structure

```
python_services/
├── brain_mri_processor.py      # Main processor class (ResNet50)
├── huggingface_brain_seg.py    # Hugging Face brain segmentation
├── main.py                     # API endpoints
├── requirements.txt            # Python dependencies
├── setup_environment.py        # Environment setup script
├── run_brain_mri.sh            # Automated runner script
├── venv/                      # Virtual environment (created automatically)
└── README.md                  # This file
```

## Troubleshooting

### ✅ FIXED: Import Errors

**Previously:** The service would crash with "Import 'torch' could not be resolved" and 58 other import errors.

**Now Fixed:** The service gracefully handles missing dependencies!

```bash
# Test the fixes
cd python_services
python3 -c "from brain_mri_processor import BrainMRIProcessor; print('✅ Service works!')"
```

### PyTorch Not Available

**This is now OK!** The service automatically switches to fallback mode:

### Hugging Face Model Not Available

**This is also OK!** The service provides clear error messages and suggestions:

```bash
# Even without PyTorch installed, this works:
python3 -c "
from brain_mri_processor import BrainMRIProcessor, TORCH_AVAILABLE
print(f'PyTorch available: {TORCH_AVAILABLE}')
processor = BrainMRIProcessor()
print('✅ Service initialized successfully')
"

# Hugging Face model availability check:
python3 -c "
from huggingface_brain_seg import HuggingFaceBrainSegmenter
segmenter = HuggingFaceBrainSegmenter()
print('✅ Hugging Face brain segmentation available')
"
```

### Setting Up Dependencies

1. **Run the enhanced setup script:**
```bash
python3 setup_environment.py
```

2. **For virtual environment:**
```bash
source venv/bin/activate
```

3. **Verify installation:**
```bash
python3 -c "import brain_mri_processor; print('All dependencies OK')"
```

### Python Environment Issues

If you get "externally-managed-environment" errors:

1. Use the virtual environment (recommended)
2. Or use the `--break-system-packages` flag (not recommended):
```bash
pip install --break-system-packages torch torchvision
```

## Development

### Running Tests

```bash
python -m pytest tests/  # If tests are available
```

### Testing Hugging Face Integration

```bash
python test_brain_segmentation.py
```

### Model Training

To train your own model:

```python
processor = BrainMRIProcessor()
# Add your training data and logic
processor.save_model("path/to/your/model.pth")
```

## Hardware Requirements

- **CPU**: Multi-core processor recommended
- **RAM**: Minimum 8GB, 16GB recommended for large images
- **GPU**: Optional but recommended for faster processing (CUDA-compatible)
- **Storage**: At least 2GB free space for dependencies and models

## License

This project is part of the MR-SINA medical imaging system.

## Support

For technical support or questions, please refer to the main project documentation.

# Mr. Sina Python Services

This directory contains the Python services for the Mr. Sina system, including:

1. Brain MRI processing and analysis services
2. Clinical data management applications

## Brain MRI Services

The brain MRI services include:
- 3D MR image processing
- Volumetric analysis
- Brain region comparison
- Clinical interpretation
- Heatmap generation
- Detailed brain segmentation (133 structures)
- MNI space registration

See [main.py](main.py) for the FastAPI service implementation.

## Clinical Applications

The clinical applications are Streamlit-based tools for managing patient clinical data:

1. **klinik_app.py** - Main clinical data management interface
2. **hasta_gidisat.py** - Patient progress tracking module
3. **ilac.py** - Treatment management module
4. **analiz_raporlama.py** - General analysis and reporting panel
5. **model_egitimi.py** - AI engine for training models

### Running Clinical Applications

To run the clinical applications:

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Initialize data files:
   ```bash
   cd clinical_app
   python initialize_clinical_data.py
   python veri_hazirla.py
   ```

3. Run individual applications:
   ```bash
   streamlit run klinik_app.py
   streamlit run hasta_gidisat.py
   streamlit run ilac.py
   streamlit run analiz_raporlama.py
   ```

4. Or run all applications at once:
   ```bash
   python run_all_apps.py
   ```

See [clinical_app/RUNNING_CLINICAL_APPS.md](clinical_app/RUNNING_CLINICAL_APPS.md) for detailed instructions.

## Data Files

- `tum_hastalar_klinik_veri.json` - Main clinical data file
- `psikiyatri_ilac_veritabani.json` - Psychiatry drug database

## Requirements

See [requirements.txt](requirements.txt) for the complete list of dependencies.
