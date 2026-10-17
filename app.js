const STORAGE_KEY = "keydeck-rk-s98-v2";
const EFFECTS = [
  "Static",
  "Breathing",
  "Wave",
  "Reactive",
  "Ripple",
  "Spectrum",
  "Off",
];
const LAYERS = ["base", "fn", "fn2", "game"];
const LAYER_LABELS = { base: "Base", fn: "Fn 1", fn2: "Fn 2", game: "Game" };
const KEY_ROWS = [
  [
    ["Esc", "Esc", 1],
    ["F1", "F1", 1],
    ["F2", "F2", 1],
    ["F3", "F3", 1],
    ["F4", "F4", 1],
    ["F5", "F5", 1],
    ["F6", "F6", 1],
    ["F7", "F7", 1],
    ["F8", "F8", 1],
    ["F9", "F9", 1],
    ["F10", "F10", 1],
    ["F11", "F11", 1],
    ["F12", "F12", 1],
    ["Print", "Prt", 1],
    ["Scroll", "Scr", 1],
    ["Pause", "Pau", 1],
  ],
  [
    ["Tilde", "~", 1],
    ["1", "1", 1],
    ["2", "2", 1],
    ["3", "3", 1],
    ["4", "4", 1],
    ["5", "5", 1],
    ["6", "6", 1],
    ["7", "7", 1],
    ["8", "8", 1],
    ["9", "9", 1],
    ["0", "0", 1],
    ["Minus", "-", 1],
    ["Equal", "=", 1],
    ["Backspace", "Backspace", 2],
    ["Insert", "Ins", 1],
    ["Home", "Home", 1],
    ["PageUp", "PgUp", 1],
    ["NumLock", "Num", 1],
    ["NumDivide", "/", 1],
    ["NumMultiply", "*", 1],
    ["NumMinus", "-", 1],
  ],
  [
    ["Tab", "Tab", 1.5],
    ["Q", "Q", 1],
    ["W", "W", 1],
    ["E", "E", 1],
    ["R", "R", 1],
    ["T", "T", 1],
    ["Y", "Y", 1],
    ["U", "U", 1],
    ["I", "I", 1],
    ["O", "O", 1],
    ["P", "P", 1],
    ["LeftBracket", "[", 1],
    ["RightBracket", "]", 1],
    ["Backslash", "\\", 1.5],
    ["Delete", "Del", 1],
    ["End", "End", 1],
    ["PageDown", "PgDn", 1],
    ["Num7", "7", 1],
    ["Num8", "8", 1],
    ["Num9", "9", 1],
    ["NumPlus", "+", 1],
  ],
  [
    ["CapsLock", "Caps", 1.8],
    ["A", "A", 1],
    ["S", "S", 1],
    ["D", "D", 1],
    ["F", "F", 1],
    ["G", "G", 1],
    ["H", "H", 1],
    ["J", "J", 1],
    ["K", "K", 1],
    ["L", "L", 1],
    ["Semicolon", ";", 1],
    ["Quote", "'", 1],
    ["Enter", "Enter", 2.2],
    ["Num4", "4", 1],
    ["Num5", "5", 1],
    ["Num6", "6", 1],
    ["NumPlus2", "+", 1],
  ],
  [
    ["LeftShift", "Shift", 2.3],
    ["Z", "Z", 1],
    ["X", "X", 1],
    ["C", "C", 1],
    ["V", "V", 1],
    ["B", "B", 1],
    ["N", "N", 1],
    ["M", "M", 1],
    ["Comma", ",", 1],
    ["Period", ".", 1],
    ["Slash", "/", 1],
    ["RightShift", "Shift", 2.3],
    ["Up", "Up", 1],
    ["Num1", "1", 1],
    ["Num2", "2", 1],
    ["Num3", "3", 1],
    ["NumEnter", "Enter", 1],
  ],
  [
    ["LeftCtrl", "Ctrl", 1.2],
    ["LeftWin", "Win", 1.2],
    ["LeftAlt", "Alt", 1.2],
    ["Space", "Space", 5.7],
    ["RightAlt", "Alt", 1.2],
    ["Fn", "Fn", 1.1],
    ["Menu", "Menu", 1.1],
    ["RightCtrl", "Ctrl", 1.2],
    ["Left", "Left", 1],
    ["Down", "Down", 1],
    ["Right", "Right", 1],
    ["Num0", "0", 2],
    ["NumDecimal", ".", 1],
    ["NumEnter2", "Enter", 1],
  ],
];

