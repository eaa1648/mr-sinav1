#!/usr/bin/env python3
"""
Test script to verify MONAI imports are working correctly
"""

# Test the specific import that was failing
try:
    from monai.inferers.inferer import SlidingWindowInferer
    print("✓ Successfully imported SlidingWindowInferer from monai.inferers.inferer")
except ImportError as e:
    print(f"✗ Failed to import SlidingWindowInferer: {e}")

# Test other MONAI imports used in the huggingface_brain_seg.py file
try:
    from monai.networks.nets.unet import UNet
    print("✓ Successfully imported UNet from monai.networks.nets.unet")
except ImportError as e:
    print(f"✗ Failed to import UNet: {e}")

try:
    from monai.transforms.io.dictionary import LoadImaged
    from monai.transforms.utility.dictionary import EnsureChannelFirstd, EnsureTyped
    from monai.transforms.intensity.dictionary import NormalizeIntensityd
    from monai.transforms.post.dictionary import Activationsd, AsDiscreted, Invertd
    from monai.transforms.compose import Compose
    print("✓ Successfully imported transforms from specific monai submodules")
except ImportError as e:
    print(f"✗ Failed to import transforms: {e}")

try:
    from monai.data.dataset import Dataset
    from monai.data.dataloader import DataLoader
    print("✓ Successfully imported Dataset from monai.data.dataset")
    print("✓ Successfully imported DataLoader from monai.data.dataloader")
except ImportError as e:
    print(f"✗ Failed to import Dataset, DataLoader: {e}")

try:
    from monai.handlers.checkpoint_loader import CheckpointLoader
    from monai.handlers.stats_handler import StatsHandler
    print("✓ Successfully imported CheckpointLoader from monai.handlers.checkpoint_loader")
    print("✓ Successfully imported StatsHandler from monai.handlers.stats_handler")
except ImportError as e:
    print(f"✗ Failed to import CheckpointLoader, StatsHandler: {e}")

try:
    from monai.apps.utils import download_url
    print("✓ Successfully imported download_url from monai.apps.utils")
except ImportError as e:
    print(f"✗ Failed to import download_url: {e}")

print("\nAll MONAI imports tested!")