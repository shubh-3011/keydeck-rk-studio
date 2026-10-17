# RK Keyboard Software static audit

This document records what can be established from the RK Keyboard Software
installed on the development PC. The work is offline and static: it examines
copies of the application files, profile data, resources, imports, and strings.
It does not execute the RK utility, open a keyboard HID interface, or send
reports to a device.

The audit is broader than the initial catalog pass, but it is not a complete
hardware protocol reverse engineering. The native driver contains several
device-family paths and hardware-write operations. The static profile-to-
handler rules are now documented, but the exact firmware revision for each
model, full command schemas, and a safe active identification request are not
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
| `Dev/01AF/Update.exe` | Version `1.0.2.2`, metadata identifies Sinowealth Ltd. and “8805PH Update Tool”; a `.upf` update package is next to it. This is evidence that this profile includes a separate update path, not a validated firmware image. |

The package snapshot contains 810 files (78,070,176 bytes). The exact
relative-path, size, and SHA-256 list is in
[`rk-installed-package-manifest.csv`](rk-installed-package-manifest.csv).
The statically imported PE entrypoints for the main UI/driver, updater,
installer helper, and uninstaller are in
[`rk-native-api-imports.md`](rk-native-api-imports.md). The import report
lists declared native APIs; it does not imply that each API executes on every
run or that every runtime call is known. Address-level IAT cross-references
for all 1,915 imports are in
[`rk-native-api-xrefs.csv`](rk-native-api-xrefs.csv). That CSV records direct
x86 `call [IAT]` sites, caller instructions that target import thunks,
import-forwarding `jmp [IAT]` sites, and other absolute IAT references found
in executable sections. Dynamically resolved API names and nearby literal
strings are separately recorded in
[`rk-dynamic-api-targets.csv`](rk-dynamic-api-targets.csv). These are static
byte/address-level references, not a function-level call graph or a record of
executed system calls.

The static profile selector for every configured model is captured in
[`rk-profile-driver-family-map.csv`](rk-profile-driver-family-map.csv). It
records profile code/name, USB IDs, raw `Fw` and `Psd` values, wireless IDs,
and the handler selected by the audited binary's `Fw` branch. It is a
software-catalog mapping, not physical-device validation.

The package-wide extension census is 295 PNG, 284 TXT, 190 INI, 22 XML, 4
BMP, 4 TTF, 3 EXE, 2 DLL, 2 GIF, 1 DAT, 1 ICO, and 1 SKN file, plus one UPF
firmware package. Each of the seven UI localization XML files contains 247
leaf keys with the same tag set. `Text/Japanese/text.xml` is malformed because
its opening `<config>` is closed as `</Config>`; this prevents strict XML
parsing, but it does not indicate a missing `tc_screen1` key. The English file
was used for the feature-label inventory; the other language files were
compared by key and value counts. The manifest covers all remaining assets,
but this static pass has not assigned a semantic meaning to every individual
image, animation frame, skin, or font.

The app's resource paths form this local data graph:

| Resource path or pattern | Role evidenced by code, strings, or profile data |
| --- | --- |
| `Cfg.ini`, `lang.ini` | Global models, defaults, and language selection. |
| `Dev/%04X/KB.ini` | Per-model capability, layout, layer, display, firmware, LED, and wireless fields. |
| `Text/<language>/text.xml` | UI labels and messages; Japanese XML currently has a case-mismatched root closing tag, while the leaf-key set matches the other locales. |
| `Dev/{en,Japanese,Korean,sc,tw}/led.xml`; selected `Dev/<profile>/{en,sc}/led.xml` | Five generic localized LED-name resources have 60 leaf labels each. Ten profile-specific resources exist for `014E`, `015B`, `01C7`, `020B`, and `023D` in English and simplified Chinese; `014E` has three labels per locale and each other profile has 13. These labels correspond to profile LED slot counts, but do not define the meaning of the six values in each `LedOpt*` tuple or its device command. |
| `keyimg.png`, `kbled.png` | Model UI/keyboard illustration assets. |
| `Dev/%04X/screen.gif`, `%04X/screen_img%d.png`, `gif_delay.gcc` | Per-device screen GIF, decoded PNG frame cache (up to 512 stale frames are purged), and a four-byte playback-delay cache. |
| `Dev/%04X/ET/*`, `Dev/%04X/Cartoon/*`, global `ET/*` / `Cartoon/*` | Effect and animation assets with profile-specific and global fallbacks. |
| `%s\\%s.mck`, `MacroDir`, `MacroHasMsKey`, `%s mac.dct` | Per-macro storage, index/directory metadata, mouse-event marker, and concatenated macro records. Native code reads/writes `0x342`-byte records; `.mck` saves rotate bytes right by two bits and imports rotate them left by two. |
| `audio.dct` | Local `0x24`-byte audio-visualization configuration record; its exact parameter-to-UI mapping is not decoded. |
| `%CSIDL_PERSONAL%\\Log.txt` | Runtime debug log; initialized by `FUN_0040CAA0` and appended by `FUN_0040C9F0`. |
| `%sOther\\%04X_%04X\\start.exe` | A reachable `CreateProcessW` path constructs an optional per-device helper path from profile VID/PID. The external helper binary and its behavior are not in this package snapshot. |
| `Dev/%04X/Update.exe`, `update_version.xml` | Per-profile updater and software-update manifest path. The main app reads optional `UpdateURL` from `Cfg.ini`; otherwise it uses `http://www.rkgaming.com/Work/Update-Single/` or `.../Update-RGB/`, adds `update_version.xml?timestamp=%x`, and calls `URLDownloadToFileW` at thunk callsite `0x403DFB` after clearing the URL cache. Payload URLs depend on runtime XML/config. No download was performed. |

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

The driver initializes 188 named model rows from the configured PID list.
For each profile code, it opens `Dev/<code>/KB.ini`, reads that profile's VID,
screen flag, firmware/device-type fields, and optional wireless VID/PID, and
falls back to the configured default VID when the profile has no override.
An additional `01C7` profile directory has no configured model row. The
device-change path parses Windows HID interface paths, checks whether a
profile matches, and schedules follow-up scans. The matcher compares USB IDs
and HID usage/report-capability criteria before selecting a driver family:
the 125 `Fw=0` rows route to `CDevRKKB`, and the 63 nonzero-`Fw` rows route to
the G5 wrapper. This is the static selection rule in this installed build;
it does not validate which firmware revision a physical model runs.

