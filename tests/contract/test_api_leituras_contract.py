from __future__ import annotations

import json
import os
from pathlib import Path

import requests
from jsonschema import validate

BASE_URL = os.getenv("API_HORTA_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
SCHEMAS_DIR = Path(__file__).parent / "schemas"

with open(SCHEMAS_DIR / "leitura_out.schema.json", encoding="utf-8") as f:
    SCHEMA_LEITURA_OUT = json.load(f)

with open(SCHEMAS_DIR / "error_422.schema.json", encoding="utf-8") as f:
    SCHEMA_ERROR_422 = json.load(f)


def test_post_leitura_honra_contrato() -> None:
    payload = {
        "device_id": "esp32-bancada-01",
        "sensor": "dht22",
        "valor": 24.5,
        "timestamp": "2026-04-29T14:00:00Z",
    }

    response = requests.post(f"{BASE_URL}/leituras", json=payload, timeout=5)

    assert response.status_code == 201
    body = response.json()
    validate(instance=body, schema=SCHEMA_LEITURA_OUT)
    assert body["device_id"] == payload["device_id"]


def test_post_leitura_sem_timestamp_retorna_422_detail() -> None:
    payload_invalido = {
        "device_id": "esp32-bancada-01",
        "sensor": "dht22",
        "valor": 24.5,
    }

    response = requests.post(f"{BASE_URL}/leituras", json=payload_invalido, timeout=5)

    assert response.status_code == 422
    body = response.json()
    validate(instance=body, schema=SCHEMA_ERROR_422)
    assert "detail" in body
