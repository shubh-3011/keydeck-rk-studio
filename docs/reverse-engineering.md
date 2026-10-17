# RK keyboard utility audit

This audit covers the RK Keyboard Software installed on the development PC and
the model files it ships. It is a partial static analysis, not a complete
decompilation of the Windows application or a protocol implementation.

## What the installed package contains

The installed `Cfg.ini` identifies the utility as version `0x406` and lists
vendor ID `0x258A`. Its 188 `DevName` entries resolve to 188 per-model
`KB.ini` profiles. Those profiles contain key rectangles, key labels, lighting
mode slots, layer counts, wireless receiver IDs, and optional screen settings.
The extractor in `scripts/extract_rk_catalog.py` reduces that material to the
metadata Keydeck needs; it does not copy the RK executable, firmware, image
assets, or HID payloads.

For this installed catalog, Keydeck has 188 model records, 90 distinct visual
layouts, 156 profiles with RGB backlighting, and 15 profiles with screen
metadata. The screen profiles describe 128 × 128, 240 × 135, 240 × 240, or
320 × 172 displays. Layer counts vary by profile. The resulting
`models.json` is about 500 KB.

## What the Windows binary shows

`DeviceDriver.exe` is a 32-bit Windows PE application (file version
1.0.6.8). Its imports include `HidD_GetAttributes`, `HidP_GetCaps`,
`HidD_GetFeature`, and `HidD_SetFeature`, along with normal file I/O. Its
strings include MFC key assignment and macro dialog classes. Disassembly shows
feature-report calls with 520-byte buffers and report data such as `0x09`,
`0x82`, and `0x84` at some call sites. Those observations do not establish the
meaning of every command or a safe model-identification request.

The supplied [REA reverse-engineering project](https://github.com/morluto/rea)
was inspected and its CLI launch was attempted. The package install did not
complete in this environment, and no Ghidra installation is available here, so
REA did not produce a native decompilation. The executable has not been fully
reverse engineered. A complete protocol map still needs successful native
decompilation and carefully captured read/write transactions from supported
hardware.

## Model identification and the 258A:0150 device

The Windows PnP inventory on this PC exposes a composite `0x258A:0x0150`
device with keyboard, mouse, consumer-control, system-control, and
vendor-defined HID collections. Its Windows product description is generic.
In the installed catalog, `0x0150` appears as a wireless receiver ID in the
RK A70 profile, while the local S98 profiles use other profile IDs. Public S98
hardware inventories also report `0x258A:0x0150`, which shows that this USB ID
alone is not enough to distinguish the keyboard model. See this
[S98 HID inventory example](https://gist.github.com/andrewbt/10e59b562963200c80017babd2434947).

Keydeck therefore reports an exact model only when the USB product name or a
direct catalog product ID gives one. A receiver ID or generic product name is
shown as an ambiguous match, and the user can choose a profile to view its
layout. Keydeck does not send a guessed feature request to resolve the model.

## Device access boundary

The app uses WebHID's authorized-device enumeration, connect/disconnect events,
and the explicit device chooser to inspect descriptors. It never calls
`HIDDevice.open()`, `receiveFeatureReport()`, `sendFeatureReport()`, or
`sendReport()`. No keyboard settings, macros, images, or firmware are sent.
The profile editor remains local data until a future protocol implementation
can be matched to a specific hardware variant.

The official [RK web configurator](https://drive.rkgaming.com/) is a useful
behavioral reference for browser-based configuration. S98 screen, knob, and
tri-mode product features in Keydeck are based on RK's
[S98 product page](https://rkgamingstore.com/products/s98-wireless-mechanical-keyboard).
The third-party [KludgeKnight project](https://github.com/vinc3m1/kludgeknight)
documents keymap writes that replace the complete onboard map; Keydeck does not
reuse its source code or send those writes.
