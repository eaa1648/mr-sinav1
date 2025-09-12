/**
 * Python Service Integration
 * 
 * This service handles communication with the Python-based MR image processing service.
 */

// Service configuration
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8001'

/**
 * Compare two MR images using the Python service
 * @param mr1Path Path to first MR image
 * @param mr2Path Path to second MR image
 * @param patientId Patient ID (optional)
 * @returns Comparison result
 */
export async function compareMRImages(mr1Path: string, mr2Path: string, patientId?: string) {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/compare-mrs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mr1_path: mr1Path,
        mr2_path: mr2Path,
        patient_id: patientId
      })
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error comparing MR images:', error);
    throw error;
  }
}

/**
 * Process a single MR image
 * @param mrId MR image ID
 * @param filePath Path to the MR image file
 * @returns Processing result
 */
export async function processSingleMR(mrId: string, filePath: string) {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/process-single-mr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mr_id: mrId,
        file_path: filePath
      })
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error processing MR image:', error);
    throw error;
  }
}

/**
 * Start background processing for an MR image
 * @param mrId MR image ID
 * @param filePath Path to the MR image file
 * @returns Task information
 */
export async function startBackgroundProcessing(mrId: string, filePath: string) {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/start-background-processing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mr_id: mrId,
        file_path: filePath
      })
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error starting background processing:', error);
    throw error;
  }
}

/**
 * Get the status of a background processing task
 * @param taskId Task ID
 * @returns Task status
 */
export async function getProcessingStatus(taskId: string) {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/processing-status/${taskId}`);

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting processing status:', error);
    throw error;
  }
}

/**
 * Get available brain regions for analysis
 * @returns Brain regions information
 */
export async function getBrainRegions() {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/brain-regions`);

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting brain regions:', error);
    throw error;
  }
}

/**
 * Generate heatmap for specific brain regions
 * @param mrPath Path to MR image
 * @param attentionRegions List of attention regions (optional)
 * @returns Heatmap data
 */
export async function generateHeatmap(mrPath: string, attentionRegions?: string[]) {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/generate-heatmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mr_path: mrPath,
        attention_regions: attentionRegions
      })
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating heatmap:', error);
    throw error;
  }
}

/**
 * Check if the Python service is available
 * @returns boolean indicating service availability
 */
export async function isServiceAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Python service not available:', error);
    return false;
  }
}

/**
 * Segment brain MR image using Hugging Face model
 * @param formData FormData containing the MR image file
 * @param mrId MR image ID (optional)
 * @returns Segmentation result
 */
export async function segmentBrainMR(formData: FormData, mrId?: string) {
  try {
    const url = new URL(`${PYTHON_SERVICE_URL}/segment-brain-mr`);
    if (mrId) {
      url.searchParams.append('mr_id', mrId);
    }
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Python service error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error segmenting brain MR:', error);
    throw error;
  }
}

/**
 * Compare two brain segmentation results
 * @param seg1Path Path to first segmentation result
 * @param seg2Path Path to second segmentation result
 * @param patientId Patient ID (optional)
 * @returns Comparison result
 */
export async function compareSegmentations(seg1Path: string, seg2Path: string, patientId?: string) {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/compare-segmentations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seg1_path: seg1Path,
        seg2_path: seg2Path,
        patient_id: patientId
      })
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error comparing segmentations:', error);
    throw error;
  }
}

/**
 * Get available brain structures for segmentation
 * @returns Brain structures information
 */
export async function getBrainStructures() {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/brain-structures`);

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting brain structures:', error);
    throw error;
  }
}

/**
 * Run FreeSurfer analysis on a NIfTI file
 * @param niftiFilePath Path to NIfTI file
 * @param subjectId Subject identifier
 * @param flags Optional recon-all flags
 * @returns Analysis result
 */
export async function runFreeSurferAnalysis(niftiFilePath: string, subjectId: string, flags?: string[]) {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/freesurfer-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nifti_file: niftiFilePath,
        subject_id: subjectId,
        flags: flags ? flags.join(' ') : undefined
      })
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error running FreeSurfer analysis:', error);
    throw error;
  }
}

/**
 * Collect statistical data from FreeSurfer analysis
 * @param subjectId Subject identifier
 * @returns Statistical data
 */
export async function collectFreeSurferStats(subjectId: string) {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/collect-freesurfer-stats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject_id: subjectId
      })
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error collecting FreeSurfer stats:', error);
    throw error;
  }
}

/**
 * Get the processing status of a FreeSurfer subject
 * @param subjectId Subject identifier
 * @returns Subject status
 */
export async function getFreeSurferSubjectStatus(subjectId: string) {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/freesurfer-subject-status/${subjectId}`);

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting FreeSurfer subject status:', error);
    throw error;
  }
}

/**
 * Run the complete MR analysis pipeline
 * @param dicomDir Path to directory containing DICOM files
 * @param subjectId Subject identifier
 * @param outputDir Optional output directory
 * @returns Analysis pipeline result
 */
export async function runMRAnalysisPipeline(dicomDir: string, subjectId: string, outputDir?: string) {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/run-mr-analysis-pipeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dicom_dir: dicomDir,
        subject_id: subjectId,
        output_dir: outputDir
      })
    });

    if (!response.ok) {
      throw new Error(`Python service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error running MR analysis pipeline:', error);
    throw error;
  }
}