`FUN_004155C0` applies different descriptor criteria by profile family. For
`Fw=0`, the inspected branch accepts a vendor-defined usage-page/report
pattern (`FF00`/usage 1 with report marker `0x41`) or a consumer-usage
alternative. For nonzero `Fw`, it accepts the inspected `FF00`/`FF02`
usage/report pattern (`0x208`) or a consumer-usage alternative. Exact matching
still depends on the full descriptor and the branch's other fields; this is
not enough to safely identify every firmware revision.

Wireless IDs have a separate classifier in `FUN_004474D0`. It recognizes
hardcoded pairs `3554:FA09` and `05AC:024F` as class 1, and
`258A:0030`, `258A:0148`, `258A:0150`, and `258A:01BB` as class 2, then checks
the profile table's wireless VID/PID columns for further class-2 matches. A
global-option branch also recognizes `1480:6461` as class 3. For recognized
special IDs, the device-change path skips the ordinary direct-profile ID
loop and gates an online/wireless scan. In the seven catalog profiles with
wireless IDs, the pairs are `258A:0150` (A70), `258A:01BB` (M100 and R98Pro),
`3554:FA09` (M70 DE/FR), and `258A:0233` (X87). The hardcoded M70 pair is
class 1; the other listed profile pairs are class 2. This is evidence of
special matching behavior, not proof that every receiver is an RK keyboard.

The wireless/Bluetooth path compares each profile's six-byte `Psd` value,
VID/PID, and nonzero `Fw` state before it can instantiate the `3632` handler.
Those bytes are stored in profile rows. Their meaning and provenance, the
full online transition sequence, and hardware behavior remain unresolved.
The catalog has 63 profiles with `Psd` values but only 58 unique signatures.
Three signatures are shared across variants: `0A 00 00 00 00 06` (F75 wired
and three-mode), `03 00 00 00 00 6E` (R65 RGB wired and non-wireless), and
`0A 00 00 00 00 22` (four R98Pro regional/variant profiles). The matcher
returns the first exact match in configured PID order, so those bytes alone
do not uniquely identify every model. The eight S98 `Psd` values in this
catalog are unique, though that does not validate the classifier against a
physical keyboard.

The Ghidra listing gives this initial function-level map. The `FUN_` names
are auto-generated names, not original RK symbols:

| Function | Static behavior observed |
| --- | --- |
| `FUN_004164b0` → `FUN_00416570` | Enumerate HID interfaces with SetupAPI, open an interface, collect attributes and report capabilities, then record descriptor metadata. |
| `FUN_00447090` | Clear and repopulate the main device table by invoking HID enumeration. |
| `FUN_00447210` | Load model VID/PID, screen, firmware/device-type, and wireless IDs from per-model `KB.ini` files. |
| `FUN_00447591` | Handle device-change paths, match IDs, and schedule follow-up device detection. |
| `FUN_004155C0` | Match profile VID/PID and HID usage/report capabilities; route `Fw=0` profiles to RKKB and nonzero-`Fw` profiles to G5. |
| `FUN_004474D0` | Classify known wireless IDs and profile wireless VID/PID pairs before the online/wireless scan. |
| `FUN_00415900` | Compare wireless profile VID/PID, nonzero-`Fw`, and six-byte `Psd` data before constructing the 3632 handler. |
| `FUN_0040f700` | G5 feature-report transport, 520-byte reports and 512-byte payload chunks. A read operation first sends a feature report, then calls `HidD_GetFeature`. |
| `FUN_00412b10` | G5 screen/page transfer path with chunking, acknowledgements, optional alternating-byte checksum/complement, retries, progress, and cancellation. |
| `FUN_0040d7e0` | Separate 3632 transport with 20-byte packets and 14-byte data chunks plus checksum/retry handling. |
| `FUN_00413220` | RKKB 65-byte feature-report writer with up to 62 payload bytes. |
| `FUN_00411b90` | Shared G5/3632 settings orchestrator for matrix layers, macros, lighting, RGB tables, and game/color groups. |
| `FUN_00411260` | Key data mapping across four layers of 132 positions. |
| `FUN_00411700`, `FUN_00411900` | Two settings packers. Embedded logs label debounce, tap, and sleep fields at different indices (`Cfg[2]/[8]/[9]` in one path; `Cfg[3]/[22]/[24]` in another), so record layouts vary by path/version. |
| `FUN_004513B0` | Candidate profile initialization path; reads `DebounceUI`, `MacroBufferNum`, `RGBIndex`, `MusicRGBIndex`, `ShowSleepTime`, and LED mask/config options into runtime state. |

The main executable's complete PE import table contains 672 imported entries
across 21 DLLs. The updater contains 618 entries across 19 DLLs. The detailed
inventory also includes installer and uninstaller components. Imports show
that the main executable declares `URLDownloadToFileW` and
`DeleteUrlCacheEntryW`, but no WinHTTP or Winsock functions. The updater
declares serial communication APIs (`SetCommMask`, `Get/SetCommState`,
`SetCommTimeouts`, `WaitCommEvent`, `ClearCommError`) as well as HID APIs.
Its generic serial-open routine at `0x00404E60` opens the supplied path with
read/write access and overlapped I/O, then sets a communication mask (`0x81`),
applies a caller-populated DCB, and sets timeouts. `0x00405170` waits for
communication events and performs overlapped reads with error/status checks;
`0x00405370` handles overlapped event completion/cancellation; and
`0x00405430` performs an overlapped read, checks/clears communication errors,
and forwards received bytes to an internal queue/callback. The write worker at
`0x00405640` sends queued bytes through `WriteFile` and checks completion.
The call chain is `FUN_00407E00` state-machine case `0xF` →
`FUN_004091B0` → `FUN_00404E60`. It passes a path and baud rate, with 8 data
bits, no parity, and one stop bit. Embedded class strings identify a UART
update-tool code path. This proves the updater contains a reachable serial
transport setup path, but not that it serves the same keyboard workflow as the
HID path. The exact keyboard mode that enters it and the serial command bytes
are unresolved. See
[`rk-native-api-imports.md`](rk-native-api-imports.md) for every statically
imported entrypoint.

