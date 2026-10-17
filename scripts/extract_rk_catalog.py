#!/usr/bin/env python3
"""Extract a minimal, read-only model catalog from an installed RK app.

The generated JSON contains model names, layout rectangles, and capability
metadata only. It never copies the RK executable, firmware, report payloads,
or image assets.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


def read_text(path: Path) -> str:
    raw = path.read_bytes()
    encoding = "utf-16" if raw.startswith((b"\xff\xfe", b"\xfe\xff")) else "utf-8"
    return raw.decode(encoding, errors="replace")


def parse_sections(text: str) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {"": []}
    current = ""
    for line in text.splitlines():
        match = re.match(r"\s*\[([^]]+)\]\s*$", line)
        if match:
            current = match.group(1).strip().upper()
            sections.setdefault(current, [])
        else:
            sections.setdefault(current, []).append(line)
    return sections


def parse_options(lines: list[str]) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in lines:
        value = line.split(";", 1)[0].strip()
        if not value or value.startswith("#") or "=" not in value:
            continue
        key, item = value.split("=", 1)
        result[key.strip()] = item.strip()
    return result


def number(value: str | None, fallback: int = 0) -> int:
    if value is None:
        return fallback
    try:
        return int(value.strip(), 0)
    except ValueError:
        try:
            return int(value.strip(), 10)
        except ValueError:
            return fallback


def model_family(name: str) -> str:
    match = re.search(r"(?i)(?:RK[\s-]*)?([A-Z]?\d{2,3})", name)
    return match.group(1).upper() if match else "RK"


def model_region(name: str) -> str:
    upper = name.upper()
    for suffix, label in (
        ("ISO RETURN", "ISO"),
        (" DE KEYBOARD", "DE"),
        (" FR KEYBOARD", "FR"),
        (" ES KEYBOARD", "ES"),
        (" TH KEYBOARD", "TH"),
        (" RU KEYBOARD", "RU"),
        (" UK KEYBOARD", "UK"),
    ):
        if suffix in upper:
            return label
    return "ANSI"


def extract_keys(lines: list[str]) -> tuple[list[dict[str, object]], int, int]:
    keys: list[dict[str, object]] = []
    label = ""
    rightmost = bottom = 0
    for line in lines:
        stripped = line.strip()
        if stripped.startswith(";"):
            label = stripped[1:].strip()
            continue
        match = re.match(r"K(\d+)\s*=\s*(.*)", stripped, re.IGNORECASE)
        if not match:
            continue
        fields = [part.strip() for part in match.group(2).split(",")]
        if len(fields) < 4:
            label = ""
            continue
        try:
            x, y, x2, y2 = (int(part, 0) for part in fields[:4])
        except ValueError:
            try:
                x, y, x2, y2 = (int(part, 10) for part in fields[:4])
            except ValueError:
                label = ""
                continue
        if x2 > x and y2 > y:
            caption = (label or f"Key {match.group(1)}").replace("_", " ")
            keys.append({
                "id": f"K{int(match.group(1))}",
                "label": caption,
                "x": x,
                "y": y,
                "w": x2 - x,
                "h": y2 - y,
            })
            rightmost = max(rightmost, x2)
            bottom = max(bottom, y2)
        label = ""
    return keys, rightmost, bottom


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--rk-root",
        type=Path,
        default=Path(r"C:\Program Files (x86)\RK Keyboard Software"),
        help="RK Keyboard Software install directory",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "models.json",
    )
    args = parser.parse_args()

    cfg_path = args.rk_root / "Cfg.ini"
    cfg_sections = parse_sections(read_text(cfg_path))
    cfg_options = parse_options(cfg_sections.get("OPT", []))
    supported_pids = {
        value.strip().upper().removeprefix("0X").zfill(4)
        for value in cfg_options.get("PID", "").split(",")
        if value.strip()
    }

    names: dict[str, str] = {}
    for line in cfg_sections.get("OPT", []):
        match = re.match(r"\s*DevName\d+\s*=\s*([0-9A-Fa-f]{4})\s*,\s*(.+?)\s*$", line)
        if match:
            names[match.group(1).upper()] = match.group(2).strip()

    models: list[dict[str, object]] = []
    layouts: dict[str, dict[str, object]] = {}
    for code, name in names.items():
        ini_path = args.rk_root / "Dev" / code / "KB.ini"
        if not ini_path.is_file():
            continue
        sections = parse_sections(read_text(ini_path))
        options = parse_options(sections.get("OPT", []))
        keys, width, height = extract_keys(sections.get("KEY", []))
        layer_count = number(options.get("LayerNum"), 0)
        if not layer_count:
            fn_layers = [
                number(section.removeprefix("FN"))
                for section in sections
                if re.fullmatch(r"FN\d+", section)
            ]
            layer_count = 1 + max(fn_layers, default=0)
        layer_count = max(1, min(layer_count, 8))
        screen_width, screen_height = [
            number(part)
            for part in (options.get("siScreen", "0,0").split(",") + ["0", "0"])[:2]
        ]
        mode_slots = sorted(
            int(match.group(1))
            for key in options
            if (match := re.fullmatch(r"LedOpt(\d+)", key, re.IGNORECASE))
        )
        wireless_id = options.get("PID_Wireless", "")
        wireless_id = wireless_id.upper().removeprefix("0X").zfill(4) if wireless_id else ""
        layout = {"width": width, "height": height, "keys": keys}
        layout_signature = json.dumps(layout, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        layout_id = hashlib.sha256(layout_signature.encode("utf-8")).hexdigest()[:12]
        layouts[layout_id] = layout
        models.append({
            "code": code,
            "name": name,
            "family": model_family(name),
            "region": model_region(name),
            "isDirectPid": code in supported_pids,
            "keyCount": number(options.get("LayoutKeyNum"), len(keys)),
            "layoutId": layout_id,
            "features": {
                "rgb": number(options.get("RGBKb")) != 0,
                "lightingModeSlots": mode_slots,
                "layers": ["Base"] + [f"Fn {index}" for index in range(1, layer_count)],
                "screen": {
                    "width": screen_width,
                    "height": screen_height,
                    "maxFrames": number(options.get("MaxScreenFrame")),
                    "rgb": number(options.get("RGBScreen")) != 0,
                } if number(options.get("ShowScreen")) != 0 else None,
                "macroBuffers": number(options.get("MacroBufferNum")),
                "wirelessProductId": wireless_id or None,
            },
        })

    models.sort(key=lambda model: (str(model["family"]), str(model["name"]), str(model["code"])))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    catalog = {
        "version": 1,
        "source": "RK Keyboard Software 4.06 Cfg.ini and Dev/*/KB.ini",
        "vendorId": "258A",
        "models": models,
        "layouts": layouts,
    }
    args.output.write_text(
        json.dumps(catalog, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(models)} model profiles and {len(layouts)} unique layouts to {args.output} from {cfg_path}")


if __name__ == "__main__":
    main()
