"""
FreeSurfer MR Image Processing Module for Mr. Sina Project
This module provides integration with FreeSurfer tools for advanced brain MRI analysis.
"""

import os
import subprocess
import asyncio
import logging
from typing import Dict, Optional, List
from pathlib import Path
import tempfile
import shutil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FreeSurferProcessor:
    """
    A class to handle FreeSurfer-based MR image processing
    """
    
    def __init__(self, freesurfer_home: Optional[str] = None, subjects_dir: Optional[str] = None):
        """
        Initialize the FreeSurfer processor
        
        Args:
            freesurfer_home: Path to FreeSurfer installation
            subjects_dir: Directory to store FreeSurfer subject data
        """
        self.freesurfer_home = freesurfer_home or os.environ.get('FREESURFER_HOME')
        self.subjects_dir = subjects_dir or os.environ.get('SUBJECTS_DIR', '/tmp/freesurfer_subjects')
        
        # Create subjects directory if it doesn't exist
        os.makedirs(self.subjects_dir, exist_ok=True)
        
        # Check if required tools are available
        self._check_dependencies()
    
    def _check_dependencies(self):
        """Check if required FreeSurfer tools are available"""
        required_tools = ['recon-all', 'dcm2niix', 'asegstats2table', 'aparcstats2table']
        
        for tool in required_tools:
            if not shutil.which(tool):
                logger.warning(f"Required tool '{tool}' not found in PATH")
    
    async def convert_dicom_to_nifti(self, dicom_dir: str, output_dir: str, subject_id: str) -> Dict:
        """
        Convert DICOM images to NIfTI format using dcm2niix
        
        Args:
            dicom_dir: Directory containing DICOM files
            output_dir: Directory to save NIfTI files
            subject_id: Subject identifier
            
        Returns:
            Dictionary with conversion results
        """
        try:
            # Create output directory
            os.makedirs(output_dir, exist_ok=True)
            
            # Run dcm2niix command
            cmd = [
                'dcm2niix',
                '-f', f'{subject_id}_%s_%d',
                '-o', output_dir,
                dicom_dir
            ]
            
            logger.info(f"Converting DICOM to NIfTI: {' '.join(cmd)}")
            
            # Execute command
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                # Find the converted NIfTI file
                nifti_files = list(Path(output_dir).glob(f'{subject_id}*.nii*'))
                
                return {
                    'status': 'success',
                    'message': 'DICOM to NIfTI conversion completed successfully',
                    'nifti_files': [str(f) for f in nifti_files],
                    'output_dir': output_dir,
                    'stdout': stdout.decode(),
                    'stderr': stderr.decode()
                }
            else:
                return {
                    'status': 'error',
                    'message': 'DICOM to NIfTI conversion failed',
                    'error': stderr.decode(),
                    'stdout': stdout.decode()
                }
                
        except Exception as e:
            logger.error(f"Error in DICOM to NIfTI conversion: {str(e)}")
            return {
                'status': 'error',
                'message': f'Exception during conversion: {str(e)}'
            }
    
    async def run_freesurfer_recon_all(self, nifti_file: str, subject_id: str, 
                                     flags: Optional[List[str]] = None) -> Dict:
        """
        Run FreeSurfer recon-all pipeline on a NIfTI file
        
        Args:
            nifti_file: Path to NIfTI file
            subject_id: Subject identifier
            flags: Additional recon-all flags
            
        Returns:
            Dictionary with processing results
        """
        try:
            # Check if NIfTI file exists
            if not os.path.exists(nifti_file):
                return {
                    'status': 'error',
                    'message': f'NIfTI file not found: {nifti_file}'
                }
            
            # Set FreeSurfer environment
            env = os.environ.copy()
            if self.freesurfer_home:
                env['FREESURFER_HOME'] = self.freesurfer_home
            env['SUBJECTS_DIR'] = self.subjects_dir
            
            # Build recon-all command
            cmd = ['recon-all', '-i', nifti_file, '-s', subject_id]
            
            # Add additional flags if provided
            if flags:
                cmd.extend(flags)
            else:
                # Default to full processing pipeline
                cmd.append('-all')
            
            logger.info(f"Running FreeSurfer recon-all: {' '.join(cmd)}")
            
            # Execute command
            process = await asyncio.create_subprocess_exec(
                *cmd,
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            subject_dir = os.path.join(self.subjects_dir, subject_id)
            
            if process.returncode == 0:
                return {
                    'status': 'success',
                    'message': 'FreeSurfer recon-all completed successfully',
                    'subject_dir': subject_dir,
                    'stdout': stdout.decode(),
                    'stderr': stderr.decode()
                }
            else:
                return {
                    'status': 'error',
                    'message': 'FreeSurfer recon-all failed',
                    'subject_dir': subject_dir,
                    'error': stderr.decode(),
                    'stdout': stdout.decode()
                }
                
        except Exception as e:
            logger.error(f"Error in FreeSurfer recon-all: {str(e)}")
            return {
                'status': 'error',
                'message': f'Exception during recon-all: {str(e)}'
            }
    
    async def collect_statistics(self, subject_id: str) -> Dict:
        """
        Collect statistical data from FreeSurfer analysis
        
        Args:
            subject_id: Subject identifier
            
        Returns:
            Dictionary with statistical data
        """
        try:
            # Set FreeSurfer environment
            env = os.environ.copy()
            env['SUBJECTS_DIR'] = self.subjects_dir
            
            subject_dir = os.path.join(self.subjects_dir, subject_id)
            if not os.path.exists(subject_dir):
                return {
                    'status': 'error',
                    'message': f'Subject directory not found: {subject_dir}'
                }
            
            stats_data = {}
            
            # Collect aseg statistics
            aseg_cmd = ['asegstats2table', '--subjects', subject_id, '--meas', 'volume']
            process = await asyncio.create_subprocess_exec(
                *aseg_cmd,
                env=env,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                stats_data['aseg_stats'] = stdout.decode()
            else:
                logger.warning(f"asegstats2table failed: {stderr.decode()}")
            
            # Collect aparc statistics for both hemispheres
            for hemi in ['lh', 'rh']:
                aparc_cmd = ['aparcstats2table', '--subjects', subject_id, '--hemi', hemi, '--meas', 'thickness']
                process = await asyncio.create_subprocess_exec(
                    *aparc_cmd,
                    env=env,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await process.communicate()
                
                if process.returncode == 0:
                    stats_data[f'aparc_{hemi}_stats'] = stdout.decode()
                else:
                    logger.warning(f"aparcstats2table for {hemi} failed: {stderr.decode()}")
            
            return {
                'status': 'success',
                'message': 'Statistical data collected successfully',
                'stats_data': stats_data,
                'subject_dir': subject_dir
            }
            
        except Exception as e:
            logger.error(f"Error collecting statistics: {str(e)}")
            return {
                'status': 'error',
                'message': f'Exception during statistics collection: {str(e)}'
            }
    
    async def run_analysis_manager(self, dicom_dir: str, subject_id: str, 
                                 output_dir: Optional[str] = None) -> Dict:
        """
        Run the complete analysis pipeline: DICOM → NIfTI → FreeSurfer → Statistics
        
        Args:
            dicom_dir: Directory containing DICOM files
            subject_id: Subject identifier
            output_dir: Output directory (defaults to temporary directory)
            
        Returns:
            Dictionary with complete analysis results
        """
        try:
            # Use temporary directory if output_dir not specified
            if output_dir is None:
                output_dir = tempfile.mkdtemp()
            
            # Step 1: Convert DICOM to NIfTI
            conversion_result = await self.convert_dicom_to_nifti(dicom_dir, output_dir, subject_id)
            
            if conversion_result['status'] != 'success':
                return {
                    'status': 'error',
                    'message': 'DICOM to NIfTI conversion failed',
                    'details': conversion_result
                }
            
            # Get the first NIfTI file
            nifti_files = conversion_result.get('nifti_files', [])
            if not nifti_files:
                return {
                    'status': 'error',
                    'message': 'No NIfTI files generated'
                }
            
            nifti_file = nifti_files[0]
            
            # Step 2: Run FreeSurfer recon-all
            recon_result = await self.run_freesurfer_recon_all(nifti_file, subject_id)
            
            if recon_result['status'] != 'success':
                return {
                    'status': 'error',
                    'message': 'FreeSurfer recon-all failed',
                    'details': recon_result
                }
            
            # Step 3: Collect statistics
            stats_result = await self.collect_statistics(subject_id)
            
            return {
                'status': 'success',
                'message': 'Complete analysis pipeline finished successfully',
                'conversion': conversion_result,
                'recon_all': recon_result,
                'statistics': stats_result,
                'output_dir': output_dir
            }
            
        except Exception as e:
            logger.error(f"Error in analysis pipeline: {str(e)}")
            return {
                'status': 'error',
                'message': f'Exception during analysis pipeline: {str(e)}'
            }
    
    def get_subject_status(self, subject_id: str) -> Dict:
        """
        Get the processing status of a subject
        
        Args:
            subject_id: Subject identifier
            
        Returns:
            Dictionary with subject status information
        """
        subject_dir = os.path.join(self.subjects_dir, subject_id)
        
        if not os.path.exists(subject_dir):
            return {
                'status': 'not_found',
                'message': 'Subject directory does not exist'
            }
        
        # Check for key files that indicate processing stages
        status_info = {
            'subject_id': subject_id,
            'subject_dir': subject_dir,
            'mri_dir_exists': os.path.exists(os.path.join(subject_dir, 'mri')),
            'surf_dir_exists': os.path.exists(os.path.join(subject_dir, 'surf')),
            'stats_dir_exists': os.path.exists(os.path.join(subject_dir, 'stats')),
            'log_dir_exists': os.path.exists(os.path.join(subject_dir, 'scripts'))
        }
        
        # Determine overall status
        if status_info['stats_dir_exists']:
            status_info['processing_status'] = 'completed'
            status_info['message'] = 'Processing completed'
        elif status_info['surf_dir_exists']:
            status_info['processing_status'] = 'surface_processing'
            status_info['message'] = 'Surface processing in progress'
        elif status_info['mri_dir_exists']:
            status_info['processing_status'] = 'volume_processing'
            status_info['message'] = 'Volume processing in progress'
        else:
            status_info['processing_status'] = 'initialized'
            status_info['message'] = 'Processing initialized'
        
        return status_info

# Example usage
if __name__ == "__main__":
    # This is just for testing purposes
    async def main():
        processor = FreeSurferProcessor()
        
        # Example of running the complete pipeline
        # result = await processor.run_analysis_manager(
        #     dicom_dir="/path/to/dicom/files",
        #     subject_id="subject001"
        # )
        # print(result)
        pass
    
    # asyncio.run(main())