let modelCatalog = [];
let identifiedDevice = null;
let activePage = "device";
let currentLayer = "base";
let selectedKey = "W";
let selectedMacroId = "";
let toastTimer = 0;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const makeId = () =>
  Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

function starterProfile(name) {
  return {
    id: makeId(),
    name: name || "Daily setup",
    modelCode: "022F",
    lighting: { effect: "Static", color: "#75D6C1", brightness: 72, speed: 55 },
    screen: { brightness: 70, clock: true, assetName: "", width: 0, height: 0 },
    knob: { rotate: "Volume", press: "Play / pause", longPress: "None" },
    connection: "USB-C",
    layers: { base: {}, fn: {}, fn2: {}, game: {} },
    macros: [
      {
        id: makeId(),
        name: "Quick reply",
        sequence: "TAP H\nWAIT 60 ms\nTAP I\nTAP ENTER",
      },
    ],
  };
}

function normalizeProfile(profile) {
  const value =
    profile && typeof profile === "object" ? profile : starterProfile();
  value.id = value.id || makeId();
  value.name =
    typeof value.name === "string" && value.name.trim()
      ? value.name.trim().slice(0, 48)
      : "Imported profile";
  value.modelCode =
    typeof value.modelCode === "string"
      ? value.modelCode.toUpperCase()
      : "022F";
  value.lighting =
    value.lighting && typeof value.lighting === "object" ? value.lighting : {};
  value.lighting.effect = EFFECTS.includes(value.lighting.effect)
    ? value.lighting.effect
    : "Static";
  value.lighting.color = /^#[0-9a-f]{6}$/i.test(value.lighting.color || "")
    ? value.lighting.color.toUpperCase()
    : "#75D6C1";
  value.lighting.brightness = bounded(value.lighting.brightness, 72);
  value.lighting.speed = bounded(value.lighting.speed, 55);
  value.screen =
    value.screen && typeof value.screen === "object" ? value.screen : {};
  value.screen.brightness = bounded(value.screen.brightness, 70);
  value.screen.clock = value.screen.clock !== false;
  value.screen.assetName =
    typeof value.screen.assetName === "string"
      ? value.screen.assetName.slice(0, 180)
      : "";
  value.screen.width = bounded(value.screen.width, 0, 8192);
  value.screen.height = bounded(value.screen.height, 0, 8192);
  value.knob = value.knob && typeof value.knob === "object" ? value.knob : {};
  value.knob.rotate = String(value.knob.rotate || "Volume");
  value.knob.press = String(value.knob.press || "Play / pause");
  value.knob.longPress = String(value.knob.longPress || "None");
  value.connection = [
    "USB-C",
    "2.4 GHz",
    "Bluetooth 1",
    "Bluetooth 2",
    "Bluetooth 3",
  ].includes(value.connection)
    ? value.connection
    : "USB-C";
  value.layers =
    value.layers && typeof value.layers === "object" ? value.layers : {};
  for (const layer of LAYERS)
    if (!value.layers[layer] || typeof value.layers[layer] !== "object")
      value.layers[layer] = {};
  value.macros = Array.isArray(value.macros)
    ? value.macros
        .filter((macro) => macro && typeof macro === "object")
        .map((macro) => ({
          id: macro.id || makeId(),
          name: String(macro.name || "Untitled macro").slice(0, 48),
          sequence: String(macro.sequence || "").slice(0, 8000),
        }))
    : [];
  return value;
}