Other updater file-call references were classified where decompilation made
their roles clear. HID interface opens occur in `FUN_00406730`,
`FUN_00406900`, `FUN_00409A50`, and `FUN_0040CFC0`. The `DeleteFileW` sites
`0x00425A8D`/`0x00426163` are MFC autosave cleanup, and `CopyFileW` at
`0x0040EC85` copies an OLE file medium. `SetFilePointerEx` references occur
in CRT seek helpers. The firmware chooser's path reaches CRT file I/O rather
than a direct `ReadFile` import: `FUN_0040C2F0` calls `FUN_0040A940`, which
opens the selected package for binary reading, parses metadata/length/version
fields, seeks through payload sections, and reads them into memory; later
`FUN_0040BB10` copies loaded payload data into the updater's HID transfer
buffer. This is host-to-device update staging evidence, not device-to-host
firmware dumping. The parser's mode branches and partial section mapping are
described below; the bundled file's declared lengths are inconsistent with
its actual size, and no successful parse was observed.

### Installer and uninstaller components

`InitSetup.dll` is an x86 setup helper with one `SetupInit` export (file
version `1.0.0.2`). Its static code checks a supplied path, recursively
enumerates descendants, normalizes file attributes, deletes files, and removes
nested directories while leaving the passed root directory. Its external
caller and argument are unresolved. `unins000.dat` contains a
`{localappdata}/RKKB` path, but the analyzed files do not prove that this
path is passed to `SetupInit`.

`uninstall.dll` has no exports and contains icon/bitmap resources; its
imports do not show file, registry, service, or device operations. The
uninstaller `unins000.exe` is an Inno Setup 5.3.4 engine. The installed
`unins000.dat` log records the Program Files tree, `%LOCALAPPDATA%/RKKB`,
Start Menu and Desktop shortcuts, and the RK uninstall registry entry. Its
executable imports generic file/registry/process/shell functions, but no HID
or SetupAPI DLL. The log also records custom uninstall callbacks and the
`InitSetup.dll` reference; the callback target and order are unresolved, so
the log does not establish whether uninstall deletes runtime data under
`%LOCALAPPDATA%/RKKB`. These components were inspected statically and were
not executed.

The IAT byte scan found direct-import calls, calls routed through import
thunks, and import-forwarding thunks in executable sections:

| Binary | Static import entries | `call [IAT]` sites | Calls through import thunks | `jmp [IAT]` thunks |
| --- | ---: | ---: | ---: |
| `DeviceDriver.exe` | 672 | 6,479 | 1,174 | 673 |
| `Dev/01AF/Update.exe` | 618 | 7,438 | 635 | 619 |
| `InitSetup.dll` | 76 | 151 | 77 | 76 |
| `uninstall.dll` | 30 | 34 | 32 | 30 |
| `unins000.exe` | 519 | 519 | 2,710 | 536 |

The CSV preserves the individual addresses, including calls to imported file,
registry, UI, HID, audio, graphics, timing, thread, and network APIs. Import
thunks and repeated references inflate raw counts; these figures do not equal
unique source-level operations or runtime executions. Windows syscalls made
inside imported APIs and driver stacks are outside this static user-mode PE
scan. Dynamic targets in the updater are mostly compatibility/framework APIs
such as transacted file/registry operations, task dialogs, DWM/theme functions,
and file-system helpers; literal strings are evidence for candidate names,
not proof that the branch executes.

The five analyzed PEs do not import `ntdll.dll`, and no plausible direct
`sysenter` or `int 0x2e` wrapper was identified in inspected code. A byte scan
reported two `0F 05` patterns in `DeviceDriver.exe`, but both are inside data
and padding rather than executable instruction paths. This is not a runtime
system-call trace and cannot rule out transitions inside imported Windows
libraries, dynamically loaded modules, COM servers, or device drivers. COM
methods reached through interface vtables, unresolved dynamic function
pointers, and kernel-level calls remain outside the import/xref inventory.

Targeted callsite inspection narrowed several potentially ambiguous imports:
the main app's `SetWindowsHookExW` references use thread-scoped CBT,
MSGFILTER, and mouse hooks; the inspected updater sites likewise use UI-hook
IDs, not `WH_KEYBOARD` or `WH_KEYBOARD_LL`. This does not prove the absence of
all input observation, since key-state APIs are also imported and runtime
branches are unknown. The optional `CreateProcessW` path may launch the
external per-device `Other\\<VID>_<PID>\\start.exe` helper when present.
No Service Control Manager APIs were found. `unins000.exe` imports
`DeviceIoControl`, but its one inspected call passes `FSCTL_SET_COMPRESSION`
(`0x9C040`) with a file-compression input on a file handle; it is not a
keyboard/USB IOCTL. Its `ExitWindowsEx` import has a callsite, but static
analysis does not establish that the uninstall flow invokes that branch.

The `HidD_SetFeature` references found in the selected DeviceDriver analysis
occur at `0x40F14D`, `0x40F87F`, `0x40FBBE`, `0x40FE01`, `0x410062`,
`0x4104EF`, `0x412D3F`, and `0x4132F6`. The corresponding selected
`HidD_GetFeature` references are at `0x40F1A5`, `0x40F8F1`, `0x40FC19`,
`0x40FE5C`, `0x4100C1`, and `0x41054E`. These are static callsite addresses
inside `DeviceDriver.exe`, not verified commands and not safe replay data.
The call pairs at `0x40FE01`/`0x40FE5C` implement the two-byte `GetPower`
response (`0x87`); `0x410062`/`0x4100C1` belong to `GetRealData` (`0x88`),
which reads a caller-requested response length in 512-byte chunks. Both paths
send a feature request before `HidD_GetFeature`.

Additional UI and persistence paths have candidate function starts inferred
from call references, strings, and code boundaries (medium confidence):
`0x403270` update callbacks; `0x403E20` update worker; `0x40DD60`
`WriteMacroData`; `0x42CC80` macro creation and magic validation; `0x42D1F0`
macro file open/read validation; `0x42D960` macro export; `0x42E320` dirty
macro flush; and `0x45A310` macro save. Audio visualization configuration
and processing candidates include `0x43BEE0` and `0x438810`; the confirmed
WASAPI capture path is at `0x43C780` (details below). `0x412890` handles
screen GIF parameters, and `0x4663C0` is a
screen burn workflow that passes frame count/timing and supports cancel/retry.
These candidates are not original symbols; the embedded PDB path refers to a
missing PDB, so type and original method names are unavailable.

