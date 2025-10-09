import logging
from pathlib import Path
from typing import Any, Dict


DEFAULT_CONFIG: Dict[str, Any] = {
    "logging": {
        "level": "INFO"
    },
    "api": {
        "host": "0.0.0.0",
        "port": 8000
    }
}


def load_config(config_path: str = "config.yaml") -> Dict[str, Any]:
    path = Path(config_path)
    if not path.exists():
        return DEFAULT_CONFIG.copy()

    try:
        import yaml  # type: ignore
        with path.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        # Shallow merge with defaults
        cfg = DEFAULT_CONFIG.copy()
        for k, v in (data or {}).items():
            if isinstance(v, dict) and isinstance(cfg.get(k), dict):
                cfg[k].update(v)
            else:
                cfg[k] = v
        return cfg
    except Exception as e:
        logging.getLogger(__name__).warning(f"Config yüklenemedi, varsayılan kullanılacak: {e}")
        return DEFAULT_CONFIG.copy()



