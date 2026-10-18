# Keydeck RK Studio

Keydeck is an unofficial, open-source profile studio for Royal Kludge keyboards. It builds model-specific layouts and capability summaries from the RK Keyboard Software 4.06 catalog installed on the development PC. The catalog contains 188 named model profiles, 90 distinct visual layouts, and a separate unregistered profile retained for audit. Keydeck is not affiliated with or endorsed by Royal Kludge.

This is the user-facing project: [web app and Windows desktop profile editor](https://github.com/shubh-3011/keydeck-rk-studio). The separate [RK software research repository](https://github.com/shubh-3011/rk-keyboard-software-research) is the open-source RK software directory and static audit archive. It contains coverage limits, evidence tables, and a downloadable research-edition Windows workbench built from source.

## Features

- Inspect previously authorized RK keyboards on startup and track connect/disconnect events in Chrome or Edge.
- Match exact USB product IDs and names against the local RK catalog; show ambiguous receiver IDs as unresolved instead of guessing.
- Search 188 named model profiles and display model-specific key layouts, region, RGB mode slots, function layers, and optional screen dimensions.
- Browse the public RK Drive registry snapshot: 96 keyboard labels, 177 wired/2.4 GHz keyboard descriptors, 20 legacy mouse descriptors, two CB75 mouse connection profiles, and 92 direct RK-hosted image references (91 keyboard and one mouse). Inspect model-specific keyboard layers, OS tables, layout groups, lighting effects, and declared CB75 features.
- Inspect the exact RK Drive lighting-effect names and declared controls as local reference metadata, separate from the installed 4.06 mode slots.
- Draft per-key DKS, Toggle, and Mod-Tap behavior, plus SOCD and Snap Tap preferences, in Keydeck-owned profile data.
- Build structured macro timelines from semantic key, mouse-button, delay, and loop steps alongside the legacy text sequence.
- Inspect raw performance-related values present in the selected installed model profile and attach local notes. Their units and meanings are not decoded.
- Edit local keymap, lighting, screen, macro, and connection preference profiles, then import or export them as JSON.
- Keep S98 dial and tri-mode preferences in its profile.
- Run as a hosted web app or as a Windows desktop app with its own persistent WebView2 window.

Keydeck uses the official registry's vendor IDs to offer descriptor-only device identification and to show possible model candidates. It does not open the HID device or send, receive, or replay HID reports. Profile editing is local only. The new advanced behavior fields and structured macro timeline are Keydeck-local drafts, not RK-compatible settings; macros are not recorded or played back. Performance fields remain raw profile values with unresolved units. Mouse device configuration, screen transfers, physical connection switching, firmware updates, and hardware writes are not implemented. The **Write changes** control stays disabled. Catalog images are requested directly from RK only while the catalog page is open; they are not bundled with Keydeck. See the [RK Drive feature-parity notes](docs/rk-drive-feature-parity.md) for the exact boundary.

## Try the web version

Open the [Keydeck web app](https://keydeck-rk-s98.vercel.app/) in desktop Chrome or Edge. WebHID requires a secure context such as HTTPS or localhost. The profile editor itself works without WebHID.

## Run locally

Python 3.10 or newer is required. From this folder:

```powershell
python server.py
```

Then open <http://127.0.0.1:38457>. The server binds to loopback and serves static files only. It has no profile API, analytics, remote storage, or telemetry.

## Windows executable

Download the latest `Keydeck-RK-Studio.exe` from [GitHub Releases](https://github.com/shubh-3011/keydeck-rk-studio/releases/latest), or build it locally with the steps below. The desktop app opens in its own window and does not launch Chrome or Edge.

**Architecture status:** the current EXE bundles Python with PyInstaller and opens the local HTML/CSS/JavaScript interface in pywebview backed by Microsoft Edge WebView2. It is a local desktop window, not a fully native WinUI/WPF interface. It has no notification-area tray or start-on-login feature. A native reconstruction is not available yet; see the separate [research roadmap](https://github.com/shubh-3011/rk-keyboard-software-research/blob/main/REBUILD-ROADMAP.md).

Install the desktop build dependencies, then run:

```powershell
python -m pip install -r requirements-desktop.txt
./build.ps1
```

The build creates `dist/Keydeck-RK-Studio.exe`. It serves the bundled app on loopback at `127.0.0.1:38457` and renders it in an embedded Microsoft Edge WebView2 window. Microsoft Edge WebView2 Runtime must be installed on the PC. The executable does not require the hosted site or a general-purpose browser to run.

Desktop profiles and preferences stay on this PC in `%LOCALAPPDATA%\Keydeck-RK-Studio\WebView2`. The hosted web version uses that browser's own local storage, so the two versions do not sync automatically; use the built-in JSON import/export controls to move profiles between them. The desktop app binds only to loopback, does not send profile data to a service, and does not open or write to the keyboard.

## Device identity and scope

The **RK model catalog** page uses a local metadata snapshot extracted from the public RK Drive JavaScript bundle. It can browse keyboard and mouse registry records, connection-specific USB identities, keyboard layers, Windows/macOS tables, layout-group counts, lighting-effect names and declared fields, and links to RK-hosted images. The metadata is packaged with the desktop build; image requests go to RK only when the catalog page is open. The app does not implement mouse configuration or device writes. The full extraction method and source hashes are documented in the [research archive](https://github.com/shubh-3011/rk-keyboard-software-research/blob/main/docs/rk-drive-web-app-audit.md).

Keydeck asks the browser to enumerate devices the user has already authorized. If none are authorized, **Identify keyboard** opens the browser's device chooser for vendor IDs present in the bundled RK Drive registry snapshot. Product name, vendor ID, product ID, and collection count come from the HID descriptor; no HID report is opened.

Some keyboards expose generic or shared USB IDs. For example, the installed RK catalog lists `0x0150` as an A70 wireless receiver ID, while public S98 inventories also report `0x258A:0x0150`. Keydeck treats that identity as ambiguous and lets the user choose a model profile for the layout. See [the reverse-engineering audit](docs/reverse-engineering.md) for the evidence and limitations.

The model catalog describes variants and controls represented in one installed RK utility version. The separate RK Drive catalog records the public web app's own model and connection descriptors; shared receiver IDs stay ambiguous. Neither catalog proves all revisions of a marketed family are compatible. Both catalogs are local metadata, and none of it is sent to a keyboard. See [the expanded reverse-engineering audit](docs/reverse-engineering.md) for evidence and protocol questions.

To regenerate the metadata catalog from a local RK Keyboard Software install:

```powershell
python scripts/extract_rk_catalog.py --rk-root "C:\Program Files (x86)\RK Keyboard Software"
```

The extractor writes model names, visual layouts, capability metadata, raw profile configuration, and unregistered profiles to `models.json`, plus the static profile-to-handler map in `docs/rk-profile-driver-family-map.csv`. It does not copy RK executables, firmware, images, or HID payloads.

## References

- [Standalone RK software reverse-engineering research archive](https://github.com/shubh-3011/rk-keyboard-software-research)
- [RK's official web configurator](https://drive.rkgaming.com/)
- [RK Drive feature-parity notes](docs/rk-drive-feature-parity.md)
- [RK S98 product specifications](https://rkgamingstore.com/products/s98-wireless-mechanical-keyboard)
- [KludgeKnight](https://github.com/vinc3m1/kludgeknight), an open-source RK web configurator used as a behavioral reference
- [Reverse-engineering audit and limits](docs/reverse-engineering.md)
- [Updater and firmware readback audit](docs/rk-firmware-readback-audit.md)
- [Profile catalog and `KB.ini` schema audit](docs/rk-profile-schema-audit.md)
- [Resource and localization audit](docs/rk-resource-localization-audit.md)
- [Installer and uninstaller script audit](docs/rk-installer-uninstaller-script-audit.md)
- [System API and static call crosswalk](docs/rk-system-api-crosswalk.md)
- [UI event and device worker path audit](docs/rk-ui-event-worker-path-audit.md)
- [Installed RK package file manifest](docs/rk-installed-package-manifest.csv)
- [RK profile option field inventory](docs/rk-profile-option-field-inventory.csv)
- [Static profile-to-driver-family map](docs/rk-profile-driver-family-map.csv)
- [Static native API import inventory](docs/rk-native-api-imports.md)
- [Static native API callsite cross-references](docs/rk-native-api-xrefs.csv)
- [Native API entries without a recovered direct callsite](docs/rk-native-api-callsite-gaps.csv)
- [Raw native system-call byte matches](docs/rk-native-syscall-byte-matches.csv)
- [Dynamic API lookup candidates](docs/rk-dynamic-api-targets.csv)
- [MFC command-map handler candidates](docs/rk-mfc-command-map-candidates.csv)
- [MFC message-map owner evidence](docs/rk-mfc-map-owner-evidence.csv)

## License

Keydeck is released under the MIT License. See [LICENSE](LICENSE). Royal Kludge and model names remain their respective trademarks.
