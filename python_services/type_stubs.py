# type: ignore
"""
Type stub file to help with import resolution for the linter.
This file provides type information for external dependencies.
"""

# PyTorch stubs
class torch:
    class nn:
        class Module: pass
        class Sequential: pass
        class Linear: pass
        class ReLU: pass
        class Dropout: pass
        class Identity: pass
    
    class cuda:
        @staticmethod
        def is_available() -> bool: ...
    
    @staticmethod
    def device(device_type: str): ...
    
    @staticmethod
    def no_grad(): ...
    
    @staticmethod
    def mean(tensor, dim=0): ...
    
    @staticmethod
    def stack(tensors, dim=0): ...
    
    @staticmethod
    def cat(tensors, dim=0): ...
    
    @staticmethod
    def save(obj, path): ...
    
    @staticmethod
    def load(path, map_location=None): ...

class torchvision:
    class transforms:
        @staticmethod
        def Compose(transforms): ...
        
        @staticmethod
        def Resize(size): ...
        
        @staticmethod
        def ToTensor(): ...
        
        @staticmethod
        def Normalize(mean, std): ...
    
    class models:
        @staticmethod
        def resnet50(weights=None): ...
        
        class ResNet50_Weights:
            IMAGENET1K_V2 = None

# Other library stubs
class numpy:
    @staticmethod
    def array(data): ...
    
    @staticmethod
    def random(*args): ...

class cv2:
    @staticmethod
    def applyColorMap(data, colormap): ...
    
    @staticmethod
    def resize(image, size): ...
    
    @staticmethod
    def addWeighted(img1, alpha, img2, beta, gamma): ...

class PIL:
    class Image:
        @staticmethod
        def open(path): ...
        
        @staticmethod
        def fromarray(array): ...

class nibabel:
    @staticmethod
    def load(path): ...

class pydicom:
    @staticmethod
    def dcmread(path): ...

class fastapi:
    class FastAPI: pass
    class UploadFile: pass
    class HTTPException: pass
    class BackgroundTasks: pass
    
    @staticmethod
    def File(*args, **kwargs): ...

class uvicorn:
    @staticmethod
    def run(*args, **kwargs): ...