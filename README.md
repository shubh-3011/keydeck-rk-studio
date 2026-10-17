# Keydeck — RK S98 Studio

Keydeck is an unofficial open-source profile studio for Royal Kludge S98 keyboards. It gives the S98 a cleaner workspace for key layers, RGB preferences, display assets, dial actions, connection-mode preferences, macros, profile backup and device identification. It is an independent project and is not affiliated with or endorsed by Royal Kludge.

## Try the web version

Open the deployed Keydeck site in a recent desktop version of Chrome or Edge. The profile editor works in other modern browsers. WebHID device identification requires a secure context, such as HTTPS or localhost, and a browser that implements WebHID.

## Run locally

Python 3.10 or newer is required. From the project folder:

    python server.py

Then open http://127.0.0.1:8765. The server binds to loopback and serves static files only. It has no device API and does not send profile data anywhere.

## Windows executable

Run build.ps1 in PowerShell. It packages the interface and Python launcher into a Windows executable under dist. The launcher starts the loopback web server, opens your default browser, and includes an Exit button to stop it. Chrome or Edge is required for WebHID identification.

## Device access and current scope

Identify keyboard opens the browser's WebHID device picker for vendor ID 258A. After selection, Keydeck displays the USB product and vendor IDs plus collection count from the browser-provided descriptor. The app does not call open(), receiveFeatureReport(), sendFeatureReport(), sendReport(), update firmware, or inject key events.

Profile changes are stored in the browser and can be exported as JSON. Lighting, remaps, macros, display metadata, knob mappings and connection preferences are not applied to the keyboard in this release. The Write changes control is intentionally disabled. The RK keymap protocol may overwrite the complete onboard map, so hardware output needs a matched product profile and verified report format first.

The S98 profile list is limited to variants present in the RK Keyboard Software catalog available during development. A USB identity that is absent from that list is reported as unmatched; Keydeck will not guess a model based on the user's selected profile.

## S98 features represented

The workspace includes the S98 96% layout, RGB settings, 320 × 172 display asset metadata, dial action preferences, USB-C/2.4 GHz/Bluetooth mode preferences, four key layers, profile backup, and macro sequence editing. The S98 screen and tri-mode specifications are based on the [RK S98 product page](https://rkgamingstore.com/products/s98-wireless-mechanical-keyboard). Asset selection stores only a filename and dimensions; it does not upload image bytes.

## Project references

The interaction design was informed by open-source keyboard configurators, including [KludgeKnight](https://github.com/vinc3m1/kludgeknight). Keydeck has its own interface and implementation; it does not bundle that project's source code. S98 variant IDs were cross-checked against the locally installed RK catalog and public device lists.

## Privacy

Profiles are stored in browser localStorage. The web build serves static files and uses no analytics, remote API, account, or telemetry. The interface uses system fonts and does not load third-party assets. Device identity is inspected only after the user selects a keyboard in the browser picker.

## License

MIT. See LICENSE.