Further decompilation confirms separate local persistence paths. `FUN_00428600`
reads or writes fixed `0x342`-byte `.rkm` records. `FUN_00459FC0` builds a
record with magic `0xFAFB88A0`, a timestamp, and fields at offsets `0x0c`,
`0x14`, `0x68`, and `0x6a`; `FUN_0045A310` concatenates eligible records into
`mac.dct` without a per-record transform or file header. A different `.mck`
dirty-save path (`FUN_0042E320`) rotates each byte right by two bits before
writing; its paired import (`FUN_0042E480`) rotates left by two and checks the
decoded record magic. The `.mck` export path (`FUN_0042D960`) copies an
internal file. The fixed record size and transform are known, but the full
macro event schema is not decoded.

Screen artwork is decoded from each device's `screen.gif` into cached
`screen_img%d.png` frames by `FUN_0046C9F0`; it can delete up to 512 old frame
files before saving the new cache. `FUN_0046D900` regenerates PNG frames.
`FUN_0046ACC0` and `FUN_0046ADC0` read/write `gif_delay.gcc` as four bytes.
These are local file operations. The debug log path is initialized as
`%CSIDL_PERSONAL%/Log.txt` by `FUN_0040CAA0` and appended by `FUN_0040C9F0`.
`FUN_00403170` writes the selected `LangIndex` to `lang.ini`; MFC profile
wrappers can write to INI or registry storage depending on the active profile
mode. Audio paths read a text configuration into an in-memory matrix
(`FUN_0043BEE0`), build an audio-visualization structure (`FUN_00438810`), and
read/write the `0x24`-byte `audio.dct`. The loopback acquisition/capture
lifecycle is implemented separately at `FUN_0043C780`, described below; the
exact relationship between these settings and the resulting music packets is
still unresolved.

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

The HID callsite report and targeted decompilation expose several additional
paths. Every path below that calls `HidD_SetFeature` is an active command path;
none was invoked during this audit.

| Routine | Static behavior and evidence | Limits |
| --- | --- | --- |
| `FUN_0040f030` | Scans candidate screen-device descriptors, opens matching handles, sends report ID `9` / command `0x82`, reads six bytes, then compares them with the keyboard profile's six-byte `Psd`. Its log says “Found screen dev, read psd now.” | This is a descriptor-matching transaction, not a passive descriptor read. The data's origin and exact selection path remain open. |
| `FUN_004103e0` | A helper logs `GetPassword failed`, uses command `0x82`, and handles a caller-supplied response length in 512-byte chunks through the G5 feature-report path. | The caller, exact payload meaning, and reason for the “password” label are not recovered. |
| `FUN_0040fd10` | `GetPower` command `0x87`; sends a feature request, reads the response, and returns two bytes. | The meaning and units of the two bytes are unknown. |
| `FUN_00410045` | `GetRealData` command `0x88`; sends a request and copies caller-requested response bytes from up to 512-byte feature chunks. | Its decompiler output has an instruction-overlap warning; caller and data semantics are unresolved. It is not evidence of firmware-memory access. |
| `FUN_0040f600`, `FUN_004131c0` | Connection checks call `HidD_GetAttributes` on an existing handle, or `CreateFileW` and immediately `CloseHandle` on a stored device path. | These checks establish openability/handle state, not the exact keyboard model or its firmware. |
| `FUN_00416740` | Descriptor processing calls `HidP_GetSpecificButtonCaps` and `HidP_GetSpecificValueCaps` for input, output, and feature report types. | It examines HID capabilities; no device feature report is sent in this routine. |

The central settings path exposes the order of several save flows. The
3632-facing `FUN_0040e690` wrapper checks a busy flag, waits 200 ms, then calls
the shared `FUN_00411b90` orchestrator. The orchestrator branches to G5
`FUN_0040f700` or the 3632 routines `FUN_0040d7e0`/`FUN_0040dd60` based on
the device object. Depending on dirty flags, it serializes key matrices and
writes selected layers, serializes macro data, reads then modifies and writes
the lighting configuration, sends a custom LED RGB table, and writes game/color
groups. Its log strings distinguish `SetMatrix`, `SetMacro`, `SetLED`,
`SetLedRgbTab`, and `SetGame` failures. This gives a feature-to-path map, but
the decompiler output does not fully recover the meaning of each matrix byte,
all flag bits, or every caller's UI action.

The UI labels and static call paths support this more specific feature map:

| Feature | Native operation path observed | Limits |
| --- | --- | --- |
| Keymaps and layers | `FUN_00411260` maps four 132-position layers; dirty layers flow through `FUN_0040F9C0`. G5 uses `FUN_0040F700` command `3`; 3632 uses `FUN_0040D7E0` command `1`. | Key-record translation and macro-buffer ID flow are partly recovered below. Exact command payload argument meaning and some profile slot semantics remain unresolved. |
| Macros | Apply-setting associates macro-buffer IDs with mapped keys, then sends dirty macro data through G5 command `5` or the 3632 macro path `FUN_0040DD60`. | 3632 command mapping and macro event meaning are incomplete. |
| Lighting and colors | `FUN_0040FAD0` obtains LED/config data; packers `FUN_00411700`/`FUN_00411900` feed G5 command `4` or 3632 command `4`. RGB slot tables use `FUN_004101B0` (G5 command `10`, 3632 command `9`); color groups use G5 command `6` or 3632 command `2`. | The `FUN_0040FAD0` read path sends command `0x84` through `HidD_SetFeature` before `HidD_GetFeature`; this is not a passive probe. RGB values are logged by `FUN_0040CD70`, which is a debug formatter and does not transform the buffer. Slot and tuple semantics remain incomplete. |
| Audio-reactive data | `FUN_0043C780` captures the default render endpoint with WASAPI loopback and computes visualization bands; separate `FUN_00413340` sends music data in RKKB report chunks through `FUN_00413220`. | DSP parameter-to-UI mapping and data-format meaning remain incomplete. Neither capture nor HID transmit was run. |
| Screen and GIFs | Screen parameter command `0x0B`, GIF parameter command `0x0D`, and page/frame command `0x0C`; the UI decodes `screen.gif` frames into PNG cache files. | Exact frame field map, delay units, and model-to-transport mapping remain unresolved. These command paths write to the keyboard. |
| Settings and reset | Packets include debounce, tap, and sleep fields. `FUN_004102D0` sends reset command `0x11`; `FUN_00411B90` also has a reset-command branch. | UI warns reset/factory restore clears keyboard data; exact button-to-command dispatch is not mapped. |
| Software and firmware updates | Main UI software update uses `URLDownloadToFileW`; the per-profile `Update.exe` stages `.upf` data for HID transfer. | MFU section-B/C paths perform bounded readback comparisons after writes; a full-flash dump/save-to-host path was not found. |

