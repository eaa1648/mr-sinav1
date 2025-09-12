# Import FastAPI 
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import json
import tempfile
import logging
from typing import Dict, List, Optional

# Import the new FreeSurfer processor
from freesurfer_processor import FreeSurferProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Mr. Sina Brain MRI Processing Service",
    description="PyTorch-based brain MRI analysis and comparison service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the FreeSurfer processor
freesurfer_processor = FreeSurferProcessor()

@app.on_event("startup")
async def startup_event():
    logger.info("Mr. Sina Brain MRI Processing Service started successfully")

@app.get("/")
async def root():
    return {
        "service": "Mr. Sina Brain MRI Processing Service",
        "status": "running",
        "version": "1.0.0",
        "capabilities": [
            "FreeSurfer brain analysis",
            "DICOM to NIfTI conversion",
            "Brain segmentation (133 structures)",
            "Volumetric analysis"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "brain_mri_processor"
    }

@app.post("/freesurfer-analysis")
async def freesurfer_analysis(
    nifti_file: str,
    subject_id: str,
    flags: Optional[str] = None
):
    """
    Run FreeSurfer recon-all analysis on a NIfTI file
    """
    try:
        flag_list = flags.split() if flags else None
        result = await freesurfer_processor.run_freesurfer_recon_all(
            nifti_file=nifti_file,
            subject_id=subject_id,
            flags=flag_list
        )
        return result
    except Exception as e:
        logger.error(f"Error in FreeSurfer analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/collect-freesurfer-stats")
async def collect_freesurfer_stats(
    subject_id: str
):
    """
    Collect statistical data from FreeSurfer analysis
    """
    try:
        result = await freesurfer_processor.collect_statistics(
            subject_id=subject_id
        )
        return result
    except Exception as e:
        logger.error(f"Error collecting FreeSurfer statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/freesurfer-subject-status/{subject_id}")
async def get_freesurfer_subject_status(
    subject_id: str
):
    """
    Get the processing status of a FreeSurfer subject
    """
    try:
        status = freesurfer_processor.get_subject_status(
            subject_id=subject_id
        )
        return status
    except Exception as e:
        logger.error(f"Error getting subject status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting Mr. Sina Brain MRI Processing Service...")
    print(f"🔬 Mode: FreeSurfer Only")
    
    uvicorn.run(
        "simple_main:app", 
        host="0.0.0.0", 
        port=8001, 
        reload=True,
        log_level="info"
    )