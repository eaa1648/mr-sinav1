/**
 * Python Service Integration
 * 
 * This service handles communication with the Python-based MR image processing service.
 */

// Service configuration
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

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