function bounded(value, fallback, max = 100) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.max(0, Math.min(max, number))
    : fallback;
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (parsed && Array.isArray(parsed.profiles) && parsed.profiles.length) {
      parsed.profiles = parsed.profiles.map(normalizeProfile);
      if (
        !parsed.profiles.some(
          (profile) => profile.id === parsed.activeProfileId,
        )
      )
        parsed.activeProfileId = parsed.profiles[0].id;
      return parsed;
    }
  } catch (error) {
    console.warn(
      "Could not read saved profile data; using a new local profile.",
    );
  }
  const first = starterProfile();
  return { activeProfileId: first.id, profiles: [first] };
}

const state = loadState();
const activeProfile = () =>
  state.profiles.find((profile) => profile.id === state.activeProfileId) ||
  state.profiles[0];

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2700);
}

function saveState(message) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (message) showToast(message);
  } catch (error) {
    showToast(
      "Profile storage is full. Export your profile and remove large fields.",
    );
  }
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

function modelByCode(code) {
  return (
    modelCatalog.find(
      (model) => model.code.toUpperCase() === String(code || "").toUpperCase(),
    ) || null
  );
}

function renderProfileSelect() {
  const select = $("#profileSelect");
  select.replaceChildren();
  state.profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    select.append(option);
  });
  select.value = state.activeProfileId;
}

function renderModelSelect() {
  const select = $("#modelSelect");
  select.replaceChildren();
  modelCatalog.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.code;
    option.textContent = model.name + " · " + model.code;
    select.append(option);
  });
  const selectedCode = modelByCode(activeProfile().modelCode)
    ? activeProfile().modelCode
    : (modelCatalog[0] && modelCatalog[0].code) || "022F";
  select.value = selectedCode;
  if (modelCatalog.length)
    activeProfile().modelCode = select.value || selectedCode;
  $("#overviewLayoutCaption").textContent =
    (modelByCode(select.value)?.region || "ANSI") + " profile · 96% layout";
  $("#selectedModelName").textContent =
    modelByCode(select.value)?.name || "S98 variant";
}

function renderKeyboard(host) {
  if (!host) return;
  host.replaceChildren();
  const profile = activeProfile();
  KEY_ROWS.forEach((row, rowIndex) => {
    const rowElement = document.createElement("div");
    rowElement.className = "key-row row-" + rowIndex;
    row.forEach(([id, label, width]) => {
      const key = document.createElement("button");
      key.type = "button";
      key.className = "keycap";
      key.textContent = label;
      key.title = label;
      key.style.setProperty("--w", String(width));
      key.dataset.key = id;
      const mapping = profile.layers[currentLayer][id];
      if (mapping && mapping.type !== "Default") key.classList.add("mapped");
      if (
        [
          "Backspace",
          "Tab",
          "CapsLock",
          "Enter",
          "LeftShift",
          "RightShift",
          "LeftCtrl",
          "LeftAlt",
          "Space",
          "Fn",
        ].includes(id)
      )
        key.classList.add("modifier");
      if (id === selectedKey && activePage === "keys")
        key.classList.add("selected");
      if (mapping && mapping.type !== "Default")
        key.title = label + " → " + (mapping.value || mapping.type);
      key.addEventListener("click", () => {
        selectedKey = id;
        if (host.id === "keymapKeyboard") return renderAll();
        setPage("keys");
        renderAll();
      });
      rowElement.append(key);
    });
    host.append(rowElement);
  });
}

function renderLighting() {
  const lighting = activeProfile().lighting;
  $("#effectSelect").value = lighting.effect;
  $("#colorPicker").value = lighting.color;
  $("#colorHex").textContent = lighting.color;
  $("#brightnessRange").value = lighting.brightness;
  $("#brightnessValue").textContent = lighting.brightness + "%";
  $("#quickBrightness").value = lighting.brightness;
  $("#overviewBrightness").textContent = lighting.brightness + "%";
  $("#speedRange").value = lighting.speed;
  $("#speedValue").textContent = lighting.speed + "%";
  $("#overviewEffect").textContent = lighting.effect;
  $$(".swatch").forEach((swatch) =>
    swatch.classList.toggle(
      "active",
      swatch.dataset.color.toUpperCase() === lighting.color.toUpperCase(),
    ),
  );
}