### Lighting payload details

The static `ApplySetting` path begins with a dirty-flag mask. For the
3632-facing wrapper `FUN_0040e690`, the apply operation is gated by the
instance busy flag at offset `+0x260`, waits 200 ms, and enters
`FUN_00411b90`. That common routine chooses a G5 path through `FUN_0040f700`
or 3632 paths through the function pointer at object offset `+0x94` and the
helpers `FUN_0040d7e0`/`FUN_0040dd60`. These are static control-flow facts;
the device was not connected by the analysis.

The lighting configuration read helper `FUN_0040fad0` requests G5 command
`0x84` or 3632 command `0x44`, and reads `0x80` bytes. Its G5 response is
accepted only when the final two bytes are `0x5A, 0xA5`. Applying LED config
uses command `4`, with the packer selected by firmware value: `FUN_00411700`
for firmware value `2`, otherwise `FUN_00411900`. The following source and
output byte offsets were traced statically:

| Packer | Output field | Source/evidence | Confidence and open meaning |
| --- | --- | --- | --- |
| `FUN_00411700` | `+2` | Configuration `+0x3E02`; also logged as debounce | Strong mapping; allowed-value mapping to user-visible timing remains incomplete. |
| `FUN_00411900` | `+3` | Configuration `+0x3E02`; also logged as debounce | Strong mapping; allowed-value mapping to user-visible timing remains incomplete. |
| `FUN_00411700` | `+8` | Configuration `+0x3E08`; logged as tap setting | Strong mapping; exact UI labels and units unresolved. |
| `FUN_00411900` | `+0x16` | Configuration `+0x3E08`; logged as tap setting | Strong mapping; exact UI labels and units unresolved. |
| `FUN_00411700` | `+9` | Configuration `+0x3E14`; logged as sleep setting | Strong mapping; the zeroing condition and units need more caller/UI tracing. |
| `FUN_00411900` | `+0x18` | Configuration `+0x3E14`; logged as sleep setting | Strong mapping; the zeroing condition and units need more caller/UI tracing. |

The packers translate debounce and sleep settings through lookup tables.
`FUN_00411700` zeroes the tap byte when configuration `+0x3E04` is nonzero.
`FUN_00411900` also sets output `+9` from a selected-profile equality test,
`+0xA` from the profile row's first byte except for one special row, `+0xB`
from configuration `+0x25C0 + 0x20`, and `+0x1B` when configuration
`+0x3E20` is zero; `+0x38` and `+0x39` are initialized to `0xFF`. The source
and selection mechanics are known, but labels and behavioral meaning are not.

The two packers encode their mode/item data differently. `FUN_00411900`
iterates runtime rows at configuration `+0x214C + i*0x30`; mode/index is
looked up from `+0x2144`, with nibble inputs at `+0x2140`, `+0x214C`, and
`+0x216C`. `FUN_00411700` uses output `+0x21` for the profile-row byte
(except the special row), `+0x22..+0x24` for selected-mode data, and
`+0x53+2i`/`+0x54+2i` for item pairs. These offsets are a recovered binary
layout, not names for undocumented controls.

### Keymap and macro mapping details

`FUN_00411260` consumes four layers from a runtime map object at `+0x38`.
Each layer contains 132 records with a 16-byte stride (`0x840` bytes per
layer). For each nonempty record (DWORD at `+0` is nonzero), it calls a driver
virtual method at vtable offset `+0x60` to translate the record, then uses a
byte mapping table at `0x616998 + entryOffset` to select an output slot. The
translated DWORD is stored in that slot; return value `-1` and destination
slots above `0x83` are rejected. The table/record relationship and the full
semantic meaning of the translated DWORD remain incomplete. The packed
output has 132 DWORDs (`0x210` bytes) per layer and four layers (`0x840` bytes)
in total for a 132-key profile.

Records with tag byte `+3 == 5` take a macro path: their DWORD at `+8` is
matched to macro nodes, a sequential macro-buffer ID is assigned, and a
serializer is called through vtable offset `+0x64`. The mapped matrix DWORD
contains `(bufferID - 1)` in its high byte. The record contains other fields
used by the virtual translator, but their meanings and all translated DWORD
bits remain unresolved.

The keymap branch in `FUN_00411B90` runs when apply flag bit 0 is set. The
map object's dirty-layer mask at `+0x30` selects layers; its excluded/current
layer index is at `+0x34`. `FUN_00411B50` scans 132 entries for macro tags.
If a dirty layer references macros, the worker can add other macro-containing
layers to the dirty mask, then sends macro data only when at least one macro
is present. It serializes all four layers and calls `FUN_0040F9C0` for each
selected layer.

For G5, `FUN_0040F9C0` passes the mapped matrix length as profile field
`+0xB5 * 4` (528 bytes for 132 keys), report ID from device-object byte
`+0x2D0`, and layer index as the option. `FUN_0040F700` command `3` divides
the payload into 512- and 16-byte chunks, sets packet count 2 and indices 0/1,
and uses a 25 ms inter-report delay. The 3632 path dispatches command `1`.
This establishes the transport length and layer option for the inspected
profile path; it does not define every DWORD field or profile's wiring map.

### Audio capture path

`FUN_0043C780` statically resolves to a WASAPI loopback capture routine. It
creates an `IMMDeviceEnumerator`, registers endpoint notifications, obtains
the default render/console endpoint, activates an `IAudioClient`, reads the
mix format, and initializes capture with flag `0x20000`
(`AUDCLNT_STREAMFLAGS_LOOPBACK`). It obtains `IAudioCaptureClient`, polls
packet size, reads and releases audio buffers, converts PCM to floating-point
and reduces it to 24 visualization bands, then exits on cancellation/event.
The audio processing path therefore exists in the native software; this does
not show that it was started in this audit or that audio was captured.

The separate `FUN_00413340`/`FUN_00413220` path sends music data through
65-byte RKKB feature reports, using a leading `0` or `[6, 0]` selected by the
RGB flag. It is an active keyboard-write path and was not invoked. The exact
relationship between the generated bands, the `audio.dct` settings, and the
transmitted format remains unresolved.

