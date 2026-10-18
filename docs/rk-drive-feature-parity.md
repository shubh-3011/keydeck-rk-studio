# RK Drive feature coverage in Keydeck

This crosswalk separates three things: fields statically declared by the
public RK Drive JavaScript, features represented in Keydeck's local editor,
and hardware behavior that remains unimplemented. The Drive snapshot records
seven JavaScript bundles, 177 keyboard connection descriptors across 96 labels,
two separate RK68 HE Bytech profiles, 20 legacy mouse descriptors, two CB75
mouse connection rows, and 96 RK-hosted image references (93 keyboard product
photos, two HE layout backgrounds, and one mouse photo). The HE profiles use a
UUID check in RK's web app; Keydeck uses only their VID/PID and HID usage for a
descriptor-level candidate and never reads the UUID. The public bundle's entry
hash is recorded in the [bundle manifest](rk-drive-js-manifest.csv) and the [research archive audit](https://github.com/shubh-3011/rk-keyboard-software-research/blob/main/docs/rk-drive-web-app-audit.md).
Keydeck derives model metadata; it does not redistribute the vendor scripts or
photos.

The app repository also includes source-free [keyboard](rk-drive-keyboard-catalog.csv),
[specialized keyboard profile](rk-drive-specialized-keyboard-profiles.csv),
[mouse](rk-drive-mouse-registry.csv), and [image reference](rk-drive-image-references.csv)
snapshots plus the [metadata extractor](../scripts/extract_rk_drive_catalog.py).

| RK Drive family | Keydeck coverage | Compatibility boundary |
| --- | --- | --- |
| Keyboard and mouse registry browsing | Search the Drive registry and separate HE profiles by model/chooser alias, VID:PID, HID usage, connection, protocol, layers, OS tables, and mouse profile flags; display product photos, HE layout backgrounds, connection-specific descriptors, lighting definitions, and declared CB75 features. | Shared wireless receiver IDs can identify several model labels. The mouse view is reference metadata; it does not implement DPI/performance controls or establish physical revision or protocol support. RK68 HE is a descriptor candidate because its UUID check is not replicated. Photos load directly from RK only while the catalog page is open; they are not redistributed. |
| Key mapping and layers | Local assignments across the installed profile's listed layers; JSON import/export. | Keydeck does not serialize or send RK keymap reports. Drive layer/table declarations remain separate from the 4.06 profile map. |
| Lighting | Keep 4.06 mode-slot preferences locally and inspect exact Drive effect names/declared control flags for a chosen Drive model label. | Drive effect names are not translated into 4.06 slot IDs or hardware payloads. |
| DKS, Toggle, Mod-Tap, SOCD, and Snap Tap | Save descriptive Keydeck-only local behavior drafts per key or profile. | This data has no vendor encoding, threshold units, model gate, or device output path. |
| Performance and magnetic-switch controls | Show raw profile values such as `DebounceUI`, `DebounceHW`, `TapRange`, `SpeedParam`, `LayerMask`, and `LayerNum`; keep user notes with the profile. | Values remain opaque. Keydeck does not call them milliseconds, polling rates, actuation travel, or Rapid Trigger settings. RK68 HE device feature bits and page gates are documented separately, but not implemented. |
| Macros | Keep the existing text sequence and add a structured local timeline with semantic key/mouse-button/delay steps and loop intent. | No keyboard capture, mouse capture, playback, transfer, or RK report mapping is implemented. Mouse actions are labels, not vendor codes. |
| TFT/smart display | Store an asset name, dimensions, display brightness preference, and clock note. | No GIF frame conversion, preview pipeline, playback, or screen transfer is implemented. |
| Mouse configuration and performance | Browse the public registry records and any declared image/feature metadata. | Keydeck does not implement DPI/performance editing, mouse-device communication, or configuration writes. See the [mouse audit](https://github.com/shubh-3011/rk-keyboard-software-research/blob/main/docs/rk-drive-feature-gate-and-mouse-audit-2026-10-18.md). |
| Device settings, reset, firmware, boot mode, and updates | These are documented as research surfaces where evidence exists. | Keydeck has no settings-write, reset, firmware, or boot-mode operation. Its device identification uses descriptors only. |

All new behavior and macro fields are stored as Keydeck profile data under the
`keydeck-local-draft-v1` schema marker. They are never treated as a ready-to-
write device configuration. The disabled **Write changes** button is retained.

## Research sources

- [Public RK Drive feature and keyboard catalog audit](https://github.com/shubh-3011/rk-keyboard-software-research/blob/main/docs/rk-drive-web-app-audit.md)
- [RK Drive feature-gate and mouse registry audit](https://github.com/shubh-3011/rk-keyboard-software-research/blob/main/docs/rk-drive-feature-gate-and-mouse-audit-2026-10-18.md)
- [RK 4.06 profile schema audit](https://github.com/shubh-3011/rk-keyboard-software-research/blob/main/docs/rk-profile-schema-audit.md)
