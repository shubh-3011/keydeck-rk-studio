# Device appearance and color data

Keydeck selects the device overview photo from the current model profile. The
model profile takes precedence over a conflicting shared PID alias; its region
selects a regional RK Drive image when one is listed. For the RK-S98 ANSI
profile (catalog code `021E`), the default is the standard S98 product photo.

The S98 picker lists six official appearance references: Lavender Purple, Deep
Black, Sky Blue, Clay Green, Pink Edition, and Winter Limited Edition. The
image URLs and product-page URLs are recorded in
[`model-appearance.json`](../model-appearance.json) and fetched directly at
runtime. They are not copied into this repository or executable. Selection is
saved with the local Keydeck profile.

The connected USB/HID descriptor can identify a model/profile in some cases,
but does not reveal case finish or keycap color. The S98 appearance selector is
therefore manual. A regional profile may use its RK Drive layout photo instead
of a standard ANSI finish photo so its key legends remain appropriate.

The RGB value on the overview is the selected profile's saved lighting color.
It is not read from the keyboard. Keydeck does not open a HID report or read
live lighting state. Applying lighting remains disabled.

## Sources

- [RK's official S98 product page](https://rkgamingstore.com/products/s98-wireless-mechanical-keyboard) lists the Lavender Purple standard appearance and the regional language choices.
- [RK S98 Pink Edition product page](https://rkgamingstore.com/products/s98-pink-edition) identifies the pink gradient keycaps.
- [RK S98 Winter Limited Edition product page](https://rkgamingstore.com/products/s98-winter-limited-edition) identifies the winter edition.
- [RK Drive model registry](https://drive.rkgaming.com/) supplies the broader profile and regional model-photo catalog.
