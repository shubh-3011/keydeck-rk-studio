# Keydeck RK Studio

Keydeck is an unofficial, open-source profile studio for Royal Kludge keyboards. It builds model-specific layouts and capability summaries from the RK Keyboard Software 4.06 catalog installed on the development PC. The current catalog contains 188 model variants and 90 distinct visual layouts. Keydeck is not affiliated with or endorsed by Royal Kludge.

## Features

- Inspect previously authorized RK keyboards on startup and track connect/disconnect events in Chrome or Edge.
- Match exact USB product IDs and names against the local RK catalog; show ambiguous receiver IDs as unresolved instead of guessing.
- Search 188 model profiles and display the model-specific key layout, region, RGB mode slots, function layers, and optional screen dimensions.
- Edit local keymap, lighting, screen, macro, and connection preference profiles, then import or export them as JSON.
- Keep S98 dial and tri-mode preferences in its profile.
- Run as a static web app or as a Windows executable that opens the local interface in a browser.

Keydeck does not open the HID device or send, receive, or replay HID reports. Profile editing is local only. Macro playback, screen transfers, physical connection switching, firmware updates, and hardware writes are not implemented. The **Write changes** control stays disabled.

## Try the web version

Open the [Keydeck web app](https://keydeck-rk-s98.vercel.app/) in desktop Chrome or Edge. WebHID requires a secure context such as HTTPS or localhost. The profile editor itself works without WebHID.

## Run locally

Python 3.10 or newer is required. From this folder:

```powershell
python server.py
```

Then open <http://127.0.0.1:8765>. The server binds to loopback and serves static files only. It has no profile API, analytics, remote storage, or telemetry.

## Windows executable

Install PyInstaller, then run:

```powershell
python -m pip install pyinstaller
./build.ps1
```

The build creates `dist/Keydeck-RK-Studio.exe`. It starts the local static server, opens the browser, and provides an Exit button. Chrome or Edge is needed for device identification.

## Device identity and scope

Keydeck asks the browser to enumerate devices the user has already authorized. If none are authorized, **Identify keyboard** opens the browser's device chooser for vendor ID `0x258A`. Product name, vendor ID, product ID, and collection count come from the HID descriptor; no HID report is opened.

Some keyboards expose generic or shared USB IDs. For example, the installed RK catalog lists `0x0150` as an A70 wireless receiver ID, while public S98 inventories also report `0x258A:0x0150`. Keydeck treats that identity as ambiguous and lets the user choose a model profile for the layout. See [the reverse-engineering audit](docs/reverse-engineering.md) for the evidence and limitations.

The model catalog describes the variants and controls represented in one installed RK utility version. It does not claim that every RK keyboard generation or hardware protocol is covered. Exact RGB mode names and the native feature-report protocol have not been fully reverse engineered, so the app displays profile mode slots without sending them.

To regenerate the metadata catalog from a local RK Keyboard Software install:

```powershell
python scripts/extract_rk_catalog.py --rk-root "C:\Program Files (x86)\RK Keyboard Software"
```

The extractor writes model names, key rectangles, and capability metadata to `models.json`. It does not copy RK executables, firmware, images, or HID payloads.

## References

- [RK's official web configurator](https://drive.rkgaming.com/)
- [RK S98 product specifications](https://rkgamingstore.com/products/s98-wireless-mechanical-keyboard)
- [KludgeKnight](https://github.com/vinc3m1/kludgeknight), an open-source RK web configurator used as a behavioral reference
- [Reverse-engineering audit and limits](docs/reverse-engineering.md)

## License

Keydeck is released under the MIT License. See [LICENSE](LICENSE). Royal Kludge and model names remain their respective trademarks.