function renderEditor() {
  const profile = activeProfile();
  $("#layerSelect").value = currentLayer;
  const mapping = profile.layers[currentLayer][selectedKey];
  const descriptor = KEY_ROWS.flat().find((row) => row[0] === selectedKey);
  const label = descriptor ? descriptor[1] : selectedKey;
  $("#selectedKeyName").textContent = label;
  $("#selectedKeycap").textContent = label;
  $("#selectedLayerName").textContent = LAYER_LABELS[currentLayer];
  $("#actionSelect").value = mapping?.type || "Default";
  $("#actionValue").value = mapping?.value || label;
  $("#actionValueWrap").hidden =
    !mapping || !["Custom", "Macro", "Media"].includes(mapping.type);
  const count = Object.keys(profile.layers[currentLayer]).length;
  $("#mappingCount").textContent = count
    ? count +
      " remap" +
      (count === 1 ? "" : "s") +
      " in " +
      LAYER_LABELS[currentLayer]
    : "No remaps in " + LAYER_LABELS[currentLayer];
}

function renderScreen() {
  const screen = activeProfile().screen;
  $("#screenBrightness").value = screen.brightness;
  $("#screenBrightnessValue").textContent = screen.brightness + "%";
  $("#screenClock").checked = screen.clock;
  const asset = screen.assetName;
  $("#screenAssetState").textContent = asset || "No display asset selected";
  $("#screenAssetName").textContent = asset || "Choose PNG, JPG or GIF";
  $("#screenAssetDimensions").textContent = asset
    ? screen.width + " × " + screen.height + " pixels · metadata only"
    : "Files are inspected locally in your browser.";
  $("#screenTransferTitle").textContent = asset || "No display asset selected";
  $("#screenTransferText").textContent = asset
    ? "Asset metadata is stored in this profile. The image file stays on this PC and has not been transferred."
    : "Asset metadata stays local. The image is not uploaded and is not sent to the keyboard.";
  $("#screenTransport").textContent = identifiedDevice
    ? "Identity only · no report opened"
    : "Not connected";
}

function renderKnob() {
  const profile = activeProfile();
  $("#knobRotate").value = profile.knob.rotate;
  $("#knobPress").value = profile.knob.press;
  $("#knobLongPress").value = profile.knob.longPress;
  $("#connectionMode").value = profile.connection;
}

function renderMacros() {
  const list = $("#macroList");
  list.replaceChildren();
  const profile = activeProfile();
  if (!profile.macros.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No macros in this profile. Add one to begin.";
    list.append(empty);
  }
  if (!profile.macros.some((macro) => macro.id === selectedMacroId))
    selectedMacroId = profile.macros[0]?.id || "";
  for (const macro of profile.macros) {
    const item = document.createElement("button");
    item.type = "button";
    item.className =
      "macro-list-item" + (macro.id === selectedMacroId ? " active" : "");
    item.innerHTML =
      "<strong>" +
      escapeHtml(macro.name) +
      "</strong><small>" +
      macro.sequence.split(/\r?\n/).filter(Boolean).length +
      " steps</small>";
    item.addEventListener("click", () => {
      selectedMacroId = macro.id;
      renderMacros();
    });
    list.append(item);
  }
  const selected = profile.macros.find((macro) => macro.id === selectedMacroId);
  $("#macroName").value = selected?.name || "";
  $("#macroSequence").value = selected?.sequence || "";
  $("#deleteMacro").disabled = !selected;
}

