# Mr. Sina - Advanced Medical Imaging Analysis Platform

## Overview

Mr. Sina is a comprehensive medical imaging analysis platform designed for psychiatric and neurological applications. The system provides advanced brain MRI processing capabilities with a focus on clinical decision support.

## Key Features

### 1. Brain MRI Processing
- **PyTorch-based Analysis**: Deep learning models for brain region analysis
- **3D Image Processing**: Support for DICOM and NIfTI formats
- **Volumetric Analysis**: Quantitative measurements of brain structures
- **Heatmap Generation**: Attention visualization for brain regions

### 2. Advanced FreeSurfer Integration
- **Cortical Surface Reconstruction**: Detailed 3D brain surface modeling
- **Subcortical Segmentation**: Analysis of 133 brain structures
- **Cortical Thickness Measurement**: Regional thickness calculations
- **Volumetric Analysis**: Precise volume measurements for all structures

### 3. Clinical Decision Support
- **Risk Assessment**: Automated risk scoring algorithms
- **Treatment Recommendations**: AI-driven treatment suggestions
- **GAF Prediction**: Global Assessment of Functioning score estimation
- **Symptom Trajectory**: Predictive modeling of symptom development

### 4. Patient Management
- **Comprehensive Profiles**: Detailed patient information management
- **Clinical Scales**: Support for multiple psychiatric assessment tools
- **Medication Tracking**: Complete treatment history management
- **MR Image Management**: Organized medical imaging repository

## Technology Stack

### Frontend
- **Next.js 13+**: React-based framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization components

### Backend
- **Python Services**: FastAPI-based microservices
- **PyTorch**: Deep learning framework
- **FreeSurfer**: Advanced neuroimaging analysis tools
- **MONAI**: Medical imaging AI framework

### Database
- **PostgreSQL**: Primary data storage
- **Prisma**: Database ORM

## Installation

### Prerequisites
- Node.js 14+
- Python 3.8+
- PostgreSQL
- FreeSurfer (for advanced analysis features)

### Frontend Setup
```bash
cd mr-sina
npm install
npm run dev
```

### Backend Setup
```bash
cd python_services
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

## Services Architecture

```
Frontend (Next.js) ↔ API Layer (Next.js API Routes) ↔ Python Services (FastAPI) ↔ FreeSurfer Tools
```

### Available Services
1. **Brain MRI Processing Service**: Core image analysis capabilities
2. **Clinical Applications**: Streamlit-based clinical data management
3. **FreeSurfer Analysis Service**: Advanced neuroimaging analysis

## Documentation

- [FreeSurfer Integration Guide](Metinler/FREESURFER_INTEGRATION_GUIDE.md)
- [Clinical Decision Support Enhancements](Metinler/CLINICAL_DECISION_SUPPORT_ENHANCEMENTS.md)
- [Project Enhancements Summary](Metinler/PROJECT_ENHANCEMENTS_SUMMARY.md)
- [Final Implementation Summary](Metinler/FINAL_IMPLEMENTATION_SUMMARY.md)

## Development

### Running the Application
1. Start the Python services: `cd python_services && python3 main.py`
2. Start the frontend: `npm run dev`
3. Access the application at `http://localhost:3000` (or next available port)

### Testing
- Unit tests for core functionality
- Integration tests for service communication
- End-to-end tests for user workflows

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is part of the MR-SINA medical imaging system and is intended for clinical and research use.

## Support

For technical support or questions, please refer to the documentation or contact the development team.