# RK Keyboard Software static audit

This document records what can be established from the RK Keyboard Software
installed on the development PC. The work is offline and static: it examines
copies of the application files, profile data, resources, imports, and strings.
It does not execute the RK utility, open a keyboard HID interface, or send
reports to a device.

The audit is broader than the initial catalog pass, but it is not a complete
hardware protocol reverse engineering. The native driver contains several
device-family paths and hardware-write operations. Their full command schemas,
model-to-protocol mapping, and safe identification requests are still not
proven. Keydeck therefore remains descriptor-only and does not write settings,
lighting, macros, screen data, or firmware to a keyboard.

## Installed suite inventory

The installed `C:\Program Files (x86)\RK Keyboard Software` directory has
about 810 files (about 78 MB). It contains the main native UI/driver, an
installer setup DLL, uninstall components, profile data, skins, fonts,
localization, and a model-specific firmware updater and `.upf` image.

| Component | Static finding |
| --- | --- |
| `Cfg.ini` | App title `RK Keyboard`, version value `0x406`, default VID `0x258A`, supported PID list, languages, and 188 named `DevName` records. |
| `DeviceDriver.exe` | Native 32-bit Windows GUI PE, file/product version `1.0.6.8`, SHA-256 `C03F88BC4E2D78AA4392D7445B0FD62182DC824F97F5D5DB40BD009E547A9AB6`. |
| `Dev/*/KB.ini` | 189 model/profile configurations, including one profile folder (`01C7`) that has no matching `DevName` entry. |
| `Text/en/text.xml` | English UI labels and workflows for key mapping, Fn/tap, macro editing, lighting, sound-reactive effects, keyboard settings, screen animation, software updates, and firmware/reset actions. |
| `Dev/01AF/Update.exe` | Version `1.0.2.2`, metadata identifies Sinowealth Ltd. and “8805PH Update Tool”; a `.upf` firmware image is next to it. This is evidence that this profile includes a separate update path, not a decoded firmware format. |

The executable's native imports include SetupDi device enumeration, HID
attributes/capability queries, `HidD_GetFeature`, `HidD_SetFeature`, file read
and write functions, and URL download support. Extracted symbols and strings
include `CDevRKKB`, `CDevG5KB`, and `CDev3632` families; key matrix, macro, LED,
system-parameter, screen-page/frame, and firmware-update routines; and error
messages for feature reports. This establishes that the software has multiple
device implementations and writes to hardware. It does not by itself establish
the meaning or safety of a report.

### Ghidra traces of the native driver

Ghidra 12.1.4 analyzed a byte-identical working copy of `DeviceDriver.exe`.
The driver has imports for HID setup and feature reports. Its enumeration path
gets the HID interface GUID, enumerates device interfaces with SetupAPI, opens
each interface, obtains preparsed HID data and attributes, and reads top-level
capabilities plus button/value capability tables. The default `CreateFileW`
access mask in this path includes read/write access, although this code path
does not itself issue a feature report.

The driver initializes its model records from the configured PID list. For
each profile code, it opens `Dev/<code>/KB.ini`, reads that profile's VID,
screen flag, firmware/device-type fields, and optional wireless VID/PID, and
falls back to the configured default VID when the profile has no override.
The device-change path parses Windows HID interface paths, checks whether a
profile matches, and schedules follow-up scans. The matcher compares USB IDs
and additional HID usage/report-capability criteria before trying separate
`RKKB` and `G5KB` driver objects. This confirms automatic model detection is
data-driven by `Cfg.ini` and per-model profiles, rather than only a static
list compiled into the executable. The precise meaning of every table field
and its relationship to firmware revisions remains open.

The native code also has an online/Bluetooth path that compares six bytes of
device data with profile records and can instantiate the `3632` handler. This
is separate from the ordinary Windows HID interface scan; the exact data
source and complete transition logic remain unresolved.

The decompiled `CDevG5KB::AccessData` path confirms a 520-byte
(`0x208`) feature report. The observed buffer fields are:

| Offset | Static observation |
| --- | --- |
| 0 | report ID supplied by the caller |
| 1 | command value supplied by the caller |
| 2 | caller-supplied option byte |
| 3 | zeroed field in the inspected path |
| 4 | total packet count |
| 5 | packet index |
| 6–7 | current payload length, little-endian |
| 8–519 | payload area, up to 512 bytes |