function renderProfiles() {
  const grid = $("#profileGrid");
  grid.replaceChildren();
  $("#profileCount").textContent =
    state.profiles.length +
    " profile" +
    (state.profiles.length === 1 ? "" : "s");
  state.profiles.forEach((profile) => {
    const model = modelByCode(profile.modelCode);
    const card = document.createElement("article");
    card.className =
      "profile-card" + (profile.id === state.activeProfileId ? " active" : "");
    card.innerHTML =
      "<div class='profile-card-top'><span class='profile-card-icon'>RK</span>" +
      (profile.id === state.activeProfileId
        ? "<span class='active-badge'>ACTIVE</span>"
        : "") +
      "</div><h3>" +
      escapeHtml(profile.name) +
      "</h3><p>" +
      escapeHtml(model?.name || "S98 profile") +
      " · " +
      profile.macros.length +
      " macros</p><div class='profile-card-actions'><button class='button button-light' data-activate='" +
      escapeHtml(profile.id) +
      "'>" +
      (profile.id === state.activeProfileId ? "Current" : "Use profile") +
      "</button><button class='button button-light' data-rename='" +
      escapeHtml(profile.id) +
      "'>Rename</button>" +
      (state.profiles.length > 1
        ? "<button class='button button-light' data-delete='" +
          escapeHtml(profile.id) +
          "'>Delete</button>"
        : "") +
      "</div>";
    grid.append(card);
  });
  $$("[data-activate]").forEach((button) =>
    button.addEventListener("click", () => {
      state.activeProfileId = button.dataset.activate;
      currentLayer = "base";
      selectedMacroId = "";
      saveState("Profile switched.");
      renderAll();
    }),
  );
  $$("[data-rename]").forEach((button) =>
    button.addEventListener("click", () => {
      const profile = state.profiles.find(
        (entry) => entry.id === button.dataset.rename,
      );
      const name = profile && prompt("Profile name", profile.name);
      if (name?.trim()) {
        profile.name = name.trim();
        saveState("Profile renamed.");
        renderAll();
      }
    }),
  );
  $$("[data-delete]").forEach((button) =>
    button.addEventListener("click", () => {
      const profile = state.profiles.find(
        (entry) => entry.id === button.dataset.delete,
      );
      if (!profile || !confirm("Delete profile '" + profile.name + "'?"))
        return;
      state.profiles = state.profiles.filter(
        (entry) => entry.id !== profile.id,
      );
      if (state.activeProfileId === profile.id)
        state.activeProfileId = state.profiles[0].id;
      saveState("Profile deleted.");
      renderAll();
    }),
  );
}

function setDeviceStatus(device) {
  identifiedDevice = device || null;
  const connected = Boolean(device);
  const lampText = connected ? "Keyboard identified" : "No keyboard identified";
  $("#sidebarDeviceState").textContent = lampText;
  $("#sidebarDeviceName").textContent = device?.productName || "RK S98";
  $("#sidebarDeviceId").textContent = connected
    ? "Descriptor only · reports closed"
    : "USB device access is off";
  $("#devicePillText").textContent = connected
    ? device.productName || "RK device identified"
    : "Not identified";
  $("#deviceIdentity").textContent = connected
    ? "Browser permission granted. HID reports are not opened, read or written."
    : "Choose Identify keyboard to inspect its USB identity. The app will not open or write HID reports.";
  $("#deviceIdValue").textContent = connected
    ? hex4(device.vendorId) + ":" + hex4(device.productId)
    : "—";
  $("#diagName").textContent = device?.productName || "Not identified";
  $("#diagVendor").textContent = connected ? "0x" + hex4(device.vendorId) : "—";
  $("#diagProduct").textContent = connected
    ? "0x" + hex4(device.productId)
    : "—";
  $("#diagCollections").textContent = connected
    ? String(device.collections.length)
    : "—";
  $$("#sidebarLamp,#deviceLamp").forEach((lamp) =>
    lamp.classList.toggle("connected", connected),
  );
  const model = connected ? modelByCode(hex4(device.productId)) : null;
  const callout = $("#supportCallout");
  if (!connected) {
    $("#diagProfile").textContent = "None";
    callout.innerHTML =
      "<strong>No device access granted</strong><p>Identify the keyboard to compare its USB product ID with the S98 profiles in this project.</p>";
  } else if (model) {
    $("#diagProfile").textContent = model.name;
    callout.innerHTML =
      "<strong>S98 identity matches " +
      escapeHtml(model.code) +
      "</strong><p>Descriptor inspection is complete. This build does not send device commands.</p>";
  } else {
    $("#diagProfile").textContent = "No S98 match";
    callout.innerHTML =
      "<strong>Unrecognized product ID</strong><p>This ID does not match an S98 profile. The device writer is locked and no HID report was opened.</p>";
  }
  $("#lightingDeviceState").textContent = connected
    ? "0x" + hex4(device.productId)
    : "Not identified";
  $("#screenTransport").textContent = connected
    ? "Identity only · no report opened"
    : "Not connected";
  if (device)
    window.localStorage.setItem(
      "keydeck-last-device",
      hex4(device.vendorId) + ":" + hex4(device.productId),
    );
  renderScreen();
}

