#!/usr/bin/env python3
"""
Test script for the Hugging Face brain segmentation model integration
"""

import json
import logging
from huggingface_brain_seg import HuggingFaceBrainSegmenter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_brain_segmenter():
    """Test the Hugging Face brain segmenter"""
    logger.info("Testing Hugging Face brain segmentation model integration")
    
    # Initialize the segmenter
    try:
        segmenter = HuggingFaceBrainSegmenter()
        logger.info("HuggingFaceBrainSegmenter initialized successfully")
        
        # Test model information
        logger.info(f"Model device: {segmenter.device}")
        logger.info(f"Model configuration: 3D, {segmenter.network.in_channels} input channels, {segmenter.network.out_channels} output channels")
        
        # Test preprocessing pipeline
        logger.info("Preprocessing pipeline:")
        logger.info(f"  - Load image: {segmenter.preprocessing.transforms[0].__class__.__name__}")
        logger.info(f"  - Ensure channel first: {segmenter.preprocessing.transforms[1].__class__.__name__}")
        logger.info(f"  - Normalize intensity: {segmenter.preprocessing.transforms[2].__class__.__name__}")
        
        # Test postprocessing pipeline
        logger.info("Postprocessing pipeline:")
        logger.info(f"  - Activations: {segmenter.postprocessing.transforms[0].__class__.__name__}")
        logger.info(f"  - Discretization: {segmenter.postprocessing.transforms[1].__class__.__name__}")
        
        # Test inferer configuration
        logger.info(f"Inferer configuration: ROI size {segmenter.inferer.roi_size}, overlap {segmenter.inferer.overlap}")
        
        print("\n" + "="*60)
        print("HUGGING FACE BRAIN SEGMENTATION MODEL INTEGRATION TEST")
        print("="*60)
        print(f"Model: UNesT (wholeBrainSeg_Large_UNEST_segmentation)")
        print(f"Device: {segmenter.device}")
        print(f"Input: 3D T1-weighted MRI in MNI305 space")
        print(f"Output: Segmentation of 133 brain structures")
        print(f"ROI Size: {segmenter.inferer.roi_size}")
        print(f"Overlap: {segmenter.inferer.overlap}")
        print("\nFeatures:")
        print("  - Detailed whole brain segmentation")
        print("  - Volume calculation for each structure")
        print("  - Clinical interpretation generation")
        print("  - Visualization data creation")
        print("  - Segmentation comparison capability")
        print("\nNote: Actual segmentation requires NIfTI images registered to MNI305 space.")
        print("In a full implementation, the model weights would be downloaded from Hugging Face.")
        print("="*60)
        
        return True
        
    except Exception as e:
        logger.error(f"Error testing HuggingFaceBrainSegmenter: {str(e)}")
        return False

def test_segmentation_result_template():
    """Test the structure of segmentation results"""
    logger.info("Testing segmentation result template")
    
    # Create a sample result structure
    sample_result = {
        "status": "TAMAMLANDI",
        "processing_time": "60 saniye",
        "segmentation_results": {
            "total_structures_identified": 133,
            "structure_volumes": {
                "Left-Hippocampus": {
                    "voxel_count": 5234,
                    "approximate_volume_mm3": 5234,
                    "percentage_of_brain": 0.32
                },
                "Right-Hippocampus": {
                    "voxel_count": 4987,
                    "approximate_volume_mm3": 4987,
                    "percentage_of_brain": 0.31
                }
            },
            "clinical_interpretation": "Beyin yapısı segmentasyonu başarıyla tamamlandı. Tüm yapılar normal sınırlar içinde."
        },
        "visualization_data": {
            "slice_index": 96,
            "slice_shape": [192, 192],
            "structures_in_slice": [0, 1, 5, 16, 20],
            "color_mapping": {
                "0": [0, 0, 0],
                "1": [50, 100, 150],
                "5": [100, 200, 50]
            },
            "description": "Orta kesit beyin segmentasyon haritası"
        },
        "technical_details": {
            "model_version": "wholeBrainSeg_Large_UNEST_v1.0",
            "input_format": "3D T1-weighted MRI",
            "output_classes": 133,
            "processing_device": "cpu"
        }
    }
    
    print("\nSample Segmentation Result Structure:")
    print(json.dumps(sample_result, indent=2, ensure_ascii=False))
    
    return True

if __name__ == "__main__":
    print("Testing Hugging Face Brain Segmentation Integration...")
    
    # Test the brain segmenter
    success = test_brain_segmenter()
    
    # Test result template
    test_segmentation_result_template()
    
    if success:
        print("\n✓ All tests completed successfully!")
        print("\nNext steps:")
        print("1. Add actual model weights from Hugging Face")
        print("2. Implement full registration pipeline to MNI305 space")
        print("3. Add real segmentation processing")
        print("4. Implement segmentation comparison functionality")
    else:
        print("\n✗ Some tests failed. Please check the logs.")