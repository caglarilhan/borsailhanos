"""
Minimal secret vault helper.

Secrets are stored in an encrypted blob (config/secrets.enc) using
Fernet symmetric encryption. At runtime we decrypt the blob with the
master key provided via SECRETS_MASTER_KEY environment variable.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any, Dict, Optional

from cryptography.fernet import Fernet

VAULT_PATH = Path("config/secrets.enc")
ENV_MASTER_KEY = "SECRETS_MASTER_KEY"


def _ensure_master_key(master_key: Optional[str] = None) -> str:
    key = master_key or os.getenv(ENV_MASTER_KEY)
    if not key:
        raise RuntimeError(
            "SECRETS_MASTER_KEY bulunamadı. "
            "Lütfen ortam değişkeni olarak veya fonksiyona parametre olarak iletin."
        )
    return key


def _cipher(master_key: str) -> Fernet:
    return Fernet(master_key.encode("utf-8"))


def load_secrets(master_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Encrypted dosyayı decrypt edip JSON döner.
    """
    if not VAULT_PATH.exists():
        return {}
    key = _ensure_master_key(master_key)
    cipher = _cipher(key)
    # Fernet anahtarlarının base64 string olduğunu varsayıyoruz.
    payload = VAULT_PATH.read_bytes()
    data = cipher.decrypt(payload)
    return json.loads(data.decode("utf-8"))


def get_secret(name: str, default: Optional[str] = None) -> Optional[str]:
    """
    Önce ortam değişkenine bakar, yoksa şifreli vault'tan çekmeye çalışır.
    """
    env_value = os.getenv(name)
    if env_value:
        return env_value
    try:
        secrets = load_secrets()
    except RuntimeError:
        # Master key yoksa şifreli içerik okunamaz; default döneriz.
        return default
    # Büyük/küçük harf uyumu için birkaç varyasyonu deniyoruz.
    return secrets.get(name) or secrets.get(name.lower()) or secrets.get(name.upper()) or default


def write_secrets(data: Dict[str, Any], master_key: Optional[str] = None) -> None:
    """
    JSON verisini encrypt edip config/secrets.enc dosyasına yazar.
    """
    key = _ensure_master_key(master_key)
    cipher = _cipher(key)
    payload = json.dumps(data, indent=2).encode("utf-8")
    token = cipher.encrypt(payload)
    VAULT_PATH.parent.mkdir(parents=True, exist_ok=True)
    VAULT_PATH.write_bytes(token)


def _cli() -> None:
    parser = argparse.ArgumentParser(description="Secret vault yönetimi")
    parser.add_argument("--export", action="store_true", help="Decrypt edilmiş JSON'u stdout'a bas")
    parser.add_argument("--import-file", type=str, help="Verilen JSON dosyasını encrypt ederek yaz")
    parser.add_argument("--master-key", type=str, help="Opsiyonel master key override")
    args = parser.parse_args()

    if args.export:
        data = load_secrets(args.master_key)
        print(json.dumps(data, indent=2))
        return

    if args.import_file:
        with open(args.import_file, "r", encoding="utf-8") as handle:
            data = json.load(handle)
        write_secrets(data, args.master_key)
        print(f"Vault güncellendi ({VAULT_PATH}).")
        return

    parser.print_help()


if __name__ == "__main__":
    _cli()


