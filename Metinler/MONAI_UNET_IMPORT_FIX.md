# MONAI UNet Import Fix

## Issue
Static analysis error with basedpyright:
```
"UNet" is not exported from module "monai.networks.nets"
  Import from "monai.networks.nets.unet" instead
```

## Root Cause
In MONAI version 1.5.0, the module structure has changed regarding how classes are exported:
- While `from monai.networks.nets import UNet` still works at runtime
- Static analysis tools like basedpyright are more strict about module exports
- The preferred import path is now `from monai.networks.nets.unet import UNet`

## Fix Applied
Updated import statements in:
1. `huggingface_brain_seg.py` - Line 15
2. `test_monai_imports.py` - Line 14

## Verification
All imports continue to work correctly at runtime. The static analysis error is resolved.

## Files Modified
- `huggingface_brain_seg.py`
- `test_monai_imports.py`