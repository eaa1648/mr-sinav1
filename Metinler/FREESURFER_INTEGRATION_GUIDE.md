# FreeSurfer Integration Guide for Mr. Sina

This guide explains how to use the advanced FreeSurfer integration features in the Mr. Sina project.

## Overview

FreeSurfer is a set of tools for the analysis and visualization of structural and functional brain imaging data. In Mr. Sina, we've integrated FreeSurfer to provide advanced brain analysis capabilities including:

- Cortical surface reconstruction
- Subcortical structure segmentation
- Cortical thickness measurements
- Volumetric analysis of brain regions

## Architecture

The FreeSurfer integration follows a client-server architecture:

```
Frontend (Next.js) ↔ API Layer (Next.js API Routes) ↔ Python Service (FastAPI) ↔ FreeSurfer Tools
```

### Components

1. **Frontend Components**:
   - `FreeSurferAnalysis.tsx`: Main analysis component
   - `FreeSurferResults.tsx`: Detailed results display
   - `FreeSurferAnalysisSection.tsx`: Patient-level analysis section

2. **Backend Services**:
   - `pythonService.ts`: TypeScript service for communicating with Python backend
   - `freesurfer_processor.py`: Python wrapper for FreeSurfer tools
   - `main.py`: FastAPI endpoints for FreeSurfer operations

3. **API Endpoints**:
   - `/api/freesurfer`: Next.js API route for FreeSurfer operations
   - `/freesurfer-analysis`: Start FreeSurfer analysis
   - `/collect-freesurfer-stats`: Collect statistical data
   - `/freesurfer-subject-status`: Get processing status

## Usage

### 1. Patient-Level Analysis

To access FreeSurfer analysis for a patient:

1. Navigate to the patient profile page
2. Click on the "FreeSurfer Analizi" tab
3. Select an appropriate MR image (NIfTI format, processed)
4. Click "Start FreeSurfer Analysis"

### 2. Direct API Usage

You can also use the FreeSurfer functions directly in your TypeScript code:

```typescript
import { runFreeSurferAnalysis, collectFreeSurferStats } from '@/lib/pythonService'

// Start analysis
const analysisResult = await runFreeSurferAnalysis(
  '/path/to/image.nii',
  'subject001',
  ['-3T', '-qcache']
)

// Collect statistics
const stats = await collectFreeSurferStats('subject001')
```

### 3. Component Integration

To add FreeSurfer analysis to a custom page:

```tsx
import FreeSurferAnalysis from '@/components/FreeSurferAnalysis'

export default function MyPage() {
  return (
    <FreeSurferAnalysis
      patientId="patient123"
      mrImageId="mr456"
      niftiFilePath="/path/to/image.nii"
      onAnalysisComplete={(result) => console.log(result)}
    />
  )
}
```

## Features

### Advanced Brain Segmentation

FreeSurfer provides detailed segmentation of 133 brain structures, including:

- Cortical regions (gyri and sulci)
- Subcortical structures (hippocampus, amygdala, etc.)
- Ventricles and white matter regions

### Cortical Thickness Analysis

The integration provides cortical thickness measurements across the entire cortical surface, which is valuable for:

- Tracking neurodegeneration
- Monitoring treatment effects
- Research applications

### Volumetric Measurements

Precise volumetric measurements of all brain structures enable:

- Longitudinal tracking of brain changes
- Comparison between patient groups
- Quantitative assessment of disease progression

## Implementation Details

### Data Flow

1. User selects MR image in patient profile
2. Frontend component calls Next.js API route
3. API route forwards request to Python service
4. Python service runs FreeSurfer tools
5. Results are stored and returned to frontend
6. Frontend displays results in detailed viewer

### Error Handling

The integration includes comprehensive error handling:

- Missing dependencies detection
- File format validation
- Processing status monitoring
- Graceful degradation for unavailable services

### Performance Considerations

FreeSurfer analysis is computationally intensive:

- Processing time: 30-60 minutes per scan
- Memory requirements: 8GB+ RAM
- CPU usage: High during processing
- Background processing support

## Extending the Integration

### Adding New Analysis Features

To add new FreeSurfer-based analysis features:

1. Extend `freesurfer_processor.py` with new methods
2. Add corresponding API endpoints in `main.py`
3. Create TypeScript functions in `pythonService.ts`
4. Build React components for visualization

### Customizing Results Display

To customize how results are displayed:

1. Modify `FreeSurferResults.tsx` component
2. Add new visualization components
3. Update data processing logic
4. Add export functionality (PDF, CSV, etc.)

## Troubleshooting

### Common Issues

1. **"Command not found" errors**:
   - Ensure FreeSurfer is properly installed
   - Verify environment variables are set
   - Check PATH includes FreeSurfer binaries

2. **Memory errors**:
   - Ensure system has sufficient RAM
   - Close other memory-intensive applications
   - Consider using FreeSurfer flags to reduce memory usage

3. **License errors**:
   - Verify FreeSurfer license is valid
   - Check license file location
   - Confirm network connectivity for license server

### Logs

Check the following logs for detailed error information:

- Frontend console (browser developer tools)
- Next.js server logs
- Python service logs (`python_service.log`)
- FreeSurfer log files (in SUBJECTS_DIR)

## Future Enhancements

Planned improvements to the FreeSurfer integration:

1. **Real-time Progress Tracking**:
   - WebSocket-based progress updates
   - Detailed step-by-step status

2. **Enhanced Visualization**:
   - 3D brain surface rendering
   - Interactive region selection
   - Statistical mapping overlays

3. **Batch Processing**:
   - Queue management for multiple scans
   - Priority scheduling
   - Resource allocation optimization

4. **Advanced Analysis**:
   - Longitudinal change detection
   - Group comparison statistics
   - Machine learning-based predictions

## Security Considerations

When using the FreeSurfer integration in production:

1. **Input Validation**:
   - Validate all file paths
   - Sanitize user inputs
   - Implement file type checking

2. **Resource Management**:
   - Limit concurrent processing jobs
   - Monitor system resource usage
   - Implement timeouts for long-running processes

3. **Access Control**:
   - Restrict access to authorized users
   - Implement role-based permissions
   - Audit all analysis requests

## Support

For issues with the FreeSurfer integration, please:

1. Check the logs for error messages
2. Verify FreeSurfer installation and configuration
3. Review this documentation
4. Contact the development team for assistance