The catalog's `0174` profile is named RK S98RGB. It has `Fw=1`,
`Psd=6,0,0,0,0,3`, `ShowScreen=1`, `RGBScreen=1`, `MaxScreenFrame=60`,
`DataUnitSize=512`, screen dimensions `320x172`, and
`MusicRGBIndex=1,0,2`. This is direct evidence that this installed S98
profile configures screen and audio-reactive features, not proof those
features work on the connected keyboard. A different profile, `020F`, is
named RK A70 Keyboard; it has wireless VID/PID `0x258A:0x0150`,
`Psd=6,0,0,0,0,56`, and `MusicRGBIndex=1,0,2`, but no screen fields. The
profile distinction matters because Windows' observed USB ID `0x258A:0x0150`
matches the A70 receiver profile and is not by itself an S98 identity.

### Screen and GIF data paths

The UI-side screen workflow decodes `screen.gif` into cached
`screen_img%d.png` frame images using GDI+. A separate helper reads and writes
`gif_delay.gcc` as a four-byte DWORD; the unit and full range are not
established. The installed package includes screen-frame and playback
settings, but those local files do not show which exact byte values the
device expects.

The native driver sends screen parameters with G5 command `0x0B`, GIF
parameters with command `0x0D`, then transfers pages/frames through
`FUN_00412B10` command `0x0C`. The page helper carries up to 512 data bytes per
520-byte feature report. Its report ID normally comes from device-object
offset `+0x2D0`, with an alternate report-ID-9 branch. When the global
checksum flag at `0x611844` is set, it computes two alternating-byte sums,
complements them, and places them in the header. A feature-write failure is
retried four times with 100 ms delays; separate response/acknowledgment,
checksum, cancellation, progress, and outer-retry handling follow. A worker
around `0x466450` appears to manage progress and retry flow. The exact meaning
of all page header fields and response statuses remains unresolved. These are
screen-write paths and were not executed.

RGB-table updates use a buffer sized `(profile-count + 1) * 0x15` bytes and
the G5 command `10` or 3632 command `9`. `FUN_0040cd70` is only an optional
debug dumper gated by a logging flag: it formats input bytes but does not
modify the RGB buffer. RGB data is copied from six DWORD color values in
configuration rows beginning at `+0x2150` and selected through channel tables
at `DAT_00612B48`/`DAT_00612B49`/`DAT_00612B4A`; exact color-space/slot meaning
is unresolved. Dirty color-group updates serialize three bytes per group
using profile-row DWORD colors; G5 uses command `6`, while 3632 uses command
`2`. A reset/flag path may call a virtual function at `+0x38`, but its effect
is not resolved.

This is a function-level feature map, not a complete MFC button-handler map.
The PE contains ten dialog resources, but the app-looking templates are
generic `Dialog/New` shells (IDs 30721 and 30734) and the other inspected
dialog templates are empty MFC shells. RTTI names show dynamically created
forms/classes including `COemDrvDlg`, `CKeyDlg`, `CKeyFunPickDlg`, `CLedDlg`,
`CMacroDlg`, `CSettingDlg`, `CMenuDlg`, `CMenuSrDlg`, `CBurnScreenDlg`,
`CFrameEditView`, `CFrameView`, `CPickImageDlg`, `CPreviewDlg`, `CScreenDlg`,
`CScreenView`, `CClrPanelDlg`, `CColorBtnDlg`, `CCustomDlg`, `CKBColorDlg`,
`CTipsDlg`, and `CWelcomDlg`. MFC `WM_COMMAND` message-map records are
present—for example IDs `0x420E`–`0x4216` point to handlers at
`0x0049A660`, `0x0049CF85`, `0x00494C21`, `0x0049A475`, `0x00494C6C`,
`0x0049A5F9`, `0x0049A51A`, `0x00494D2E`, and `0x00497F8F`—but the available
static evidence does not reliably associate every map with a class, visible
control, or named feature. Another raw entry maps `0x4079` to `0x00504763`;
notification ID `0x40E3` codes 1 and 2 map to `0x0055700F` and `0x005570EE`.
Exact button-to-operation routes therefore remain open; these IDs and
addresses are leads, not semantic labels.

A separate `CDev3632::AccessData` helper accepts up to 512 bytes and splits
them into 20-byte packets with 14-byte payload chunks. It queues each frame,
waits for command-matched responses on most commands, and retries timeout or
CRC-class failures up to five times after the initial attempt. The frame
layout recovered from `FUN_0040d7e0` is:

| Byte(s) | 3632 frame field |
| --- | --- |
| 0 | `0x13` marker |
| 1 | command |
| 2 | total packet count |
| 3 | zero-based packet index |
| 4 | caller option in high nibble, payload length in low nibble |
| 5–18 | up to 14 payload bytes, zero padded |
| 19 | low byte of sum of bytes 0–18 |

The receiver checks response marker/status/command fields. Logs describe
`-2` as timeout and `-3` as CRC error, but the exact status and checksum
semantics remain unresolved. Wrapper/log context labels these 3632 commands:
SetMatrix `1`, SetGame `2`, SetMacro `3`, SetLED `4`, SetLedRgbTab `9`,
SendWeb `0x12`, and GetLED `0x44`. These labels do not define all payload
fields or prove how every profile maps to the family.

The three observed transport families have different framing:

| Family/helper | Static frame layout and behavior |
| --- | --- |
| G5 `FUN_0040f700` | 520-byte (`0x208`) feature reports: report ID, command, option, zero field, packet count, packet index, little-endian payload length, and up to 512 payload bytes. Its read operation first sends a `HidD_SetFeature` report and then calls `HidD_GetFeature`; retries and command matching are present, with no checksum check in this generic helper. |
| G5 page transfer `FUN_00412b10` | Command `0x0C`, up to 512 payload bytes per report, page ACK, retry, cancellation checks, and optional byte-sum/complement comparison. This is a screen/page transfer path, not a general read protocol. |
| 3632 `FUN_0040d7e0` | 20-byte frames shown above, 14-byte payload, additive checksum, response queue, and optional retries. |
| RKKB `FUN_00413220` | 65-byte reports: ID `10`, packet count, one-based packet index, and up to 62 payload bytes. The inspected helper uses `HidD_SetFeature`, an 8 ms inter-packet delay, and no ACK/checksum. |

