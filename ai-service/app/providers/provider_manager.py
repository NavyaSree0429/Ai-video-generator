import os
from typing import List, Dict, Any, Optional
from app.providers.base_provider import BaseAIProvider

class ProviderManager:
    """
    Manages active AI providers, monitors quotas, and implements automatic fallback.
    STRICTLY avoids paid APIs as mandated by SRS FR-08 and SADD Section 5.5.
    """

    def __init__(self):
        self.providers: Dict[str, BaseAIProvider] = {}

    def register_provider(self, provider: BaseAIProvider):
        if not provider.is_free_tier:
            raise ValueError(f"Provider {provider.name} violates strictly-free budget constraint.")
        self.providers[provider.name] = provider

    def get_available_providers(self) -> List[str]:
        return [name for name, p in self.providers.items() if p.is_available and p.is_free_tier]

    async def get_all_provider_health(self) -> Dict[str, Any]:
        health_report = {}
        for name, provider in self.providers.items():
            try:
                status = await provider.check_health()
                health_report[name] = status
            except Exception as e:
                health_report[name] = {
                    "available": False,
                    "error": str(e),
                    "is_free_tier": True
                }
        return health_report

provider_manager = ProviderManager()

