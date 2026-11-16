from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseAIProvider(ABC):
    """
    Abstract Base Class for AI Inference Providers.
    Enforces Free-Tier Safeguards and standard interface.
    """

    def __init__(self, name: str, is_free_tier: bool = True):
        self.name = name
        self.is_free_tier = is_free_tier
        self.is_available = True

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        """Check provider operational status and quota availability."""
        pass

    @abstractmethod
    async def generate_video(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Generate text-to-video."""
        pass

    @abstractmethod
    async def generate_image_to_video(self, image_url: str, prompt: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Generate animation from image."""
        pass