G5 wrapper labels include SetMatrix `3`, SetMacro `5`, SetLED `4`, SetGame
`6`, SetLedRgbTab `10`, SendWeb `0x12`, GetLED `0x84`, GetPower `0x87`, and
GetRealData `0x88`. `GetPower` returns two bytes in the inspected helper. `GetRealData` uses 520-byte feature reports with up to 512 response bytes per chunk, but its caller, returned-data meaning, and any relationship to firmware memory are unresolved. Each chunk begins with a feature request before the read. RKKB music data uses a leading `0` byte or `[6, 0]`
depending on the RGB flag; the rest of that payload is not decoded. These are
three observed code paths, not a guarantee that every catalog profile maps
one-to-one to one of these classes.

The labels come from embedded logs and function context. They are useful
protocol leads, not a complete command schema: Ghidra generated addresses for
most functions, virtual calls obscure some callers, and the same utility has
multiple device classes. No buffer was sent to a keyboard to validate these
interpretations.

The separate `Dev/01AF/Update.exe` also imports SetupAPI and HID feature
report functions. `FUN_0040B770` uses a distinct `0x408`-byte
status/control report. Section B is coordinated by `FUN_00402B20` and written
by `FUN_00403290` in `0x802`-byte feature reports carrying up to `0x800` data
bytes (`HidD_SetFeature` callsite `0x00403505`). `FUN_00402FC0` then sends a
`05 52` request, reads `06 72` responses (`HidD_GetFeature` callsite
`0x0040308C`), and compares each response payload with the host buffer at
`0x005C5EFC`, up to its length at `0x005C5F04`. Section C is coordinated by
`FUN_00402CE0`, written by `FUN_00403570` (`HidD_SetFeature` callsite
`0x004036BD`), and verified by `FUN_004037D0`; its `HidD_GetFeature` callsite
is `0x0040389C`, and its host comparison buffer/length are at
`0x005C5EF8`/`0x005C5F00`. Both verifiers compare chunks of up to `0x800`
bytes in RAM. These are readback-verification paths within an update flow,
not an independent full-flash dump or save-to-host workflow. UI strings
include firmware version checks, CRC failures, device-type mismatch, and
USB/BLE update status.
The updater therefore has a separate firmware-transfer path; its report
fields and full `.upf` format have not been decoded. It was not run. The one
installed `.upf` package is 193,652 bytes; its header begins with `5A A5`
followed by the ASCII marker `BLESINO`, and includes VID `258A`, PID `01AF`,
and version text `V1.00`.

The updater's `FUN_0040A940` opens the selected path in binary-read mode and
scans for the byte signature `5A A5 BLESINO`; the supplied file matches at
offset zero. The second signature byte is `A5` (the decompiler displays it as
a signed `char` value of `-0x5b`). On a match the parser reads mode/metadata,
length values, and payload sections. Partial field decoding for this file:

| File offset | Static value | Interpretation and confidence |
| --- | --- | --- |
| `0x09` | `03` | Mode 3; selects the parser branch that stages sections A, B, and C. |
| `0x0A–0x10` | `KB0000\0` | Model/tag string; exact meaning is unknown. |
| `0x11–0x12` | `25 8A` → `0x258A` | VID, strongly supported by filename and decoded global. |
| `0x13–0x14` | `01 AF` → `0x01AF` | PID, strongly supported by filename and decoded global. |
| `0x1A–0x1F` | `V1.00\0` | Version string passed through the updater's string helper. |
| `0x2C–0x2F` | `F0 00 71 6D` → `0xF000716D` | Section A length as decoded by the parser's byte-order logic. |
| `0x30–0x33` | `00 00 A1 87` → `0x0000A187` (41,351) | Section B length. |
| `0x42–0x45` | zero | Section C length. |
| `0x80` | — | Absolute seek position before reading payload data. |

The parser reads these length fields as big-endian. Its mode branches are:
mode 0 reads A+B, mode 1 reads A, mode 2 reads B, and mode 3 reads A+B+C.
For this file, mode 3 is selected. Section B flows into
`FUN_00402b20` → `FUN_00403290`, a HID firmware-upgrade path that writes
chunks with `HidD_SetFeature`. Section C flows into
`FUN_00402ce0` → `FUN_00403570` and a comparison helper at `FUN_004037d0`,
labelled in UI strings as an MFU firmware upgrade. Section A is stored for
the main update object; its use by a BLE upgrade path is a strong data-flow
inference, while its final transport routine is unresolved.

The decoded section A length (`0xF000716D`) is impossible for a 193,652-byte
file (only 193,524 bytes follow offset `0x80`). The static path does not show
an explicit check against the file size before allocation/read. The code
selects the mode-3 branch, but because the updater was not run, we cannot say
whether later reads fail, the file is rejected, or this reflects a format or
version mismatch. Other `5A 5B` byte pairs in the file are not the recognized
signature. Do not treat this `.upf` as a validated or recoverable keyboard
firmware image.

The saved Ghidra analysis of the main driver contains 13,735 procedures and
3,838 defined strings. Existing decompilation reports target HID and SetupAPI
imports, selected device-family strings, and selected data structures; they
do not decompile all procedures. The PE import inventory is complete for the
listed static import tables. Across the five analyzed binaries, the scan found
127 `GetProcAddress`/`LoadLibrary*` callsites in four binaries: 47 in
`DeviceDriver.exe`, 54 in `Update.exe`, four in `InitSetup.dll`, and 22 in
`unins000.exe`. Twenty-one callsites have no nearby literal candidate. Many
recoverable names are Windows/MFC compatibility APIs (for example transacted
file/registry functions, DWM/theme helpers, and task dialogs), but candidate
strings do not prove argument flow or execution. Some targets are not
statically recoverable. COM vtable calls, other indirect calls, and exact
executed paths remain untraced.

The updater's static UI and call traces identify an `.upf` file chooser and
firmware burn flow, plus version/status/acknowledgment handling. Its section-B
and section-C update paths read back bounded chunks and compare them in RAM
with the selected host image after writing. No full-flash dump or save-to-host
path was found. Its imports of generic file APIs do not establish that
firmware bytes are copied from the device; no data-flow from a device response
into a firmware file was identified in the traced update routines.

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
still carry mapping tuples. Schema version 3 retains both counts and every
base mapping row.

