# FreeSurfer Integration for Mr. Sina

This document explains how to set up and use the FreeSurfer integration in the Mr. Sina project.

## Overview

The FreeSurfer integration allows the Mr. Sina system to process MR images using the advanced FreeSurfer tools, which provide detailed brain analysis including:

- Surface reconstruction
- Volume segmentation
- Cortical thickness measurements
- Subcortical segmentation

## Prerequisites

Before using the FreeSurfer integration, you need to install the following system dependencies:

### 1. FreeSurfer

1. Register for a FreeSurfer license at: https://surfer.nmr.mgh.harvard.edu/registration.html
2. Download and install FreeSurfer following the official instructions: https://surfer.nmr.mgh.harvard.edu/fswiki/DownloadAndInstall

### 2. dcm2niix

Install dcm2niix for DICOM to NIfTI conversion:

**On Ubuntu/Debian:**
```bash
sudo apt-get install dcm2niix
```

**On macOS (with Homebrew):**
```bash
brew install dcm2niix
```

**On Windows:**
Download from: https://github.com/rordenlab/dcm2niix

### 3. Additional Dependencies

Install the additional packages required by FreeSurfer:

```bash
sudo apt-get install tcsh libgomp1 x11-apps
```

## Setup

### 1. Environment Variables

Set the following environment variables:

```bash
export FREESURFER_HOME=/path/to/freesurfer
export SUBJECTS_DIR=/path/to/subjects/directory
source $FREESURFER_HOME/SetUpFreeSurfer.sh
```

### 2. Python Dependencies

The required Python dependencies are already included in the project's `requirements.txt` file. If you need to install them separately:

```bash
pip install -r requirements.txt
```

## Usage

### 1. API Endpoints

The following API endpoints are available for FreeSurfer integration:

#### Convert DICOM to NIfTI
```
POST /convert-dicom-to-nifti
```
Parameters:
- `dicom_dir`: Path to directory containing DICOM files
- `output_dir`: Path to output directory for NIfTI files
- `subject_id`: Subject identifier

#### Run FreeSurfer Analysis
```
POST /freesurfer-analysis
```
Parameters:
- `nifti_file`: Path to NIfTI file
- `subject_id`: Subject identifier
- `flags`: Optional recon-all flags (space-separated)

#### Collect Statistics
```
POST /collect-freesurfer-stats
```
Parameters:
- `subject_id`: Subject identifier

#### Run Complete Analysis Pipeline
```
POST /run-mr-analysis-pipeline
```
Parameters:
- `dicom_dir`: Path to directory containing DICOM files
- `subject_id`: Subject identifier
- `output_dir`: Optional output directory

#### Get Subject Status
```
GET /freesurfer-subject-status/{subject_id}
```

### 2. Python Module

You can also use the FreeSurfer processor directly in Python:

```python
from freesurfer_processor import FreeSurferProcessor

# Initialize the processor
processor = FreeSurferProcessor()

# Run the complete analysis pipeline
result = await processor.run_analysis_manager(
    dicom_dir="/path/to/dicom/files",
    subject_id="subject001"
)
```

## Example Workflow

Here's a complete example of how to process MR images using the FreeSurfer integration:

1. **Prepare DICOM Data**: Organize your DICOM files in a directory

2. **Run Analysis Pipeline**:
   ```bash
   curl -X POST "http://localhost:8001/run-mr-analysis-pipeline" \
        -H "Content-Type: application/json" \
        -d '{
          "dicom_dir": "/path/to/dicom/files",
          "subject_id": "patient001"
        }'
   ```

3. **Check Processing Status**:
   ```bash
   curl "http://localhost:8001/freesurfer-subject-status/patient001"
   ```

4. **Access Results**: Once processing is complete, results will be available in the SUBJECTS_DIR directory

## Troubleshooting

### Common Issues

1. **"Command not found" errors**: Make sure all required tools are installed and available in your PATH

2. **License errors**: Ensure you have a valid FreeSurfer license and the environment is properly set up

3. **Memory issues**: FreeSurfer processing can be memory-intensive; ensure your system has sufficient RAM

### Logs

Check the application logs for detailed error information:
```bash
tail -f python_service.log
```

## Development

### Adding New Features

To extend the FreeSurfer integration:

1. Modify `freesurfer_processor.py` to add new functionality
2. Add corresponding API endpoints in `main.py`
3. Update this documentation

### Testing

Run the test suite to ensure the integration works correctly:
```bash
python test_freesurfer_integration.py
```

## Security Considerations

When using the FreeSurfer integration in production:

1. Validate all file paths to prevent directory traversal attacks
2. Limit system resource usage to prevent DoS attacks
3. Run the service with minimal required privileges
4. Sanitize all user inputs before passing them to system commands