The inspected function divides transfers into 512-byte pieces. Its operation
value `1` copies caller data into the report before `HidD_SetFeature`; value
`2` also performs `HidD_GetFeature` and copies the response back. The read path
therefore begins by sending a feature report too. It retries failed writes,
waits between attempts, and checks that the response command matches. These
observations explain why the clone must not issue a “harmless read” probe to
identify a model.

Additional named paths in the decompilation include `GetLED` (command `0x84`),
`GetPower` (`0x87`), a password path (`0x82`), and a `GetRealData` path
(`0x88`). A screen-descriptor check also sends report ID `9` with command
`0x82`, then reads and compares six descriptor bytes. A page-transfer helper
named `AccessData_Page` sends command `0x0c` through 520-byte reports, checks
acknowledgments, can compare CRC values, and retries pages. A separate
`CDevRKKB::WriteDevice` path builds 65-byte (`0x41`) feature reports with
report ID `10`, packet count/index, and up to 62 bytes of payload.

The central `CDevG5KB::ApplySetting` routine exposes the order of several
save flows. Depending on dirty flags, it serializes key matrices and writes
selected layers, serializes macro data, reads then modifies and writes the
lighting configuration, sends a custom LED RGB table, and writes game/color
groups. Its log strings distinguish `SetMatrix`, `SetMacro`, `SetLED`,
`SetLedRgbTab`, and `SetGame` failures. This gives a feature-to-path map, but
the decompiler output does not fully recover the meaning of each matrix byte,
all flag bits, or every caller's UI action.

A separate `CDev3632::AccessData` helper accepts at most 511 bytes and splits
them into 20-byte packet buffers with 14-byte payload chunks. It adds a
checksum byte, waits for responses on most commands, and retries timeout or
CRC failures. This is a distinct transport path from the 520-byte `G5KB`
feature reports. The `RKKB` music-data path uses the 65-byte feature report
writer. These are three observed code paths, not a guarantee that every
catalog profile maps one-to-one to one of these classes.

Those command labels come from embedded log strings and function context.
They are useful protocol leads, not a complete command map: Ghidra generated
addresses for most functions, virtual calls obscure some callers, and there
are multiple device classes. No buffer was sent to a keyboard to validate
these interpretations.

The separate `Dev/01AF/Update.exe` also imports SetupAPI and HID feature
report functions. Its decompiled update paths allocate and exchange reports
whose observed length is `0x408` bytes, and its UI strings include firmware
version checks, CRC failures, device-type mismatch, and USB/BLE update status.
The updater therefore has a separate firmware-transfer path; neither its
report fields nor the `.upf` file format have been decoded. It was not run.
The one installed `.upf` image is 193,652 bytes; its header begins with
`5A A5` followed by the ASCII marker `BLESINO`. The header contains byte
sequences consistent with VID `258A`, PID `01AF`, and version text `V1.00`,
but the payload structure is unknown.

REA's PE resource inspection of `DeviceDriver.exe` found 61 resources, including
10 dialog resources and 14 string-table resources. The strings and dialogs
corroborate the UI workflows listed below. They do not substitute for
understanding the native event handlers and device transactions.

## Profile database and catalog

The named model catalog has 188 profiles and 90 distinct visual key layouts.
Across those named records, 156 profiles list RGB backlighting and 15 list a
display. The display profiles describe 128×128, 240×135, 240×240, or 320×172
dimensions. The catalog also records one unregistered `01C7` profile separately
so it is available for audit without presenting it as a verified named model.
In 134 named profiles, `LayoutKeyNum` differs from the number of drawable key
rectangles. For example, `022F` declares 104 keys and has 102 drawable
rectangles; its two additional `[KEY]` rows have zero-sized rectangles but
still carry mapping tuples. Schema version 2 retains both counts and every
base mapping row.

There are 88 distinct non-comment `OPT` field names in the installed profile
set. The profile corpus also contains `[KEY]`, `[FN1]`, and `[FN2]` sections;
the installed set has 63 `[FN1]` sections and 17 `[FN2]` sections. Most `[KEY]`
rows contain four layout coordinates followed by additional mapping values.
The latter fields and the Fn rows are retained as raw integer tuples because
the mapping semantics have not been decoded. `LayerNum` is not equivalent to
the number of populated Fn sections: for example, profile `022F` declares
`LayerNum=4` but has only an `[FN1]` section.

The regenerated `models.json` uses schema version 2. Each named model retains
its drawable layout and capability summary, plus `profileData.options`, all
base key tuples, Fn-section tuples, and section names. LED slots include their
six-value tuples rather than only slot numbers. Wireless matching records both
the wireless VID and PID when present. The unregistered profile remains under
`unregisteredProfiles`; it is not added to the 188 selectable named models.
The extractor does not copy the RK executable, firmware, or image assets.