function hex4(number) {
  return Number(number).toString(16).padStart(4, "0").toUpperCase();
}

async function identifyDevice() {
  if (!navigator.hid) {
    showToast(
      "WebHID is unavailable here. Use a recent desktop Chrome or Edge browser over HTTPS or localhost.",
    );
    return;
  }
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x258a }],
    });
    if (!devices.length) return;
    const device = devices[0];
    setDeviceStatus(device);
    showToast(
      modelByCode(hex4(device.productId))
        ? "S98 profile identity found. Device commands remain disabled."
        : "Device identified. No matching S98 profile; hardware writes remain locked.",
    );
  } catch (error) {
    if (error && error.name === "NotFoundError") return;
    showToast("The browser could not identify that device.");
  }
}

function renderAll() {
  state.profiles = state.profiles.map(normalizeProfile);
  renderProfileSelect();
  renderModelSelect();
  renderKeyboard($("#s98Keyboard"));
  renderKeyboard($("#keymapKeyboard"));
  renderLighting();
  renderEditor();
  renderScreen();
  renderKnob();
  renderMacros();
  renderProfiles();
  if (identifiedDevice) setDeviceStatus(identifiedDevice);
}

function setPage(page) {
  activePage = page;
  $$(".page").forEach((section) =>
    section.classList.toggle("active", section.id === "page-" + page),
  );
  $$(".nav-item").forEach((button) =>
    button.classList.toggle("active", button.dataset.page === page),
  );
  const titles = {
    device: "Device",
    keys: "Key map",
    lighting: "Lighting",
    screen: "Smart display",
    knob: "Knob & modes",
    macros: "Macros",
    profiles: "Profiles",
    diagnostics: "Device info",
  };
  $("#crumbTitle").textContent = titles[page] || "Device";
}

function downloadJson(filename, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function addProfile() {
  const name = prompt(
    "Name this profile",
    "Profile " + (state.profiles.length + 1),
  );
  if (!name?.trim()) return;
  const profile = starterProfile(name.trim());
  state.profiles.push(profile);
  state.activeProfileId = profile.id;
  saveState("Profile created.");
  renderAll();
}

function saveMacro() {
  const profile = activeProfile();
  const macro = profile.macros.find((entry) => entry.id === selectedMacroId);
  if (!macro) return showToast("Create a macro first.");
  macro.name = $("#macroName").value.trim() || "Untitled macro";
  macro.sequence = $("#macroSequence").value.slice(0, 8000);
  saveState("Macro saved to this profile.");
  renderMacros();
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = lines
    .shift()
    .split(",")
    .map((header) => header.trim().toLowerCase());
  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(
      headers.map((header, index) => [header, (values[index] || "").trim()]),
    );
  });
}

async function importTrace(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = file.name.toLowerCase().endsWith(".json")
      ? JSON.parse(text.replace(/^\uFEFF/, ""))
      : parseCsv(text);
    const records = Array.isArray(parsed)
      ? parsed
      : parsed.records || parsed.packets || parsed.events || [];
    $("#traceSummary").textContent = records.length + " records · " + file.name;
    const body = $("#traceRows");
    body.replaceChildren();
    records.slice(0, 300).forEach((record) => {
      const row = document.createElement("tr");
      [
        record.time || record.timestamp || record.frame || "—",
        record.direction || record.type || record.transfer || "—",
        record.reportId || record.report_id || record.endpoint || "—",
        record.data || record.bytes || record.payload || "—",
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = String(value).slice(0, 150);
        row.append(cell);
      });
      body.append(row);
    });
    if (!records.length)
      body.innerHTML =
        '<tr><td colspan="4" class="table-empty">No records were found.</td></tr>';
    if (records.length > 300) showToast("Showing the first 300 records.");
  } catch (error) {
    showToast("Could not parse that file as a trace CSV or JSON list.");
  }
}