There are 88 distinct non-comment `OPT` field names in the installed profile
set. Across all 189 profile files there are 6,506 `OPT` assignments, with no
duplicate option keys inside a profile. The field-by-field profile counts and
static key-literal coverage are in
[`rk-profile-option-field-inventory.csv`](rk-profile-option-field-inventory.csv).
The main binary has individual key-name references for 64 of the 88 fields;
no individual literals were found for `GaoshouKey1`, `GaoshouKey2`,
`ShowAutoDetect`, or `LedOpt1` through `LedOpt21`. A missing literal does not
prove a field is unused because generic/dynamic INI parsing may handle it.
LED slot presence is non-contiguous: 93 profiles have slots 1–21, 53 have
1–17 plus 19–20, 28 have 1–20, 10 have 1–19, four have 1–13, and one has
1–3. Keep the stored slot IDs; neither slot count nor localized labels prove
the tuple-to-command mapping. The profile corpus also contains `[KEY]`,
`[FN1]`, and `[FN2]` sections;
the installed set has 63 `[FN1]` sections and 17 `[FN2]` sections. Most `[KEY]`
rows contain four layout coordinates followed by additional mapping values.
The latter fields and the Fn rows are retained as raw integer tuples because
the mapping semantics have not been decoded. `LayerNum` is not equivalent to
the number of populated Fn sections: for example, profile `022F` declares
`LayerNum=4` but has only an `[FN1]` section.

The regenerated `models.json` uses schema version 3. A static comparison of
the generated JSON against all 189 installed `KB.ini` files found no
mismatches in `OPT` strings, raw `[KEY]`/`[FN1]`/`[FN2]` assignment tuples, or
six-value `LedOpt*` arrays. It retains 15,945 `[KEY]` rows, 2,278 `[FN1]`
rows, 603 `[FN2]` rows, and 3,765 six-value LED-option tuples. The named 188
profiles and the unregistered `01C7` profile are all represented; `01C7` is
under `unregisteredProfiles` and is not selectable as a verified named
model. Seven profiles contain wireless IDs, spanning four VID/PID pairs.
Tuple values are decoded into JSON integer/string arrays, so the data values
are preserved while source whitespace and lexical number formatting are not.
Profile-local English and Simplified Chinese LED labels are also retained in
`profileData.lightingLabels` for the five profiles that ship those files,
including unregistered `01C7`. The five generic locale LED dictionaries are
not assigned to a particular profile in the catalog. These label strings
document UI order; they do not establish the serialized LED command values.
The extractor does not copy the RK executable, firmware, or image assets.

The data in these files describes what the RK utility knows about a device.
It does not prove every value's hardware meaning, and Keydeck does not transmit
these values.

## UI and configuration workflows evidenced in the installed package

The English resource strings and model configuration fields expose these
feature groups. Availability varies by model, and the list describes the RK
utility rather than features already implemented by Keydeck.

The seven locale XMLs have the same 247 UI leaf keys; the Japanese file has a
case-mismatched root closing tag. The key groups include 33 macro labels, 43
advanced-settings/update labels, 29 status/layer/tap/reset messages, 21
screen controls, ten music controls plus ten audio-effect labels, and distinct
shortcut/action groups for media, mouse, browser, system, office, and
keyboard-input choices. Five generic LED locale XMLs have 60 labels each,
with ten additional model-localized LED XML files as described above.

| RK utility workflow | Evidence in package |
| --- | --- |
| Key remapping | Default/custom functions, key type, Windows shortcuts, key combinations, media, mouse buttons/actions, browser and system shortcuts, disable key, and per-key base/Fn mappings. |
| Layers and tap | Default, `FN1`, `FN2`, and tap labels; profiles may store `LayerNum`, `LayerMask`, and `TapRange`. |
| Macros | Record keyboard and mouse events; configure recording/default/fixed delays; insert events before/after; import/export; and cycle a fixed number of times, until key release, or until key press. Per-model `MacroBufferNum` appears in four profiles. |
| Lighting | 21 localized `tc_led_mode` labels, 20 alternate `tc_led` names, 19 `tc_eft` effect names, brightness/speed/color controls, custom lighting, per-profile `LedOpt*` six-value tuples, color-index arrays, defaults, and hardware/UI lighting options. The profile slot count (3, 13, 19, 20, or 21) does not establish which localized label maps to each slot. |
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
findings without touching hardware. The complete UI event flow, exact
model-to-firmware-revision mapping, and every device-family transaction have
not been reconstructed. No report capture or keyboard write has been
performed for this audit.

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

## Firmware readback assessment

The current Windows PnP inventory exposes the connected `0x258A:0x0150` unit
as a USB composite HID device and an `RK-S98RGB` Bluetooth LE device. Its USB
children are keyboard, mouse, consumer/system-control, and vendor-defined HID
interfaces. Windows exposes no matching USB mass-storage device, disk, or
volume from which a firmware file can be copied.

The only firmware-like update package in the installed RK package is
`Dev/01AF/KB_762_1_v258A_p01AF_F90_8818_V90.0f.1.00.upf` (193,652 bytes,
SHA-256 `e21c11e023247afc7fdbbe27548570240efa5b646147741d5354eecb3041b628`).
Its header identifies VID/PID `258A:01AF`, while Windows currently exposes
`258A:0150`; the receiver ID alone does not establish that the package matches
the firmware in the connected keyboard. The `.upf` is an updater input, not a
dump extracted from keyboard flash. Its header and some section fields are
partially decoded below, but a section length conflicts with the file size and
the package has not been validated.

Static updater paths show firmware selection/burning and short version/status
reads. The section-B and section-C verifiers read bounded update chunks into
RAM and compare them with the selected host image after a write. This is not a
demonstrated way to read and save the keyboard's existing firmware, and the
installed `.upf` declares section C as zero length. No full-flash dump or
save-to-file path was found. This does not prove that the bootloader has no
undocumented read command. The generic HID data path inspected for the native
driver sends a feature report before it calls `HidD_GetFeature`, so an
attempted “read” is not a passive USB capture. No keyboard feature report was
sent, no updater was launched, and no bootloader mode was entered. With the
evidence available, there is no demonstrated way to copy the running firmware
while leaving the keyboard unchanged.

## External references

- [REA reverse-engineering project](https://github.com/morluto/rea)
- [Ghidra releases](https://github.com/NationalSecurityAgency/ghidra/releases)
- [RK web configurator](https://drive.rkgaming.com/)
- [RK S98 product specifications](https://rkgamingstore.com/products/s98-wireless-mechanical-keyboard)
- [KludgeKnight](https://github.com/vinc3m1/kludgeknight), an independent
  community implementation. Keydeck does not reuse its source code or write
  its keymap protocol.