The data in these files describes what the RK utility knows about a device.
It does not prove every value's hardware meaning, and Keydeck does not transmit
these values.

## UI and configuration workflows evidenced in the installed package

The English resource strings and model configuration fields expose these
feature groups. Availability varies by model, and the list describes the RK
utility rather than features already implemented by Keydeck.

| RK utility workflow | Evidence in package |
| --- | --- |
| Key remapping | Default/custom functions, key type, Windows shortcuts, key combinations, media, mouse buttons/actions, browser and system shortcuts, disable key, and per-key base/Fn mappings. |
| Layers and tap | Default, `FN1`, `FN2`, and tap labels; profiles may store `LayerNum`, `LayerMask`, and `TapRange`. |
| Macros | Record keyboard and mouse events; configure recording/default/fixed delays; insert events before/after; import/export; and cycle a fixed number of times, until key release, or until key press. Per-model `MacroBufferNum` appears in four profiles. |
| Lighting | 21 general lighting labels, brightness/speed/color controls, custom lighting, per-model `LedOpt*` six-value tuples, color-index arrays, defaults, and hardware/UI lighting options. |
| Audio-reactive lighting | Music mode, gain, audio device, auto gain, monochrome/colorful choices, and ten effect slots. |
| Keyboard settings | Sleep and wireless sleep, automatic detection, debounce, office and gaming modes, Fn shortcuts, Windows/Mac layout, LED record, reset, and factory restore. |
| Screen / animation editor | Per-model screen dimensions and frame limits; image crop/zoom, layers, frame lists, add/import, apply-to-all, undo, playback interval, and screen preview. The UI says image transfer requires USB rather than wireless. |
| Updates | Software update and firmware detection/download/update prompts. The separate updater and `.upf` file are evidence of an update path; no firmware format or safe update procedure has been reverse engineered here. |

The utility includes destructive flows: its reset strings warn that reset or
factory restore clears keyboard data. Keydeck does not expose or invoke those
flows.

## What the native analysis establishes, and what remains open

The executable is native x86 rather than a .NET application. Its HID imports
and device-family strings indicate that model support is implemented through
multiple native classes. The local profiles provide extensive model-specific
configuration. Together, these establish the app's broad feature surface and
the shape of its data, but not a complete source-level explanation of every
mode or all 188 device paths.

Still unproven:

- The meaning of every field in the 520-byte HID feature reports and the
  request/response state machines.
- Which exact firmware/protocol revision pairs with every named profile.
- A read-only probe that safely distinguishes models when the USB descriptor
  is shared or generic.
- The byte-level encoding for keymaps, macros, lighting, screen transfers,
  gaming/debounce settings, reset, or firmware update.
- Whether a guessed or partially reconstructed write can leave a keyboard in
  a bad state.

The native driver was inspected with Ghidra against a byte-identical working
copy; REA was used for PE resource inspection. Static analysis advanced these
findings without touching hardware. The complete UI event flow,
model-to-protocol mapping, and every device-family transaction have not been
reconstructed. No report capture or keyboard write has been performed for
this audit.

## Device identification and safety boundary

The Windows PnP inventory on this PC exposes a composite `0x258A:0x0150`
device with keyboard, mouse, consumer-control, system-control, and
vendor-defined HID collections. Its product description is generic. The
installed profiles list `0x0150` as a receiver ID for at least one model, and
public S98 inventories also report `0x258A:0x0150`; this ID alone cannot prove
which model is connected. See this
[S98 HID inventory example](https://gist.github.com/andrewbt/10e59b562963200c80017babd2434947).

Keydeck only reads the browser-visible descriptor after device permission. It
does not open the HID device, receive feature reports, send reports, or replay
captured data. Exact product IDs and product names can identify some models;
shared receiver IDs remain ambiguous. Wireless profile matching now compares
both VID and PID when the profile supplies both. No model is guessed from a
feature-report probe.

## External references

- [REA reverse-engineering project](https://github.com/morluto/rea)
- [Ghidra releases](https://github.com/NationalSecurityAgency/ghidra/releases)
- [RK web configurator](https://drive.rkgaming.com/)
- [RK S98 product specifications](https://rkgamingstore.com/products/s98-wireless-mechanical-keyboard)
- [KludgeKnight](https://github.com/vinc3m1/kludgeknight), an independent
  community implementation. Keydeck does not reuse its source code or write
  its keymap protocol.