function wireEvents() {
  $$("[data-page]").forEach((button) =>
    button.addEventListener("click", () => setPage(button.dataset.page)),
  );
  $$("[data-go]").forEach((button) =>
    button.addEventListener("click", () => setPage(button.dataset.go)),
  );
  $$("[data-identify]").forEach((button) =>
    button.addEventListener("click", identifyDevice),
  );
  $("#profileSelect").addEventListener("change", (event) => {
    state.activeProfileId = event.target.value;
    currentLayer = "base";
    selectedMacroId = "";
    saveState("Profile switched.");
    renderAll();
  });
  $("#modelSelect").addEventListener("change", (event) => {
    activeProfile().modelCode = event.target.value;
    saveState("S98 profile variant saved.");
    renderAll();
  });
  $("#layerSelect").addEventListener("change", (event) => {
    currentLayer = event.target.value;
    renderAll();
  });
  $("#actionSelect").addEventListener("change", () => {
    $("#actionValueWrap").hidden = !["Custom", "Macro", "Media"].includes(
      $("#actionSelect").value,
    );
  });
  $("#saveKeyMapping").addEventListener("click", () => {
    const type = $("#actionSelect").value;
    if (type === "Default")
      delete activeProfile().layers[currentLayer][selectedKey];
    else
      activeProfile().layers[currentLayer][selectedKey] = {
        type,
        value: ["Custom", "Macro", "Media"].includes(type)
          ? $("#actionValue").value.trim()
          : "",
      };
    saveState("Key assignment saved to this profile.");
    renderAll();
  });
  $("#clearKeyMapping").addEventListener("click", () => {
    delete activeProfile().layers[currentLayer][selectedKey];
    saveState("Key assignment reset.");
    renderAll();
  });
  $("#effectSelect").addEventListener("change", (event) => {
    activeProfile().lighting.effect = event.target.value;
    saveState();
    renderAll();
  });
  $("#colorPicker").addEventListener("input", (event) => {
    activeProfile().lighting.color = event.target.value.toUpperCase();
    saveState();
    renderLighting();
  });
  $("#colorSwatches").addEventListener("click", (event) => {
    const swatch = event.target.closest("[data-color]");
    if (swatch) {
      activeProfile().lighting.color = swatch.dataset.color.toUpperCase();
      saveState();
      renderLighting();
    }
  });
  const setBrightness = (value) => {
    activeProfile().lighting.brightness = Number(value);
    saveState();
    renderLighting();
  };
  $("#brightnessRange").addEventListener("input", (event) =>
    setBrightness(event.target.value),
  );
  $("#quickBrightness").addEventListener("input", (event) =>
    setBrightness(event.target.value),
  );
  $("#speedRange").addEventListener("input", (event) => {
    activeProfile().lighting.speed = Number(event.target.value);
    saveState();
    renderLighting();
  });
  $("#saveLighting").addEventListener("click", () =>
    showToast("Lighting values saved. Device output is locked."),
  );
  $("#screenBrightness").addEventListener("input", (event) => {
    activeProfile().screen.brightness = Number(event.target.value);
    saveState();
    renderScreen();
  });
  $("#screenClock").addEventListener("change", (event) => {
    activeProfile().screen.clock = event.target.checked;
    saveState();
  });
  $("#screenFile").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const bitmap = await createImageBitmap(file);
      activeProfile().screen.assetName = file.name.slice(0, 180);
      activeProfile().screen.width = bitmap.width;
      activeProfile().screen.height = bitmap.height;
      bitmap.close();
      saveState("Image dimensions saved. Image data was not uploaded.");
      renderScreen();
    } catch (error) {
      showToast("Could not inspect that image. Try PNG, JPG or GIF.");
    }
    event.target.value = "";
  });
  $("#saveScreen").addEventListener("click", () =>
    showToast(
      "Display profile saved. The image has not been sent to the keyboard.",
    ),
  );
  $("#knobRotate").addEventListener("change", (event) => {
    activeProfile().knob.rotate = event.target.value;
    saveState();
  });
  $("#knobPress").addEventListener("change", (event) => {
    activeProfile().knob.press = event.target.value;
    saveState();
  });
  $("#knobLongPress").addEventListener("change", (event) => {
    activeProfile().knob.longPress = event.target.value;
    saveState();
  });
  $("#connectionMode").addEventListener("change", (event) => {
    activeProfile().connection = event.target.value;
    saveState("Connection preference saved to profile.");
  });
  $("#saveKnob").addEventListener("click", () =>
    showToast("Knob profile saved. Physical settings were not changed."),
  );
  $("#newMacro").addEventListener("click", () => {
    const macro = {
      id: makeId(),
      name: "New macro",
      sequence: "TAP W\nWAIT 40 ms\nTAP ENTER",
    };
    activeProfile().macros.push(macro);
    selectedMacroId = macro.id;
    saveState("Macro created.");
    renderMacros();
  });
  $("#saveMacro").addEventListener("click", saveMacro);
  $("#deleteMacro").addEventListener("click", () => {
    if (!selectedMacroId) return;
    activeProfile().macros = activeProfile().macros.filter(
      (macro) => macro.id !== selectedMacroId,
    );
    selectedMacroId = activeProfile().macros[0]?.id || "";
    saveState("Macro deleted.");
    renderMacros();
  });
  $("#newProfile").addEventListener("click", addProfile);
  $("#duplicateProfile").addEventListener("click", () => {
    const copy = normalizeProfile(JSON.parse(JSON.stringify(activeProfile())));
    copy.id = makeId();
    copy.name = activeProfile().name + " copy";
    state.profiles.push(copy);
    state.activeProfileId = copy.id;
    selectedMacroId = "";
    saveState("Profile duplicated.");
    renderAll();
  });
  $("#saveProfileButton").addEventListener("click", () => {
    saveState("Profile saved on this device.");
    renderAll();
  });
  $("#exportActive").addEventListener("click", () => {
    const name =
      activeProfile()
        .name.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "profile";
    downloadJson("keydeck-" + name + ".json", {
      format: "keydeck-rk-profile-v2",
      profile: activeProfile(),
    });
  });
  $("#importProfileButton").addEventListener("click", () =>
    $("#profileFile").click(),
  );
  $("#profileFile").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse((await file.text()).replace(/^\uFEFF/, ""));
      const imported = normalizeProfile(parsed.profile || parsed);
      imported.id = makeId();
      imported.name = imported.name + " import";
      state.profiles.push(imported);
      state.activeProfileId = imported.id;
      saveState("Profile imported locally.");
      renderAll();
    } catch (error) {
      showToast("That file is not a valid Keydeck profile JSON.");
    }
    event.target.value = "";
  });
  $("#traceFile").addEventListener("change", (event) =>
    importTrace(event.target.files?.[0]),
  );
  $("#writeChanges").addEventListener("click", () =>
    showToast("Hardware writes are disabled in this release."),
  );
  if (navigator.hid)
    navigator.hid.addEventListener("disconnect", (event) => {
      if (identifiedDevice && event.device === identifiedDevice) {
        setDeviceStatus(null);
        showToast("Keyboard disconnected.");
      }
    });
}

async function loadModelCatalog() {
  try {
    const response = await fetch("models.json", { cache: "no-store" });
    if (!response.ok) throw new Error("catalog unavailable");
    const models = await response.json();
    modelCatalog = Array.isArray(models) ? models : [];
  } catch (error) {
    modelCatalog = [{ code: "022F", name: "RK-S98 Keyboard", region: "ANSI" }];
  }
  renderAll();
}

wireEvents();
renderAll();
loadModelCatalog();
