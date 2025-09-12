# Brain Segmentation Model Weights

This directory contains the pre-trained model weights for the brain segmentation service.

## Model Information

- **Model Name**: wholeBrainSeg_Large_UNEST_segmentation
- **Source**: Hugging Face (https://huggingface.co/monai-test/wholeBrainSeg_Large_UNEST_segmentation)
- **Architecture**: UNET with UNEST backbone
- **Input**: 3D T1-weighted MRI scans
- **Output**: Segmentation of 133 brain structures
- **Format**: PyTorch (.pth)

## Usage

The model will be automatically downloaded on first use by the `huggingface_brain_seg.py` service.

## Manual Download

If you prefer to download the model manually, you can download it from:
https://huggingface.co/monai-test/wholeBrainSeg_Large_UNEST_segmentation/resolve/main/model.pt

Place the downloaded file as `model.pt` in this directory.