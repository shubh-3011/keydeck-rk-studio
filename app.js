const STORAGE_KEY = "keydeck-rk-s98-v2";
const LAYERS = ["base", "fn", "fn2", "game", "fn4", "fn5", "fn6", "fn7"];
const LAYER_LABELS = {
  base: "Base",
  fn: "Fn 1",
  fn2: "Fn 2",
  game: "Game",
  fn4: "Fn 4",
  fn5: "Fn 5",
  fn6: "Fn 6",
  fn7: "Fn 7",
};
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
let modelLayouts = {};
let driveCatalog = null;
let appearanceCatalog = { variants: [] };
let identifiedDevice = null;
let authorizedDevices = [];
let identityMatch = null;
let activePage = "device";
let selectedDriveModel = "";
let selectedDriveCategory = "keyboard";
let currentLayer = "base";
let selectedKey = "K34";
let selectedLightingKey = "";
let selectedMacroId = "";
const screenPreviewUrls = new Map();
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
    appearanceVariant: "",
    lighting: { effect: "mode:1", color: "#75D6C1", mixColor: "#80A7FF", brightness: 72, speed: 55, direction: "none", keyColors: {}, driveReferenceModel: "", driveReferenceEffect: "" },
    screen: { brightness: 70, clock: true, assetName: "", width: 0, height: 0 },
    knob: { rotate: "Volume", press: "Play / pause", longPress: "None" },
    advanced: {
      schema: "keydeck-local-draft-v1",
      deviceWrite: false,
      behaviors: {},
      socd: { enabled: false, pair: "A/D", resolution: "last-input" },
      snapTap: false,
      performanceNote: "",
    },
    connection: "USB-C",
    osTable: "Windows",
    keymaps: {
      Windows: { base: {}, fn: {}, fn2: {}, game: {} },
      macOS: { base: {}, fn: {}, fn2: {}, game: {} },
    },
    layers: { base: {}, fn: {}, fn2: {}, game: {} },
    macros: [
      {
        id: makeId(),
        name: "Quick reply",
        sequence: "TAP H\nWAIT 60 ms\nTAP I\nTAP ENTER",
        steps: [],
        loop: { mode: "none", count: 1 },
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
  value.appearanceVariant = typeof value.appearanceVariant === "string"
    ? value.appearanceVariant.slice(0, 48)
    : "";
  value.lighting =
    value.lighting && typeof value.lighting === "object" ? value.lighting : {};
  value.lighting.effect = String(value.lighting.effect || "mode:1");
  value.lighting.color = /^#[0-9a-f]{6}$/i.test(value.lighting.color || "")
    ? value.lighting.color.toUpperCase()
    : "#75D6C1";
  value.lighting.mixColor = /^#[0-9a-f]{6}$/i.test(value.lighting.mixColor || "")
    ? value.lighting.mixColor.toUpperCase()
    : "#80A7FF";
  value.lighting.brightness = bounded(value.lighting.brightness, 72);
  value.lighting.speed = bounded(value.lighting.speed, 55);
  value.lighting.direction = ["none", "left-right", "right-left", "top-bottom", "bottom-top", "center-out"].includes(value.lighting.direction)
    ? value.lighting.direction
    : "none";
  const sourceKeyColors = value.lighting.keyColors && typeof value.lighting.keyColors === "object" ? value.lighting.keyColors : {};
  value.lighting.keyColors = Object.fromEntries(Object.entries(sourceKeyColors).slice(0, 256).filter(([, color]) => /^#[0-9a-f]{6}$/i.test(String(color))).map(([key, color]) => [String(key).slice(0, 24), String(color).toUpperCase()]));
  value.lighting.driveReferenceModel = String(value.lighting.driveReferenceModel || "").slice(0, 100);
  value.lighting.driveReferenceEffect = String(value.lighting.driveReferenceEffect || "").slice(0, 100);
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
  value.advanced = value.advanced && typeof value.advanced === "object" ? value.advanced : {};
  value.advanced.schema = "keydeck-local-draft-v1";
  value.advanced.deviceWrite = false;
  value.advanced.behaviors = value.advanced.behaviors && typeof value.advanced.behaviors === "object" ? value.advanced.behaviors : {};
  for (const layer of LAYERS) {
    const entries = value.advanced.behaviors[layer] && typeof value.advanced.behaviors[layer] === "object" ? value.advanced.behaviors[layer] : {};
    const safeEntries = {};
    Object.entries(entries).slice(0, 256).forEach(([keyId, behavior]) => {
      if (!behavior || typeof behavior !== "object") return;
      const mode = ["dks", "toggle", "mod-tap"].includes(behavior.mode) ? behavior.mode : "none";
      if (mode === "none") return;
      safeEntries[String(keyId).slice(0, 24)] = {
        mode,
        primaryAction: String(behavior.primaryAction || "").slice(0, 80),
        secondaryAction: String(behavior.secondaryAction || "").slice(0, 80),
        tapAction: String(behavior.tapAction || "").slice(0, 80),
        holdAction: String(behavior.holdAction || "").slice(0, 80),
      };
    });
    value.advanced.behaviors[layer] = safeEntries;
  }
  value.advanced.socd = value.advanced.socd && typeof value.advanced.socd === "object" ? value.advanced.socd : {};
  value.advanced.socd.enabled = value.advanced.socd.enabled === true;
  value.advanced.socd.pair = ["A/D", "Left/Right", "W/S", "Up/Down"].includes(value.advanced.socd.pair) ? value.advanced.socd.pair : "A/D";
  value.advanced.socd.resolution = ["last-input", "neutral", "first-input", "up-priority"].includes(value.advanced.socd.resolution) ? value.advanced.socd.resolution : "last-input";
  value.advanced.snapTap = value.advanced.snapTap === true;
  value.advanced.performanceNote = String(value.advanced.performanceNote || "").slice(0, 1000);
  value.connection = [
    "USB-C",
    "2.4 GHz",
    "Bluetooth 1",
    "Bluetooth 2",
    "Bluetooth 3",
  ].includes(value.connection)
    ? value.connection
    : "USB-C";
  const oldLayers = value.layers && typeof value.layers === "object" ? value.layers : {};
  const sourceKeymaps = value.keymaps && typeof value.keymaps === "object" ? value.keymaps : {};
  const normalizeKeymap = (source) => {
    const keymap = source && typeof source === "object" ? { ...source } : {};
    for (const layer of LAYERS)
      if (!keymap[layer] || typeof keymap[layer] !== "object") keymap[layer] = {};
    return keymap;
  };
  const windowsKeymap = normalizeKeymap(sourceKeymaps.Windows || oldLayers);
  const macKeymap = normalizeKeymap(sourceKeymaps.macOS || {});
  value.keymaps = { Windows: windowsKeymap, macOS: macKeymap };
  value.osTable = value.osTable === "macOS" ? "macOS" : "Windows";
  // Keep the old field as the Windows table for compatibility with existing exports.
  value.layers = windowsKeymap;
  value.macros = Array.isArray(value.macros)
    ? value.macros
        .filter((macro) => macro && typeof macro === "object")
        .map((macro) => ({
          id: macro.id || makeId(),
          name: String(macro.name || "Untitled macro").slice(0, 48),
          sequence: String(macro.sequence || "").slice(0, 8000),
          steps: Array.isArray(macro.steps) ? macro.steps.slice(0, 200).map((step) => ({
            id: step?.id || makeId(),
            kind: ["key", "mouse", "delay"].includes(step?.kind) ? step.kind : "key",
            action: String(step?.action || "").slice(0, 100),
            delayMs: bounded(step?.delayMs, 0, 60000),
          })) : [],
          loop: {
            mode: ["none", "count", "while-held", "until-press"].includes(macro.loop?.mode) ? macro.loop.mode : "none",
            count: bounded(macro.loop?.count, 1, 99),
          },
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
const activeKeymap = (profile = activeProfile()) =>
  profile.keymaps?.[profile.osTable] || profile.keymaps?.Windows || profile.layers;

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

function selectedModel() {
  return modelByCode(activeProfile().modelCode) || modelByCode("022F");
}

function normalizeCatalogName(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function officialImageUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      ["drive.rkgaming.com", "rkgamingstore.com"].includes(url.hostname.toLowerCase())
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function drivePhotoForProfile(model) {
  const family = normalizeCatalogName(model?.family);
  if (!family) return null;
  const candidates = (driveCatalog?.models || []).filter((entry) =>
    entry.image_url && normalizeCatalogName(entry.name).includes(family) &&
    officialImageUrl(entry.image_url),
  );
  if (!candidates.length) return null;
  const profileName = normalizeCatalogName(model.name);
  const exactName = candidates
    .filter((entry) => profileName.startsWith(normalizeCatalogName(entry.name)))
    .sort((a, b) => normalizeCatalogName(b.name).length - normalizeCatalogName(a.name).length)[0];
  if (exactName) return exactName;
  const region = normalizeCatalogName(model.region);
  if (region && region !== "ansi") {
    const regional = candidates
      .filter((entry) => normalizeCatalogName(entry.name).endsWith(region))
      .sort((a, b) => normalizeCatalogName(b.name).length - normalizeCatalogName(a.name).length)[0];
    if (regional) return regional;
  }
  const generic = candidates.find((entry) => {
    const label = normalizeCatalogName(entry.name);
    return label === family || label === `rk${family}`;
  });
  if (generic) return generic;
  return candidates.sort((a, b) => normalizeCatalogName(a.name).length - normalizeCatalogName(b.name).length)[0];
}

function renderDeviceAppearance() {
  const model = selectedModel();
  const matchedModel = identityMatch?.model || null;
  const connectedExact = Boolean(matchedModel && matchedModel.code === model?.code);
  const selectedModelIsCandidate = Boolean(model && identityMatch?.candidates?.some((entry) => entry.code === model.code));
  const photo = $("#devicePhoto");
  const empty = $("#devicePhotoEmpty");
  const note = $("#devicePhotoNote");
  const source = $("#devicePhotoSource");
  const choicesWrap = $("#deviceAppearanceChoicesWrap");
  const choices = $("#deviceAppearanceChoices");
  const rgb = $("#deviceRgbAppearance");
  if (!photo || !model) return;

  const isS98 = normalizeCatalogName(model.family) === "s98" && model.region === "ANSI";
  const options = isS98 ? appearanceCatalog.variants || [] : [];
  const selectedOption = options.find((entry) => entry.id === activeProfile().appearanceVariant)
    || options.find((entry) => entry.id === "lavender-purple");
  const drivePhoto = drivePhotoForProfile(model);
  const imageUrl = selectedOption ? officialImageUrl(selectedOption.imageUrl) : officialImageUrl(drivePhoto?.image_url);
  const sourceUrl = selectedOption?.sourceUrl || (drivePhoto ? "https://drive.rkgaming.com/" : "");

  $("#devicePhotoKicker").textContent = connectedExact
    ? "CONNECTED MODEL PHOTO"
    : identifiedDevice
      ? matchedModel
        ? "SELECTED PROFILE PHOTO · MODEL MISMATCH"
        : selectedModelIsCandidate
          ? "CONNECTED DEVICE · SELECTED PROFILE"
          : "CONNECTED DEVICE · MODEL UNCONFIRMED"
      : "MODEL APPEARANCE";
  $("#devicePhotoTitle").textContent = model.name;
  photo.alt = selectedOption
    ? `${model.name} appearance reference: ${selectedOption.name}`
    : drivePhoto ? `${model.name} product image` : "";
  photo.hidden = !imageUrl;
  empty.hidden = Boolean(imageUrl);
  empty.textContent = imageUrl ? "" : "No official product photo is mapped for this model";
  if (photo.dataset.source !== imageUrl) {
    photo.dataset.source = imageUrl;
    if (imageUrl) photo.src = imageUrl;
    else photo.removeAttribute("src");
  }
  photo.onerror = () => {
    if (photo.dataset.source !== imageUrl) return;
    photo.hidden = true;
    empty.hidden = false;
    empty.textContent = "RK's photo host could not be reached";
    note.textContent = "Try again when online; model and layout identification are still available.";
  };
  const photoNote = selectedOption
    ? `${selectedOption.name} · ${selectedOption.series} photo from RK's official store. USB identity does not detect physical finish.`
    : drivePhoto
      ? `${drivePhoto.name} · regional photo from RK Drive. USB identity cannot identify case finish or live lighting.`
      : "A photo is not listed for this profile in the available RK catalogs.";
  if (identifiedDevice && !connectedExact) {
    const deviceId = `${hex4(identifiedDevice.vendorId)}:${hex4(identifiedDevice.productId)}`;
    const candidateCount = identityMatch?.candidates?.length || 0;
    const connectionNote = matchedModel
      ? `USB ${deviceId} identifies ${matchedModel.name}; this image follows the selected ${model.name} profile.`
      : selectedModelIsCandidate
        ? `USB ${deviceId} is shared by ${candidateCount} catalog profiles; this image follows the selected ${model.name} profile.`
        : `USB ${deviceId} does not confirm this profile; the image follows the selected ${model.name} profile.`;
    note.textContent = `${photoNote} ${connectionNote}`;
  } else {
    note.textContent = photoNote;
  }
  source.href = sourceUrl || "https://drive.rkgaming.com/";
  source.hidden = !sourceUrl;
  source.textContent = selectedOption ? "View official S98 product page" : "View RK Drive image catalog";

  choicesWrap.hidden = options.length === 0;
  choices.replaceChildren();
  options.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "appearance-choice";
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(selectedOption?.id === entry.id));
    button.textContent = entry.name;
    button.addEventListener("click", () => {
      activeProfile().appearanceVariant = entry.id;
      saveState("S98 appearance photo saved to this profile.");
      renderDeviceAppearance();
    });
    choices.append(button);
  });

  const profile = activeProfile();
  const color = /^#[0-9a-f]{6}$/i.test(profile.lighting?.color || "") ? profile.lighting.color : "#75D6C1";
  rgb.hidden = !model.features?.rgb;
  $("#deviceRgbSwatch").style.backgroundColor = color;
  $("#deviceRgbValue").textContent = color.toUpperCase();
}

function layoutForModel(model = selectedModel()) {
  return model ? modelLayouts[model.layoutId] || null : null;
}

function driveDescriptors(device) {
  const entries = [
    ...(driveCatalog?.models || []),
    ...(driveCatalog?.specializedKeyboardProfiles || []),
  ];
  if (!device) return [];
  const matchingIds = entries.filter(
    (entry) => Number(entry.vendor_id) === Number(device.vendorId) &&
      Number(entry.product_id) === Number(device.productId),
  );
  if (!matchingIds.length) return [];
  const collectionPairs = new Set(
    (device.collections || []).map(
      (collection) => `${Number(collection.usagePage)}:${Number(collection.usage)}`,
    ),
  );
  const matchingCollections = matchingIds.filter((entry) =>
    collectionPairs.has(`${Number(entry.usage_page)}:${Number(entry.usage)}`),
  );
  if (matchingCollections.length) return matchingCollections;
  return matchingIds.filter(
    (entry) => entry.record_type !== "specialized_keyboard_model_profile",
  );
}

function supportedVendorIds() {
  return [...new Set([
    0x258a,
    ...(driveCatalog?.models || []).map((entry) => Number(entry.vendor_id)),
    ...(driveCatalog?.specializedKeyboardProfiles || []).map((entry) => Number(entry.vendor_id)),
  ].filter((value) => Number.isInteger(value) && value > 0))];
}

function layerEntries(model = selectedModel()) {
  const labels = model?.features?.layers;
  return LAYERS.slice(0, Math.max(1, Math.min(labels?.length || 1, LAYERS.length))).map(
    (id, index) => ({ id, label: labels?.[index] || LAYER_LABELS[id] }),
  );
}

function modelSizeLabel(model) {
  const count = Number(model?.keyCount || 0);
  if (count >= 97 && count <= 104) return "96%";
  if (count >= 80 && count <= 89) return "TKL / 75%";
  if (count >= 70 && count <= 79) return "75%";
  if (count >= 65 && count <= 69) return "65%";
  if (count >= 59 && count <= 64) return "60%";
  return count ? `${count}-key layout` : "Layout not catalogued";
}

function deviceModelMatch(device) {
  if (!device || !supportedVendorIds().includes(Number(device.vendorId)))
    return { kind: "unsupported", model: null, candidates: [] };
  const pid = hex4(device.productId);
  const vid = hex4(device.vendorId);
  const name = String(device.productName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const nameMatches = modelCatalog.filter((model) => {
    const label = model.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    return label.length > 5 && name.includes(label);
  });
  if (nameMatches.length === 1)
    return { kind: "product-name", model: nameMatches[0], candidates: nameMatches };
  if (nameMatches.length > 1)
    return { kind: "product-name-family", model: null, candidates: nameMatches };

  const profileCandidates = (driveCatalog?.specializedKeyboardProfiles || []).filter(
    (entry) => Number(entry.vendor_id) === Number(device.vendorId) &&
      Number(entry.product_id) === Number(device.productId),
  );
  if (profileCandidates.length) {
    const collectionPairs = new Set(
      (device.collections || []).map(
        (collection) => `${Number(collection.usagePage)}:${Number(collection.usage)}`,
      ),
    );
    const exactCollection = profileCandidates.find((entry) =>
      collectionPairs.has(`${Number(entry.usage_page)}:${Number(entry.usage)}`),
    );
    if (exactCollection)
      return { kind: "specialized-profile", model: null, driveProfile: exactCollection, candidates: [] };
  }

  const direct = modelByCode(pid);
  const directVendor = String(direct?.features?.wirelessVendorId || "").toUpperCase();
  if (direct?.isDirectPid && (!directVendor || directVendor === vid))
    return { kind: "product-id", model: direct, candidates: [direct] };

  const candidates = modelCatalog.filter((model) => {
    const wirelessPid = model.features?.wirelessProductId;
    const wirelessVid = model.features?.wirelessVendorId;
    return wirelessPid === pid && (!wirelessVid || wirelessVid === vid);
  });
  if (candidates.length)
    return { kind: "receiver-id", model: null, candidates };
  const familyCandidates = modelCatalog.filter((model) =>
    name.split(/\s+/).includes(String(model.family).toLowerCase()),
  );
  return familyCandidates.length
    ? { kind: "product-name-family", model: null, candidates: familyCandidates }
    : { kind: "unmatched", model: null, candidates: [] };
}

function collectionKind(collection) {
  const page = Number(collection?.usagePage || 0);
  const usage = Number(collection?.usage || 0);
  if (page === 0x01 && usage === 0x06) return "keyboard";
  if (page === 0x01 && usage === 0x02) return "mouse";
  if (page === 0x0c) return "consumer control";
  if (page === 0x01 && usage === 0x80) return "system control";
  if (page >= 0xff00) return "vendor-defined";
  return `usage ${hex4(page)}:${hex4(usage)}`;
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
  const filter = String($("#modelFilter")?.value || "").trim().toLowerCase();
  const currentModel = selectedModel();
  select.replaceChildren();
  modelCatalog
    .filter((model) => {
      if (!filter) return true;
      return `${model.name} ${model.code} ${model.family} ${model.region}`
        .toLowerCase()
        .includes(filter);
    })
    .forEach((model) => {
    const option = document.createElement("option");
    option.value = model.code;
    option.textContent = `${model.name} · ${model.code}`;
    select.append(option);
  });
  select.value = [...select.options].some(
    (option) => option.value === currentModel?.code,
  )
    ? currentModel.code
    : "";
  const layout = layoutForModel(currentModel);
  $("#overviewLayoutCaption").textContent = currentModel
    ? `${currentModel.region} · ${modelSizeLabel(currentModel)} · ${layout?.keys?.length || 0} visual keys`
    : "Filter and choose a model profile";
  $("#selectedModelName").textContent =
    currentModel?.name || "Select a model";
  const exactProfileMatch = identityMatch?.model?.code === currentModel?.code;
  $("#deviceModelHeadline").textContent = currentModel
    ? exactProfileMatch
      ? currentModel.name
      : `Selected profile · ${currentModel.name}`
    : "Select a keyboard profile";
  $("#keyboardLayoutTitle").textContent = currentModel
    ? `${currentModel.family} · ${modelSizeLabel(currentModel)}`
    : "Keyboard layout";
  $("#keymapLayoutTitle").textContent = currentModel
    ? `${currentModel.name} · ${currentModel.region}`
    : "Select a model layout";
  const matchingOptionCount = select.options.length;
  $("#modelFilterCount").textContent = `${matchingOptionCount} of ${modelCatalog.length} models`;
}

function renderDriveCatalog() {
  const isMouse = selectedDriveCategory === "mouse";
  const entries = isMouse
    ? driveCatalog?.mouseModels || []
    : [
        ...(driveCatalog?.models || []),
        ...(driveCatalog?.specializedKeyboardProfiles || []),
      ];
  const modelLabel = (entry) => isMouse ? entry.model_label : entry.name;
  const filter = String($("#driveModelFilter")?.value || "").trim().toLowerCase();
  const normalizeSearch = (value) => String(value || "")
    .toLowerCase()
    .replace(/0x/g, "")
    .replace(/[^a-z0-9]/g, "");
  const query = normalizeSearch(filter);
  const grouped = new Map();
  entries.forEach((entry) => {
    const label = modelLabel(entry);
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label).push(entry);
  });
  const matchingNames = [...grouped.keys()]
    .filter((name) => {
      if (!query) return true;
      const searchText = grouped.get(name).flatMap((entry) => {
        const vendorHex = entry.vendor_id_hex || `0x${hex4(entry.vendor_id)}`;
        const productHex = entry.product_id_hex || `0x${hex4(entry.product_id)}`;
        const usagePageHex = entry.usage_page_hex || `0x${hex4(entry.usage_page)}`;
        const usageHex = entry.usage_hex || `0x${hex4(entry.usage)}`;
        return [
          modelLabel(entry),
          entry.model_id,
          entry.profile_id,
          entry.uuid,
          entry.chooser_alias_labels,
          entry.image_asset,
          entry.connection,
          entry.device_type,
          entry.protocol_type,
          entry.protocol_family,
          entry.record_type,
          entry.storage_profile_key,
          entry.layout_symbol,
          entry.protocol_factory_symbol,
          entry.web_configurator?.key_layers,
          entry.web_configurator?.key_tables,
          entry.web_configurator?.lighting_effects?.map((effect) => effect.name),
          `${vendorHex}:${productHex}`,
          `${vendorHex} ${productHex}`,
          `${entry.vendor_id} ${entry.product_id}`,
          `${usagePageHex}:${usageHex}`,
          `${entry.usage_page} ${entry.usage}`,
        ];
      }).map(normalizeSearch).join(" ");
      return searchText.includes(query);
    })
    .sort((a, b) => a.localeCompare(b));
  const select = $("#driveModelSelect");
  select.replaceChildren();
  matchingNames.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    const items = grouped.get(name);
    const profileOnly = !isMouse && items.every(
      (entry) => entry.record_type === "specialized_keyboard_model_profile",
    );
    const itemType = isMouse
      ? "mouse connection"
      : profileOnly
        ? "keyboard profile"
        : "keyboard connection";
    option.textContent = `${name} · ${items.length} ${itemType} ${items.length === 1 ? "entry" : "entries"}`;
    select.append(option);
  });
  if (!matchingNames.includes(selectedDriveModel)) {
    const preferred = isMouse ? "CB75-Mouse" : "RK-S98";
    selectedDriveModel = matchingNames.includes(preferred) ? preferred : matchingNames[0] || "";
  }
  select.value = selectedDriveModel;
  if (isMouse) {
    const legacyCount = entries.filter((entry) => entry.record_type === "legacy_mouse_descriptor").length;
    const profileCount = entries.filter((entry) => entry.record_type === "TLW_mouse_model_profile").length;
    $("#driveModelCount").textContent = entries.length
      ? `${legacyCount} legacy mouse descriptors · ${profileCount} CB75 connection rows · ${grouped.size} model labels · snapshot ${String(driveCatalog.retrievedAtUtc || "date unknown").slice(0, 10)}`
      : "Mouse registry metadata is unavailable in this build.";
  } else {
    $("#driveModelCount").textContent = entries.length
      ? `${driveCatalog.descriptorCount || 0} connection descriptors · ${driveCatalog.specializedKeyboardProfileCount || 0} specialized profiles · ${grouped.size} labels · ${driveCatalog.keyboardProductImageReferenceCount || driveCatalog.keyboardImageReferenceCount || 0} product photos · snapshot ${String(driveCatalog.retrievedAtUtc || "date unknown").slice(0, 10)}`
      : "Official model metadata is unavailable in this build.";
  }

  renderDriveModelGallery(grouped, matchingNames, isMouse);

  const selectedEntries = grouped.get(selectedDriveModel) || [];
  const name = $("#driveModelName");
  const summary = $("#driveModelSummary");
  const photo = $("#driveModelPhoto");
  const photoNote = $("#driveModelPhotoNote");
  const layoutAssetLink = $("#driveModelLayoutAsset");
  const connectionList = $("#driveConnectionList");
  const sourceLink = $("#driveModelSource");
  connectionList.replaceChildren();
  if (!selectedEntries.length) {
    name.textContent = "No model selected";
    summary.textContent = isMouse
      ? "Search the public RK Drive registry to browse its listed mouse descriptors."
      : "Search the public RK Drive registry to browse its listed keyboard variants.";
    photo.removeAttribute("src");
    photo.alt = "";
    photoNote.textContent = "Model images load from RK Drive only while this catalog page is open.";
    layoutAssetLink.hidden = true;
    sourceLink.href = "https://drive.rkgaming.com/";
    sourceLink.textContent = "View official RK Drive";
    renderDriveConfiguratorData([]);
    return;
  }

  const representative = selectedEntries[0];
  name.textContent = modelLabel(representative);
  summary.textContent =
    representative.record_type === "specialized_keyboard_model_profile"
      ? `${representative.protocol_type} model profile declared separately from the general keyboard connection registry.`
      : isMouse
        ? `${selectedEntries.length} mouse connection/profile entr${selectedEntries.length === 1 ? "y" : "ies"} declared by the public RK Drive registry.`
        : `${selectedEntries.length} connection descriptor${selectedEntries.length === 1 ? "" : "s"} in the official Web Driver registry.`;
  let imageUrl = null;
  if (representative.image_url) {
    try {
      imageUrl = new URL(representative.image_url);
    } catch (error) {
      imageUrl = null;
    }
  }
  if (imageUrl?.origin === "https://drive.rkgaming.com") {
    sourceLink.href = imageUrl.href;
    sourceLink.textContent = "Open RK-hosted image";
    if (activePage === "drive-catalog") {
      photo.src = imageUrl.href;
      photo.alt = `${modelLabel(representative)} image hosted by RK Drive`;
      photo.onerror = () => {
        photo.removeAttribute("src");
        photoNote.textContent = "RK Drive did not return this image. The local catalog entry is still available.";
      };
      photoNote.textContent = "Image is fetched directly from RK Drive while this page is open; it is not bundled with Keydeck.";
    } else {
      photo.removeAttribute("src");
      photo.alt = "";
      photoNote.textContent = "Open the catalog page to load the image from RK Drive.";
    }
  } else {
    photo.removeAttribute("src");
    photo.alt = "";
    photoNote.textContent = representative.image_url
      ? "Image reference is not on the expected RK Drive host."
      : isMouse
        ? "No product image is declared for this legacy mouse descriptor."
        : "No model image is declared in this registry entry.";
    sourceLink.href = "https://drive.rkgaming.com/";
    sourceLink.textContent = "View official RK Drive";
  }

  const backgroundUrl = representative.background_image_url;
  if (!isMouse && backgroundUrl?.startsWith("https://drive.rkgaming.com/")) {
    layoutAssetLink.href = backgroundUrl;
    layoutAssetLink.textContent = "Open RK68 HE layout background";
    layoutAssetLink.hidden = false;
  } else {
    layoutAssetLink.hidden = true;
    layoutAssetLink.removeAttribute("href");
  }

  selectedEntries.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "drive-connection-entry";
    const connection = document.createElement("span");
    connection.textContent = entry.connection;
    const id = document.createElement("strong");
    id.textContent = `${entry.vendor_id_hex}:${entry.product_id_hex}`;
    const detail = document.createElement("small");
    const usagePage = entry.usage_page_hex || `0x${hex4(entry.usage_page)}`;
    const usage = entry.usage_hex || `0x${hex4(entry.usage)}`;
    const protocol = entry.protocol_type || entry.protocol_family || "unknown";
    const reportSize = entry.reported_size_bytes ? ` · declared data size ${entry.reported_size_bytes} bytes` : "";
    const reportId = entry.hid_report_id ? ` · report ID ${entry.hid_report_id}` : "";
    detail.textContent = `HID usage ${usagePage}:${usage} · ${protocol} protocol${reportSize}${reportId}`;
    item.append(connection, id, detail);
    connectionList.append(item);
  });
  if (isMouse) renderDriveMouseData(selectedEntries);
  else renderDriveConfiguratorData(selectedEntries);
}

function renderDriveModelGallery(grouped, names, isMouse) {
  const gallery = $("#driveModelGallery");
  const count = $("#driveGalleryCount");
  gallery.replaceChildren();
  count.textContent = `${names.length} ${isMouse ? "mouse" : "keyboard"} model labels`;
  if (!names.length) {
    const empty = document.createElement("p");
    empty.className = "micro-note drive-gallery-empty";
    empty.textContent = "No model labels match this search.";
    gallery.append(empty);
    return;
  }

  names.forEach((name) => {
    const entries = grouped.get(name) || [];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "drive-gallery-card";
    button.dataset.driveModel = name;
    button.setAttribute("aria-pressed", String(name === selectedDriveModel));

    const media = document.createElement("span");
    media.className = "drive-gallery-media";
    const imageEntry = entries.find((entry) => {
      try {
        return new URL(entry.image_url).origin === "https://drive.rkgaming.com";
      } catch (error) {
        return false;
      }
    });
    if (imageEntry && activePage === "drive-catalog") {
      const image = document.createElement("img");
      image.src = imageEntry.image_url;
      image.alt = `${name} product image hosted by RK Drive`;
      image.loading = "lazy";
      image.referrerPolicy = "no-referrer";
      image.addEventListener("error", () => {
        image.remove();
        media.classList.add("image-unavailable");
        media.textContent = "Image unavailable";
      }, { once: true });
      media.append(image);
    } else {
      media.classList.add("image-unavailable");
      media.textContent = imageEntry ? "Open catalog to load image" : "No product image listed";
    }

    const details = document.createElement("span");
    details.className = "drive-gallery-details";
    const title = document.createElement("strong");
    title.textContent = name;
    const connections = [...new Set(entries.map((entry) => entry.connection).filter(Boolean))];
    const connectionText = document.createElement("small");
    connectionText.textContent = connections.length ? connections.join(" · ") : "Connection not listed";
    const ids = [...new Set(entries.map((entry) => {
      const vendor = entry.vendor_id_hex || `0x${hex4(entry.vendor_id)}`;
      const product = entry.product_id_hex || `0x${hex4(entry.product_id)}`;
      return `${vendor}:${product}`;
    }))];
    const identity = document.createElement("small");
    identity.className = "drive-gallery-ids";
    identity.textContent = ids.length
      ? `${ids.slice(0, 2).join(" · ")}${ids.length > 2 ? ` · +${ids.length - 2}` : ""}`
      : "No USB identity listed";
    details.append(title, connectionText, identity);
    button.append(media, details);
    gallery.append(button);
  });
}

function renderDriveMouseData(entries) {
  const host = $("#driveConfiguratorCapabilities");
  const note = $("#driveConfiguratorNote");
  host.replaceChildren();
  const entry = entries[0] || {};
  const flags = entry.declared_feature_flags;
  let featureText = "No feature flags listed";
  if (flags) {
    try {
      const parsed = typeof flags === "string" ? JSON.parse(flags) : flags;
      const enabled = Object.entries(parsed || {}).filter(([, value]) => value).map(([key]) => key);
      featureText = enabled.length ? enabled.join(" · ") : "No enabled flags listed";
    } catch (error) {
      featureText = String(flags);
    }
  }
  const facts = [
    ["Protocol family", entry.protocol_family || "Not listed"],
    ["Declared feature flags", featureText],
    ["Profile storage key", entry.storage_profile_key || "Not listed"],
    ["Descriptor type", entry.record_type === "TLW_mouse_model_profile" ? "Model profile expanded to connections" : "Legacy mouse descriptor"],
  ];
  facts.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "drive-config-fact";
    const heading = document.createElement("span");
    heading.textContent = label;
    const detail = document.createElement("strong");
    detail.textContent = value;
    item.append(heading, detail);
    host.append(item);
  });
  note.textContent = "Static public mouse-registry metadata only. Keydeck does not implement mouse settings, report handling, or device writes.";
}

function renderDriveConfiguratorData(entries) {
  const host = $("#driveConfiguratorCapabilities");
  const note = $("#driveConfiguratorNote");
  host.replaceChildren();
  const config = entries[0]?.web_configurator;
  if (!config) {
    const profile = entries.find((entry) => entry.record_type === "specialized_keyboard_model_profile");
    if (!profile) {
      note.textContent = "Configurator details are not available in this catalog snapshot.";
      return;
    }
    const uuidHex = BigInt(profile.uuid).toString(16).toUpperCase();
    const facts = [
      ["Protocol family", profile.protocol_type || "Not listed"],
      ["UUID", `0x${uuidHex}`],
      ["Minimum firmware field", String(profile.min_firmware_version)],
      ["Side light", profile.has_side_light ? "Listed" : "Not listed"],
      ["Hidden keycode entries", String(profile.hidden_keycodes?.length || 0)],
    ];
    facts.forEach(([label, value]) => {
      const item = document.createElement("div");
      item.className = "drive-config-fact";
      const heading = document.createElement("span");
      heading.textContent = label;
      const detail = document.createElement("strong");
      detail.textContent = value;
      item.append(heading, detail);
      host.append(item);
    });
    note.textContent = "Specialized RK68 HE identity/profile fields from RK Drive. Its magnetic-switch pages and data paths remain research-only; Keydeck does not open the device or apply settings.";
    return;
  }

  const effects = Array.isArray(config.lighting_effects)
    ? config.lighting_effects
    : [];
  const facts = [
    ["Key layers", (config.key_layers || []).join(" · ") || "Not listed"],
    ["OS tables", (config.key_tables || []).join(" · ") || "Not listed"],
    ["Layout groups", String(config.layout_group_count || 0)],
    ["Lighting effects", String(effects.length)],
  ];
  facts.forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "drive-config-fact";
    const heading = document.createElement("span");
    heading.textContent = label;
    const detail = document.createElement("strong");
    detail.textContent = value;
    item.append(heading, detail);
    host.append(item);
  });

  if (effects.length) {
    const details = document.createElement("details");
    details.className = "drive-effect-details";
    const summary = document.createElement("summary");
    summary.textContent = "Lighting mode definitions";
    const list = document.createElement("div");
    list.className = "drive-effect-list";
    effects.forEach((effect) => {
      const item = document.createElement("div");
      item.className = "drive-effect-item";
      const name = document.createElement("strong");
      name.textContent = effect.name;
      const controls = [
        effect.speed && "speed",
        effect.brightness && "brightness",
        effect.colorValueDefined && "color value",
        effect.mixColor && "mixColor flag",
      ].filter(Boolean);
      const capabilities = document.createElement("small");
      capabilities.textContent = controls.length
        ? `Declared fields: ${controls.join(" · ")}`
        : "No adjustable fields listed";
      item.append(name, capabilities);
      list.append(item);
    });
    details.append(summary, list);
    host.append(details);
  }
  note.textContent =
    "These are static options declared by RK Drive for this model label. They are informational; Keydeck stores profile data locally and does not apply settings to the keyboard.";
}

function renderKeyboard(host) {
  if (!host) return;
  host.replaceChildren();
  const profile = activeProfile();
  const model = selectedModel();
  const layout = layoutForModel(model);
  const layoutWidth = Number(layout?.width || 0);
  const layoutHeight = Number(layout?.height || 0);
  host.classList.add("keyboard-stage");
  host.style.aspectRatio = `${layoutWidth || 1} / ${layoutHeight || 1}`;
  const keys = layout?.keys || [];
  if (!keys.some((key) => key.id === selectedKey))
    selectedKey = keys[0]?.id || "";
  keys.forEach((descriptor) => {
    const { id, label, x, y, w, h } = descriptor;
    const key = document.createElement("button");
    key.type = "button";
    key.className = "keycap";
    key.textContent = label;
    key.title = `${label} · ${id}`;
    key.dataset.key = id;
    key.style.left = `${(x / layoutWidth) * 100}%`;
    key.style.top = `${(y / layoutHeight) * 100}%`;
    key.style.width = `${(w / layoutWidth) * 100}%`;
    key.style.height = `${(h / layoutHeight) * 100}%`;
    const mapping = activeKeymap(profile)[currentLayer][id];
    if (host.id === "lightingKeyboard") {
      key.classList.add("lighting-keycap");
      key.style.setProperty("--key-light-color", profile.lighting.keyColors[id] || profile.lighting.color);
      if (profile.lighting.keyColors[id]) key.classList.add("has-custom-light");
    }
    if (mapping && mapping.type !== "Default") key.classList.add("mapped");
    if (/shift|ctrl|alt|win|caps|tab|enter|backspace|space|fn/i.test(label))
      key.classList.add("modifier");
    if ((id === selectedKey && activePage === "keys") || (host.id === "lightingKeyboard" && id === selectedLightingKey && activePage === "lighting"))
      key.classList.add("selected");
    if (mapping && mapping.type !== "Default")
      key.title = `${label} → ${mapping.value || mapping.type}`;
    key.addEventListener("click", () => {
      selectedKey = id;
      if (host.id === "keymapKeyboard") return renderAll();
      if (host.id === "lightingKeyboard") {
        selectedLightingKey = id;
        return renderAll();
      }
      setPage("keys");
      renderAll();
    });
    host.append(key);
  });
}

function renderLighting() {
  const model = selectedModel();
  const features = model?.features || {};
  const lighting = activeProfile().lighting;
  const effectSelect = $("#effectSelect");
  const slots = features.lightingModeSlots || [];
  effectSelect.replaceChildren();
  slots.forEach((slot) => {
    const option = document.createElement("option");
    option.value = `mode:${slot}`;
    option.textContent = `Mode slot ${slot}`;
    effectSelect.append(option);
  });
  if (lighting.effect && ![...effectSelect.options].some((option) => option.value === lighting.effect)) {
    const legacy = document.createElement("option");
    legacy.value = lighting.effect;
    legacy.textContent = `Saved label: ${lighting.effect}`;
    effectSelect.append(legacy);
  }
  effectSelect.value = lighting.effect;
  effectSelect.disabled = !features.rgb || !slots.length;
  $("#lightingModeInfo").textContent = features.rgb
    ? `${slots.length} lighting mode slots are listed for this profile. Mode names are not decoded, and values stay local.`
    : "The installed RK profile does not list RGB backlighting for this model.";
  $("#lightingFeatureState").textContent = features.rgb
    ? `${slots.length} mode slots · profile only`
    : "No RGB profile";
  $("#quickLightingControl").hidden = !features.rgb;
  $("#quickEffectControl").hidden = !features.rgb;
  $("#colorPicker").disabled = !features.rgb;
  $("#brightnessRange").disabled = !features.rgb;
  $("#speedRange").disabled = !features.rgb;
  $("#quickBrightness").disabled = !features.rgb;
  $$(".swatch").forEach((swatch) => (swatch.disabled = !features.rgb));
  $("#colorPicker").value = lighting.color;
  $("#colorHex").textContent = lighting.color;
  $("#brightnessRange").value = lighting.brightness;
  $("#brightnessValue").textContent = lighting.brightness + "%";
  $("#quickBrightness").value = lighting.brightness;
  $("#overviewBrightness").textContent = lighting.brightness + "%";
  $("#speedRange").value = lighting.speed;
  $("#speedValue").textContent = lighting.speed + "%";
  $("#lightingDirection").value = lighting.direction;
  $("#mixColorPicker").value = lighting.mixColor;
  const layoutKeys = layoutForModel(model)?.keys || [];
  if (!layoutKeys.some((key) => key.id === selectedLightingKey)) selectedLightingKey = layoutKeys[0]?.id || "";
  const perKeySelect = $("#lightingKeySelect");
  perKeySelect.replaceChildren();
  layoutKeys.forEach((key) => {
    const option = document.createElement("option");
    option.value = key.id;
    option.textContent = `${key.label} · ${key.id}`;
    perKeySelect.append(option);
  });
  perKeySelect.value = selectedLightingKey;
  $("#lightingKeyColor").value = lighting.keyColors[selectedLightingKey] || lighting.color;
  $("#clearLightingKeyColor").disabled = !lighting.keyColors[selectedLightingKey];
  $("#overviewEffect").textContent = lighting.effect.startsWith("mode:")
    ? `Slot ${lighting.effect.slice(5)}`
    : `Saved: ${lighting.effect}`;
  $("#saveLighting").disabled = !features.rgb;
  $$(".swatch").forEach((swatch) =>
    swatch.classList.toggle(
      "active",
      swatch.dataset.color.toUpperCase() === lighting.color.toUpperCase(),
    ),
  );
  renderDriveLightingReference();
  renderKeyboard($("#lightingKeyboard"));
}

function renderEditor() {
  const profile = activeProfile();
  const model = selectedModel();
  const layout = layoutForModel(model);
  const layers = layerEntries(model);
  const layerSelect = $("#layerSelect");
  layerSelect.replaceChildren();
  layers.forEach(({ id, label }) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = label;
    layerSelect.append(option);
  });
  if (!layers.some(({ id }) => id === currentLayer)) currentLayer = "base";
  layerSelect.value = currentLayer;
  const keymap = activeKeymap(profile);
  $("#osTableSelect").value = profile.osTable;
  const mapping = keymap[currentLayer][selectedKey];
  const descriptor = layout?.keys?.find((key) => key.id === selectedKey);
  const label = descriptor?.label || selectedKey;
  $("#selectedKeyName").textContent = label;
  $("#selectedKeycap").textContent = label;
  $("#selectedLayerName").textContent =
    layers.find(({ id }) => id === currentLayer)?.label || LAYER_LABELS[currentLayer];
  $("#actionSelect").value = mapping?.type || "Default";
  $("#actionValue").value = mapping?.value || label;
  $("#actionValueWrap").hidden =
    !mapping || !["Custom", "Macro", "Media"].includes(mapping.type);
  const count = Object.keys(keymap[currentLayer]).length;
  $("#layerSelectCaption").textContent =
    `${layers.length} layer${layers.length === 1 ? "" : "s"} in this model profile`;
  $("#mappingCount").textContent = count
    ? count +
      " remap" +
      (count === 1 ? "" : "s") +
      " in " +
      LAYER_LABELS[currentLayer]
    : "No remaps in " + LAYER_LABELS[currentLayer];
}

function renderAdvanced() {
  const profile = activeProfile();
  const model = selectedModel();
  const layout = layoutForModel(model);
  const layerSelect = $("#behaviorLayerSelect");
  const keySelect = $("#behaviorKeySelect");
  layerSelect.replaceChildren();
  layerEntries(model).forEach(({ id, label }) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = label;
    layerSelect.append(option);
  });
  if (![...layerSelect.options].some((option) => option.value === currentLayer))
    currentLayer = layerSelect.options[0]?.value || "base";
  layerSelect.value = currentLayer;

  const keys = layout?.keys || [];
  keySelect.replaceChildren();
  keys.forEach((key) => {
    const option = document.createElement("option");
    option.value = key.id;
    option.textContent = key.label + " · " + key.id;
    keySelect.append(option);
  });
  if (!keys.some((key) => key.id === selectedKey)) selectedKey = keys[0]?.id || "";
  keySelect.value = selectedKey;

  const behavior = profile.advanced.behaviors[currentLayer]?.[selectedKey] || { mode: "none" };
  $("#behaviorMode").value = behavior.mode || "none";
  $("#dksPrimaryAction").value = behavior.primaryAction || "";
  $("#dksSecondaryAction").value = behavior.secondaryAction || "";
  $("#toggleAction").value = behavior.primaryAction || "";
  $("#modTapTapAction").value = behavior.tapAction || "";
  $("#modTapHoldAction").value = behavior.holdAction || "";
  $("#dksFields").hidden = behavior.mode !== "dks";
  $("#toggleFields").hidden = behavior.mode !== "toggle";
  $("#modTapFields").hidden = behavior.mode !== "mod-tap";

  const socd = profile.advanced.socd;
  $("#socdEnabled").checked = socd.enabled;
  $("#socdPair").value = socd.pair;
  $("#socdResolution").value = socd.resolution;
  $("#snapTapEnabled").checked = profile.advanced.snapTap;
  $("#performanceNote").value = profile.advanced.performanceNote;

  const host = $("#rawPerformanceFields");
  host.replaceChildren();
  const rawOptions = model?.profileData?.options || {};
  const rawFieldNames = ["DebounceUI", "DebounceHW", "DebounceName", "TapRange", "SpeedParam", "LayerMask", "LayerNum"];
  const found = rawFieldNames.filter((field) => Object.hasOwn(rawOptions, field));
  if (!found.length) {
    const empty = document.createElement("p");
    empty.className = "micro-note";
    empty.textContent = "No named performance fields are present in this profile.";
    host.append(empty);
  } else {
    found.forEach((field) => {
      const row = document.createElement("div");
      row.className = "raw-field-row";
      const label = document.createElement("span");
      label.textContent = field;
      const value = document.createElement("code");
      value.textContent = String(rawOptions[field]);
      row.append(label, value);
      host.append(row);
    });
  }
}

function renderDriveLightingReference() {
  const lighting = activeProfile().lighting;
  const modelSelect = $("#driveLightingModelSelect");
  const effectSelect = $("#driveLightingEffectSelect");
  const labels = [...new Set((driveCatalog?.models || []).map((entry) => entry.name))].sort((a, b) => a.localeCompare(b));
  modelSelect.replaceChildren();
  labels.forEach((label) => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    modelSelect.append(option);
  });
  const chosenModel = labels.includes(lighting.driveReferenceModel)
    ? lighting.driveReferenceModel
    : labels.includes(selectedDriveModel)
      ? selectedDriveModel
      : labels.includes("RK-S98")
        ? "RK-S98"
        : labels[0] || "";
  modelSelect.value = chosenModel;
  const entries = (driveCatalog?.models || []).filter((entry) => entry.name === chosenModel);
  const effects = entries.find((entry) => entry.web_configurator?.lighting_effects)?.web_configurator?.lighting_effects || [];
  effectSelect.replaceChildren();
  effects.forEach((effect) => {
    const option = document.createElement("option");
    option.value = effect.name;
    option.textContent = effect.name;
    effectSelect.append(option);
  });
  const chosenEffect = effects.some((effect) => effect.name === lighting.driveReferenceEffect)
    ? lighting.driveReferenceEffect
    : effects[0]?.name || "";
  if (lighting.driveReferenceEffect && !effects.some((effect) => effect.name === lighting.driveReferenceEffect)) {
    const option = document.createElement("option");
    option.value = lighting.driveReferenceEffect;
    option.textContent = "Saved label: " + lighting.driveReferenceEffect;
    effectSelect.append(option);
  }
  effectSelect.value = chosenEffect || lighting.driveReferenceEffect;
  effectSelect.disabled = effects.length === 0;
  const effect = effects.find((item) => item.name === effectSelect.value);
  const controls = [
    effect?.speed && "speed",
    effect?.brightness && "brightness",
    effect?.colorValueDefined && "color value",
    effect?.mixColor && "mixColor",
  ].filter(Boolean);
  $("#driveLightingEffectInfo").textContent = effect
    ? (controls.length ? "Declared controls: " + controls.join(" · ") : "No adjustable fields listed") + " · local reference only"
    : "No lighting effect definitions are listed for this model label.";
}

function renderScreen() {
  const model = selectedModel();
  const screenSpec = model?.features?.screen;
  const screen = activeProfile().screen;
  const previewUrl = screenPreviewUrls.get(activeProfile().id);
  const previewWrap = $("#screenPreviewWrap");
  const preview = $("#screenPreview");
  previewWrap.hidden = !previewUrl;
  if (previewUrl) {
    if (preview.src !== previewUrl) preview.src = previewUrl;
    $("#screenPreviewNote").textContent = "Preview uses the selected local file in this window. The image bytes are not added to profile JSON or sent to the keyboard.";
  } else {
    preview.removeAttribute("src");
    $("#screenPreviewNote").textContent = "Re-select the media file to preview it after reopening Keydeck; only its name and dimensions are saved in the profile.";
  }
  $("#screenBrightness").value = screen.brightness;
  $("#screenBrightnessValue").textContent = screen.brightness + "%";
  $("#screenClock").checked = screen.clock;
  const asset = screen.assetName;
  $("#screenAssetState").textContent = asset || "No display asset selected";
  $("#screenAssetName").textContent = asset || "Choose PNG, JPG or GIF";
  $("#screenAssetDimensions").textContent = asset
    ? screen.width + " × " + screen.height + " pixels · local metadata"
    : "Files are inspected locally in your browser.";
  $("#screenTransferTitle").textContent = asset || "No display asset selected";
  $("#screenTransferText").textContent = asset
    ? "Asset metadata is stored in this profile. The image file stays on this PC and has not been transferred."
    : "Asset metadata stays local. The image is not uploaded and is not sent to the keyboard.";
  $("#screenPageTitle").textContent = screenSpec
    ? `${screenSpec.width} × ${screenSpec.height} display settings`
    : "No display in this profile";
  $("#screenOverviewSize").textContent = screenSpec
    ? `${screenSpec.width} × ${screenSpec.height}`
    : "No display listed";
  $("#screenPageDescription").textContent = screenSpec
    ? `Store display preferences for ${model.name}. Assets stay on this PC; no data is sent to the keyboard.`
    : "The installed RK profile does not list a screen for this model.";
  $("#screenSpecBadge").textContent = screenSpec
    ? `${screenSpec.width} × ${screenSpec.height}${screenSpec.maxFrames ? ` · ${screenSpec.maxFrames} frame cap` : ""}`
    : "NO DISPLAY PROFILE";
  $("#screenResolution").textContent = screenSpec
    ? `${screenSpec.width} × ${screenSpec.height}`
    : "Not listed";
  $("#screenFrameLimit").textContent = screenSpec?.maxFrames
    ? `${screenSpec.maxFrames} frames`
    : "Not listed";
  $("#screenFeatureCard").hidden = !screenSpec;
  $("#page-screen").hidden = !screenSpec;
  $("#screenNavButton").hidden = !screenSpec;
  $("#screenTransport").textContent = identifiedDevice
    ? "Descriptor only · no report opened"
    : "No device selected";
  $("#saveScreen").disabled = !screenSpec;
}

function renderKnob() {
  const profile = activeProfile();
  const model = selectedModel();
  const hasDial = model?.family === "S98";
  const modes = connectionChoices(model);
  $("#knobControls").hidden = !hasDial;
  $("#knobHardwareLabel").textContent = hasDial
    ? "Rotary dial preferences"
    : "No dial control is listed for this model";
  $("#connectionMode").replaceChildren();
  modes.forEach((mode) => {
    const option = document.createElement("option");
    option.value = mode.value;
    option.textContent = mode.label;
    $("#connectionMode").append(option);
  });
  const modeCards = $("#connectionModeCards");
  modeCards.replaceChildren();
  modes.forEach((mode) => {
    const card = document.createElement("div");
    const active = mode.value === profile.connection;
    card.innerHTML = `<strong>${escapeHtml(mode.label)}</strong><small>${active ? "Selected profile value" : "Profile option"}</small>`;
    modeCards.append(card);
  });
  const selectedMode = modes.some((mode) => mode.value === profile.connection)
    ? profile.connection
    : modes[0]?.value || "USB-C";
  $("#knobRotate").value = profile.knob.rotate;
  $("#knobPress").value = profile.knob.press;
  $("#knobLongPress").value = profile.knob.longPress;
  $("#connectionMode").value = selectedMode;
  $("#connectionModeState").textContent = modes.length > 1
    ? `${modes.length} profile preferences · no physical mode switch`
    : "Only USB identity is listed for this model";
  $("#connectionFeatureSummary").textContent = modes.length > 1
    ? modes.slice(1).map((mode) => mode.label).join(" · ")
    : "USB identity only · other modes unknown";
  $("#triModeCard").hidden = modes.length < 2;
  $("#smartDisplayFeature").hidden = !model?.features?.screen;
  $("#rotaryFeature").hidden = !hasDial;
  $("#saveKnob").disabled = !hasDial;
}

function connectionChoices(model) {
  if (model?.family === "S98")
    return [
      { value: "USB-C", label: "USB-C wired" },
      { value: "2.4 GHz", label: "2.4 GHz receiver" },
      { value: "Bluetooth 1", label: "Bluetooth slot 1" },
      { value: "Bluetooth 2", label: "Bluetooth slot 2" },
      { value: "Bluetooth 3", label: "Bluetooth slot 3" },
    ];
  const name = String(model?.name || "").toLowerCase();
  const modes = [{ value: "USB-C", label: "USB wired" }];
  if (/three.?mode|tri.?mode|3.?mode/.test(name)) {
    modes.push(
      { value: "2.4 GHz", label: "2.4 GHz receiver" },
      { value: "Bluetooth 1", label: "Bluetooth" },
    );
  } else if (model?.features?.wirelessProductId) {
    modes.push({ value: "2.4 GHz", label: "Wireless receiver (catalog PID)" });
  } else if (/bluetooth|\bbt\b/.test(name)) {
    modes.push({ value: "Bluetooth 1", label: "Bluetooth" });
  }
  return modes;
}

function migrateLegacyMappings() {
  let changed = false;
  const aliases = {
    Tilde: ["`", "~"],
    Print: ["PrtSc", "Print"],
    Scroll: ["ScrLock", "Scroll", "Scr"],
    Pause: ["Pause", "Pau"],
    Insert: ["Insert", "Ins"],
    PageUp: ["PgUp"],
    PageDown: ["PgDn"],
    NumDivide: ["Num /", "Num/"],
    NumMultiply: ["Num*", "Num *"],
    NumMinus: ["Num-"],
    NumPlus: ["Num+"],
    NumPlus2: ["Num+"],
    NumDecimal: ["Num .", "Num."],
    LeftShift: ["LShift"],
    RightShift: ["RShift"],
    LeftCtrl: ["LCtrl"],
    RightCtrl: ["RCtrl"],
    LeftWin: ["LWin"],
    LeftAlt: ["LAlt"],
    RightAlt: ["RAlt"],
    Fn: ["FN", "Fn"],
    Menu: ["App", "Menu"],
  };
  state.profiles.forEach((profile) => {
    const layout = layoutForModel(modelByCode(profile.modelCode));
    if (!layout?.keys?.length) return;
    const keysByLabel = new Map();
    layout.keys.forEach((key) => {
      const normalized = key.label.toLowerCase().replace(/\s+/g, "").trim();
      if (!keysByLabel.has(normalized)) keysByLabel.set(normalized, []);
      keysByLabel.get(normalized).push(key);
    });
    Object.values(profile.keymaps || { Windows: profile.layers }).forEach((table) => {
      Object.values(table).forEach((layerMap) => {
        Object.entries(layerMap).forEach(([oldId, mapping]) => {
        if (layout.keys.some((key) => key.id === oldId)) return;
        const legacy = KEY_ROWS.flat().find(([id]) => id === oldId);
        if (!legacy) return;
        const labels = aliases[oldId] || [legacy[1]];
        const candidates = labels.flatMap((label) =>
          keysByLabel.get(label.toLowerCase().replace(/\s+/g, "").trim()) || [],
        );
        if (!candidates.length) return;
        let target = candidates[0];
        if (/^Num/.test(oldId)) target = candidates.find((key) => /^Num/i.test(key.label)) || candidates.at(-1);
        if (oldId === "NumEnter" || oldId === "NumEnter2")
          target = candidates.find((key) => key.x > layout.width * 0.82) || candidates.at(-1);
        if (layerMap[target.id]) return;
        layerMap[target.id] = mapping;
        delete layerMap[oldId];
        changed = true;
        });
      });
    });
  });
  if (changed) saveState();
}

function renderMacros() {
  const list = $("#macroList");
  list.replaceChildren();
  const profile = activeProfile();
  const macroBuffers = selectedModel()?.features?.macroBuffers || 0;
  $("#macroCapability").textContent = macroBuffers
    ? `This RK profile lists ${macroBuffers} macro buffers. Keydeck keeps sequences local and does not write them.`
    : "This model profile does not specify macro buffer capacity. Sequences remain local in Keydeck.";
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
    const stepCount = macro.steps.length || macro.sequence.split(/\r?\n/).filter(Boolean).length;
    item.innerHTML =
      "<strong>" +
      escapeHtml(macro.name) +
      "</strong><small>" +
      stepCount +
      " steps</small>";
    item.addEventListener("click", () => {
      selectedMacroId = macro.id;
      renderMacros();
    });
    list.append(item);
  }
  const selected = profile.macros.find((macro) => macro.id === selectedMacroId);
  $("#exportMacro").disabled = !selected;
  $("#macroName").value = selected?.name || "";
  $("#macroSequence").value = selected?.sequence || "";
  const stepList = $("#macroStepList");
  stepList.replaceChildren();
  (selected?.steps || []).forEach((step, index) => {
    const row = document.createElement("div");
    row.className = "macro-step-row";
    const summary = document.createElement("span");
    summary.textContent = (index + 1) + ". " + step.kind + (step.action ? " · " + step.action : "") + (step.delayMs ? " · " + step.delayMs + " ms" : "");
    const actions = document.createElement("div");
    actions.className = "macro-step-actions";
    [["up", "Up"], ["down", "Down"], ["delete", "Remove"]].forEach(([action, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "text-button";
      button.dataset.stepAction = action;
      button.dataset.stepIndex = String(index);
      button.textContent = label;
      button.disabled = action === "up" ? index === 0 : action === "down" ? index === selected.steps.length - 1 : false;
      actions.append(button);
    });
    row.append(summary, actions);
    stepList.append(row);
  });
  $("#macroLoopMode").value = selected?.loop?.mode || "none";
  $("#macroLoopCount").value = selected?.loop?.count || 1;
  $("#macroStepActionWrap").hidden = $("#macroStepKind").value === "delay";
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
      escapeHtml(model?.name || "RK model profile") +
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
  identityMatch = connected ? deviceModelMatch(device) : null;
  const match = identityMatch;
  const displayModelName = match?.model?.name || match?.driveProfile?.name;
  if (match?.model && activeProfile().modelCode !== match.model.code) {
    activeProfile().modelCode = match.model.code;
    saveState();
  }
  const lampText = connected ? "RK HID device detected" : "No keyboard detected";
  $("#sidebarDeviceState").textContent = lampText;
  $("#sidebarDeviceName").textContent = displayModelName || descriptorName(device) || deviceIdLabel(device) || "Choose a model";
  $("#sidebarDeviceId").textContent = connected
    ? `VID:PID ${hex4(device.vendorId)}:${hex4(device.productId)} · descriptor only`
    : "USB device access is off";
  $("#devicePillText").textContent = connected
    ? displayModelName || "RK keyboard detected · model unresolved"
    : "Not identified";
  $("#deviceIdentity").textContent = connected
    ? "Browser permission granted. This app reads the USB/HID descriptor only; HID reports are not opened or exchanged."
    : "Identify a keyboard to inspect its USB identity. The app will not open or exchange HID reports.";
  $("#deviceIdValue").textContent = connected
    ? hex4(device.vendorId) + ":" + hex4(device.productId)
    : "—";
  $("#diagName").textContent = connected
    ? descriptorName(device) || "Unavailable (invalid descriptor text)"
    : "Not identified";
  $("#diagVendor").textContent = connected ? "0x" + hex4(device.vendorId) : "—";
  $("#diagProduct").textContent = connected
    ? "0x" + hex4(device.productId)
    : "—";
  $("#diagCollections").textContent = connected
    ? String(device.collections?.length || 0)
    : "—";
  $("#diagCollectionTypes").textContent = connected
    ? [...new Set((device.collections || []).map(collectionKind))].join(", ") || "Not reported"
    : "—";
  $$("#sidebarLamp,#deviceLamp").forEach((lamp) =>
    lamp.classList.toggle("connected", connected),
  );
  const callout = $("#supportCallout");
  const method = match?.kind === "product-id"
    ? "USB product ID"
    : match?.kind === "product-name"
      ? "USB product name"
      : match?.kind === "specialized-profile"
        ? "VID/PID and HID collection; profile UUID not read"
      : "";
  if (!connected) {
    $("#diagProfile").textContent = "None";
    callout.innerHTML =
      "<strong>No device access granted</strong><p>Identify a keyboard to compare its descriptors with the 188 model profiles in this project.</p>";
  } else if (match?.model) {
    $("#diagProfile").textContent = `${match.model.name} · ${method}`;
    callout.innerHTML =
      `<strong>Model match: ${escapeHtml(match.model.name)}</strong><p>Matched by ${escapeHtml(method)} against profile ${escapeHtml(match.model.code)}. The app has not opened a HID report.</p>`;
  } else if (match?.driveProfile) {
    $("#diagProfile").textContent = `${match.driveProfile.name} · descriptor candidate`;
    callout.innerHTML =
      `<strong>${escapeHtml(match.driveProfile.name)} descriptor candidate</strong><p>VID/PID and HID collection match this RK Drive profile. RK's web app performs an additional UUID check; Keydeck does not read that UUID or open a HID report.</p>`;
  } else if (match?.candidates?.length) {
    const shown = match.candidates.slice(0, 4).map((model) => model.name);
    const names = shown.join(", ") +
      (match.candidates.length > shown.length ? ` and ${match.candidates.length - shown.length} more` : "");
    const reason = match.kind === "receiver-id"
      ? `Product ID 0x${hex4(device.productId)} is listed as a receiver ID for ${escapeHtml(names)}. Receiver IDs can be shared.`
      : `The device name is not specific enough to distinguish ${escapeHtml(names)}.`;
    $("#diagProfile").textContent = "Several model profiles";
    callout.innerHTML =
      `<strong>RK keyboard detected; model is not unique</strong><p>${reason} Choose the correct model profile below; the app will show its layout without probing the keyboard.</p>`;
  } else {
    $("#diagProfile").textContent = "No catalog match";
    callout.innerHTML =
      "<strong>RK keyboard detected; model unresolved</strong><p>This USB identity does not uniquely match the installed model catalog. Choose the correct model profile to display its layout. No report probe was run.</p>";
  }
  $("#lightingDeviceState").textContent = connected
    ? `${hex4(device.vendorId)}:${hex4(device.productId)}`
    : "Not identified";
  $("#deviceModelState").textContent = match?.model
    ? `${match.model.name} · matched by ${method}`
    : match?.driveProfile
      ? `${match.driveProfile.name} · descriptor candidate; UUID unverified`
    : connected
      ? "Model unresolved · choose a profile below"
      : "No keyboard selected";
  const driveMatches = driveDescriptors(device);
  const driveLabels = [...new Set(driveMatches.map((entry) => entry.name))];
  $("#webCatalogDeviceMatch").textContent = !connected
    ? "No device selected"
    : driveLabels.length === 1
      ? `Candidate: ${driveLabels[0]} · descriptor match`
      : driveLabels.length > 1
        ? `${driveLabels.length} candidate labels · see catalog`
        : "No exact ID row in this Web Driver snapshot";
  renderAuthorizedDevices();
  $("#screenTransport").textContent = connected
    ? "Descriptor only · no report opened"
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

function descriptorName(device) {
  const name = String(device?.productName || "").trim();
  // WebHID product names can be malformed on some receivers. Keep those bytes
  // out of the UI and avoid presenting mojibake as a model identification.
  return /^[\x20-\x7E]{2,80}$/.test(name) ? name : "";
}

function deviceIdLabel(device) {
  return device
    ? `RK HID device ${hex4(device.vendorId)}:${hex4(device.productId)}`
    : "";
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
      filters: supportedVendorIds().map((vendorId) => ({ vendorId })),
    });
    if (!devices.length) return;
    authorizedDevices = [
      ...new Map(
        [...authorizedDevices, ...devices].map((device) => [deviceKey(device), device]),
      ).values(),
    ];
    setDeviceStatus(devices[0]);
    renderAll();
    showToast(identityMatch?.model
      ? `${identityMatch.model.name} matched from the USB descriptor.`
      : identityMatch?.driveProfile
        ? `${identityMatch.driveProfile.name} is a descriptor candidate; profile UUID was not read.`
      : "RK keyboard identified. Choose a model profile; no HID report was opened.");
  } catch (error) {
    if (error && error.name === "NotFoundError") return;
    showToast("The browser could not identify that device.");
  }
}

function deviceKey(device) {
  return `${device.vendorId}:${device.productId}:${device.productName || ""}:${device.serialNumber || ""}`;
}

function renderAuthorizedDevices() {
  const select = $("#deviceSelect");
  const wrap = $("#deviceSelectWrap");
  if (!select || !wrap) return;
  select.replaceChildren();
  authorizedDevices.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${descriptorName(device) || "RK HID device"} · ${hex4(device.vendorId)}:${hex4(device.productId)}`;
    select.append(option);
  });
  wrap.hidden = authorizedDevices.length < 2;
  const activeIndex = authorizedDevices.findIndex(
    (device) => deviceKey(device) === (identifiedDevice && deviceKey(identifiedDevice)),
  );
  if (activeIndex >= 0) select.value = String(activeIndex);
}

async function scanAuthorizedDevices() {
  if (!navigator.hid?.getDevices) return;
  try {
    authorizedDevices = (await navigator.hid.getDevices()).filter(
      (device) => supportedVendorIds().includes(Number(device.vendorId)),
    );
    if (authorizedDevices.length) setDeviceStatus(authorizedDevices[0]);
    else setDeviceStatus(null);
    renderAll();
  } catch (error) {
    console.warn("Could not inspect previously authorized HID descriptors.");
  }
}

function renderAll() {
  state.profiles = state.profiles.map(normalizeProfile);
  const model = selectedModel();
  if (model && !layerEntries(model).some(({ id }) => id === currentLayer))
    currentLayer = "base";
  renderProfileSelect();
  renderModelSelect();
  renderDriveCatalog();
  renderModelFeatures();
  renderKeyboard($("#deviceKeyboard"));
  renderKeyboard($("#keymapKeyboard"));
  renderLighting();
  renderEditor();
  renderAdvanced();
  renderScreen();
  renderKnob();
  renderMacros();
  renderProfiles();
  if (identifiedDevice) setDeviceStatus(identifiedDevice);
  renderDeviceAppearance();
}

function renderModelFeatures() {
  const model = selectedModel();
  const features = model?.features || {};
  const summary = $("#modelFeatureSummary");
  summary.replaceChildren();
  const items = [
    `${model?.keyCount || "?"} key profile`,
    `${features.layers?.length || 1} layer${features.layers?.length === 1 ? "" : "s"}`,
  ];
  if (features.rgb)
    items.push(`${features.lightingModeSlots?.length || 0} RGB mode slots`);
  if (features.screen)
    items.push(`Display ${features.screen.width} × ${features.screen.height}`);
  if (features.macroBuffers)
    items.push(`${features.macroBuffers} macro buffers`);
  if (features.wirelessProductId)
    items.push(`Receiver ID ${features.wirelessProductId}`);
  if (model?.family === "S98") items.push("Rotary dial");
  items.forEach((text) => {
    const chip = document.createElement("span");
    chip.className = "feature-chip";
    chip.textContent = text;
    summary.append(chip);
  });
  $("#lightingNavButton").disabled = !features.rgb;
  $("#lightingNavButton").title = features.rgb
    ? "Edit local lighting preferences"
    : "No RGB backlight is listed for this model";
  if (!features.screen && activePage === "screen") setPage("device");
  if (!features.rgb && activePage === "lighting") setPage("device");
}

function setPage(page) {
  const model = selectedModel();
  if (page === "screen" && !model?.features?.screen) {
    showToast("This model profile does not list a keyboard display.");
    page = "device";
  }
  if (page === "lighting" && !model?.features?.rgb) {
    showToast("This model profile does not list RGB backlighting.");
    page = "device";
  }
  activePage = page;
  renderDriveCatalog();
  $$(".page").forEach((section) =>
    section.classList.toggle("active", section.id === "page-" + page),
  );
  $$(".nav-item").forEach((button) =>
    button.classList.toggle("active", button.dataset.page === page),
  );
  const titles = {
    device: "Device",
    keys: "Key map",
    advanced: "Advanced behavior",
    lighting: "Lighting",
    screen: "Smart display",
    knob: "Controls & modes",
    macros: "Macros",
    profiles: "Profiles",
    diagnostics: "Device info",
    "drive-catalog": "RK model catalog",
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
  macro.loop = {
    mode: $("#macroLoopMode").value,
    count: bounded($("#macroLoopCount").value, 1, 99),
  };
  saveState("Macro saved to this profile.");
  renderMacros();
}

function exportSelectedMacro() {
  const macro = activeProfile().macros.find((entry) => entry.id === selectedMacroId);
  if (!macro) return showToast("Choose a macro to export.");
  const slug = macro.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "macro";
  downloadJson(`keydeck-${slug}.json`, { format: "keydeck-macro-v1", macro });
}

async function importMacroFile(file) {
  if (!file) return;
  if (file.size > 1024 * 1024) {
    showToast("Macro JSON must be smaller than 1 MB.");
    return;
  }
  try {
    const parsed = JSON.parse((await file.text()).replace(/^\uFEFF/, ""));
    const candidate = parsed.macro || parsed.profile?.macros?.[0] || parsed.macros?.[0] || parsed;
    if (!candidate || typeof candidate !== "object") throw new Error("macro missing");
    const imported = normalizeProfile({ macros: [candidate] }).macros[0];
    imported.id = makeId();
    imported.name = (imported.name || "Imported macro").slice(0, 40) + " import";
    activeProfile().macros.push(imported);
    selectedMacroId = imported.id;
    saveState("Macro imported into this local profile.");
    renderMacros();
  } catch (error) {
    showToast("That file is not a valid Keydeck macro or profile JSON.");
  }
}

function addStructuredMacroStep() {
  const macro = activeProfile().macros.find((entry) => entry.id === selectedMacroId);
  if (!macro) return showToast("Create a macro first.");
  const kind = $("#macroStepKind").value;
  const action = $("#macroStepAction").value.trim().slice(0, 100);
  if (kind !== "delay" && !action) return showToast("Enter an action label for this step.");
  macro.steps.push({
    id: makeId(),
    kind,
    action: kind === "delay" ? "" : action,
    delayMs: bounded($("#macroStepDelay").value, 0, 60000),
  });
  $("#macroStepAction").value = "";
  $("#macroStepDelay").value = "0";
  saveState("Structured step saved locally.");
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
    if (!event.target.value) return;
    activeProfile().modelCode = event.target.value;
    saveState("Model profile saved.");
    renderAll();
  });
  $("#modelFilter").addEventListener("input", renderModelSelect);
  $("#driveCatalogType").addEventListener("change", (event) => {
    selectedDriveCategory = event.target.value === "mouse" ? "mouse" : "keyboard";
    selectedDriveModel = "";
    renderDriveCatalog();
  });
  $("#driveModelFilter").addEventListener("input", renderDriveCatalog);
  $("#driveModelSelect").addEventListener("change", (event) => {
    selectedDriveModel = event.target.value;
    renderDriveCatalog();
  });
  $("#driveModelGallery").addEventListener("click", (event) => {
    const card = event.target.closest("[data-drive-model]");
    if (!card) return;
    selectedDriveModel = card.dataset.driveModel;
    renderDriveCatalog();
    $("#driveModelCard").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#deviceSelect").addEventListener("change", (event) => {
    const device = authorizedDevices[Number(event.target.value)];
    if (device) {
      setDeviceStatus(device);
      renderAll();
    }
  });
  $("#layerSelect").addEventListener("change", (event) => {
    currentLayer = event.target.value;
    renderAll();
  });
  $("#osTableSelect").addEventListener("change", (event) => {
    activeProfile().osTable = event.target.value === "macOS" ? "macOS" : "Windows";
    saveState("Operating-system key table selected.");
    renderAll();
  });
  $("#behaviorLayerSelect").addEventListener("change", (event) => {
    currentLayer = event.target.value;
    renderAll();
  });
  $("#behaviorKeySelect").addEventListener("change", (event) => {
    selectedKey = event.target.value;
    renderAll();
  });
  $("#behaviorMode").addEventListener("change", () => {
    const mode = $("#behaviorMode").value;
    $("#dksFields").hidden = mode !== "dks";
    $("#toggleFields").hidden = mode !== "toggle";
    $("#modTapFields").hidden = mode !== "mod-tap";
  });
  $("#saveAdvancedBehavior").addEventListener("click", () => {
    const profile = activeProfile();
    const mode = $("#behaviorMode").value;
    const byLayer = profile.advanced.behaviors[currentLayer] || (profile.advanced.behaviors[currentLayer] = {});
    if (mode === "none") {
      delete byLayer[selectedKey];
    } else {
      byLayer[selectedKey] = {
        mode,
        primaryAction: mode === "dks" ? $("#dksPrimaryAction").value.trim() : mode === "toggle" ? $("#toggleAction").value.trim() : "",
        secondaryAction: mode === "dks" ? $("#dksSecondaryAction").value.trim() : "",
        tapAction: mode === "mod-tap" ? $("#modTapTapAction").value.trim() : "",
        holdAction: mode === "mod-tap" ? $("#modTapHoldAction").value.trim() : "",
      };
    }
    saveState("Behavior draft saved to this profile.");
    renderAdvanced();
  });
  $("#clearAdvancedBehavior").addEventListener("click", () => {
    delete activeProfile().advanced.behaviors[currentLayer]?.[selectedKey];
    saveState("Behavior draft cleared.");
    renderAdvanced();
  });
  $("#socdEnabled").addEventListener("change", (event) => {
    activeProfile().advanced.socd.enabled = event.target.checked;
    saveState("SOCD draft updated.");
  });
  $("#socdPair").addEventListener("change", (event) => {
    activeProfile().advanced.socd.pair = event.target.value;
    saveState();
  });
  $("#socdResolution").addEventListener("change", (event) => {
    activeProfile().advanced.socd.resolution = event.target.value;
    saveState();
  });
  $("#snapTapEnabled").addEventListener("change", (event) => {
    activeProfile().advanced.snapTap = event.target.checked;
    saveState("Snap Tap draft updated.");
  });
  $("#performanceNote").addEventListener("input", (event) => {
    activeProfile().advanced.performanceNote = event.target.value.slice(0, 1000);
    saveState();
  });
  $("#actionSelect").addEventListener("change", () => {
    $("#actionValueWrap").hidden = !["Custom", "Macro", "Media"].includes(
      $("#actionSelect").value,
    );
  });
  $("#saveKeyMapping").addEventListener("click", () => {
    const type = $("#actionSelect").value;
    const keymap = activeKeymap();
    if (type === "Default")
      delete keymap[currentLayer][selectedKey];
    else
      keymap[currentLayer][selectedKey] = {
        type,
        value: ["Custom", "Macro", "Media"].includes(type)
          ? $("#actionValue").value.trim()
          : "",
      };
    saveState("Key assignment saved to this profile.");
    renderAll();
  });
  $("#clearKeyMapping").addEventListener("click", () => {
    delete activeKeymap()[currentLayer][selectedKey];
    saveState("Key assignment reset.");
    renderAll();
  });
  $("#effectSelect").addEventListener("change", (event) => {
    activeProfile().lighting.effect = event.target.value;
    saveState();
    renderAll();
  });
  $("#driveLightingModelSelect").addEventListener("change", (event) => {
    const lighting = activeProfile().lighting;
    lighting.driveReferenceModel = event.target.value;
    const entry = (driveCatalog?.models || []).find((item) => item.name === event.target.value && item.web_configurator?.lighting_effects);
    lighting.driveReferenceEffect = entry?.web_configurator?.lighting_effects?.[0]?.name || "";
    saveState("RK Drive effect reference saved.");
    renderLighting();
  });
  $("#driveLightingEffectSelect").addEventListener("change", (event) => {
    activeProfile().lighting.driveReferenceEffect = event.target.value;
    saveState("RK Drive effect reference saved.");
    renderDriveLightingReference();
  });
  $("#colorPicker").addEventListener("input", (event) => {
    activeProfile().lighting.color = event.target.value.toUpperCase();
    saveState();
    renderLighting();
    renderDeviceAppearance();
  });
  $("#colorSwatches").addEventListener("click", (event) => {
    const swatch = event.target.closest("[data-color]");
    if (swatch) {
      activeProfile().lighting.color = swatch.dataset.color.toUpperCase();
      saveState();
      renderLighting();
      renderDeviceAppearance();
    }
  });
  $("#mixColorPicker").addEventListener("input", (event) => {
    activeProfile().lighting.mixColor = event.target.value.toUpperCase();
    saveState();
  });
  $("#lightingDirection").addEventListener("change", (event) => {
    activeProfile().lighting.direction = event.target.value;
    saveState("Lighting direction preference saved locally.");
  });
  $("#lightingKeySelect").addEventListener("change", (event) => {
    selectedLightingKey = event.target.value;
    renderLighting();
  });
  $("#lightingKeyColor").addEventListener("input", (event) => {
    if (!selectedLightingKey) return;
    activeProfile().lighting.keyColors[selectedLightingKey] = event.target.value.toUpperCase();
    saveState();
    renderLighting();
  });
  $("#clearLightingKeyColor").addEventListener("click", () => {
    if (!selectedLightingKey) return;
    delete activeProfile().lighting.keyColors[selectedLightingKey];
    saveState("Per-key color reset to the base color.");
    renderLighting();
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
    if (file.size > 25 * 1024 * 1024) {
      showToast("Choose a local image under 25 MB for the preview.");
      event.target.value = "";
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const profile = activeProfile();
      profile.screen.assetName = file.name.slice(0, 180);
      profile.screen.width = bitmap.width;
      profile.screen.height = bitmap.height;
      bitmap.close();
      const oldUrl = screenPreviewUrls.get(profile.id);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      screenPreviewUrls.set(profile.id, URL.createObjectURL(file));
      saveState("Local media preview ready. File bytes were not uploaded or saved in the profile.");
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
      steps: [],
      loop: { mode: "none", count: 1 },
    };
    activeProfile().macros.push(macro);
    selectedMacroId = macro.id;
    saveState("Macro created.");
    renderMacros();
  });
  $("#macroStepKind").addEventListener("change", (event) => {
    $("#macroStepActionWrap").hidden = event.target.value === "delay";
  });
  $("#addMacroStep").addEventListener("click", addStructuredMacroStep);
  $("#macroStepList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-step-action]");
    if (!button) return;
    const macro = activeProfile().macros.find((entry) => entry.id === selectedMacroId);
    if (!macro) return;
    const index = Number(button.dataset.stepIndex);
    const action = button.dataset.stepAction;
    if (action === "delete") macro.steps.splice(index, 1);
    else {
      const nextIndex = action === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= macro.steps.length) return;
      [macro.steps[index], macro.steps[nextIndex]] = [macro.steps[nextIndex], macro.steps[index]];
    }
    saveState("Timeline updated.");
    renderMacros();
  });
  $("#macroLoopMode").addEventListener("change", (event) => {
    const macro = activeProfile().macros.find((entry) => entry.id === selectedMacroId);
    if (!macro) return;
    macro.loop.mode = event.target.value;
    saveState("Loop intent saved locally.");
  });
  $("#macroLoopCount").addEventListener("change", (event) => {
    const macro = activeProfile().macros.find((entry) => entry.id === selectedMacroId);
    if (!macro) return;
    macro.loop.count = bounded(event.target.value, 1, 99);
    event.target.value = macro.loop.count;
    saveState("Loop count saved locally.");
  });
  $("#saveMacro").addEventListener("click", saveMacro);
  $("#exportMacro").addEventListener("click", () => {
    saveMacro();
    exportSelectedMacro();
  });
  $("#importMacro").addEventListener("click", () => $("#macroFile").click());
  $("#macroFile").addEventListener("change", async (event) => {
    await importMacroFile(event.target.files?.[0]);
    event.target.value = "";
  });
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
    {
      navigator.hid.addEventListener("connect", (event) => {
        if (!supportedVendorIds().includes(Number(event.device.vendorId))) return;
        if (!authorizedDevices.some((device) => deviceKey(device) === deviceKey(event.device)))
          authorizedDevices.push(event.device);
        setDeviceStatus(event.device);
        renderAll();
      });
      navigator.hid.addEventListener("disconnect", (event) => {
        authorizedDevices = authorizedDevices.filter(
          (device) => deviceKey(device) !== deviceKey(event.device),
        );
        if (identifiedDevice && deviceKey(event.device) === deviceKey(identifiedDevice)) {
          const next = authorizedDevices[0] || null;
          setDeviceStatus(next);
          renderAll();
          showToast(next ? "Selected the next authorized RK device." : "Keyboard disconnected.");
        } else {
          renderAuthorizedDevices();
        }
      });
    }
}

async function loadModelCatalog() {
  try {
    const response = await fetch("models.json", { cache: "no-store" });
    if (!response.ok) throw new Error("catalog unavailable");
    const catalog = await response.json();
    modelCatalog = Array.isArray(catalog) ? catalog : catalog.models || [];
    modelLayouts = Array.isArray(catalog) ? {} : catalog.layouts || {};
  } catch (error) {
    modelCatalog = [];
    modelLayouts = {};
  }
  try {
    const response = await fetch("rk-drive-catalog.json", { cache: "no-store" });
    if (!response.ok) throw new Error("RK Drive metadata unavailable");
    driveCatalog = await response.json();
    if (!Array.isArray(driveCatalog.models)) driveCatalog = null;
  } catch (error) {
    driveCatalog = null;
  }
  try {
    const response = await fetch("model-appearance.json", { cache: "no-store" });
    if (!response.ok) throw new Error("appearance catalog unavailable");
    const catalog = await response.json();
    appearanceCatalog = {
      variants: Array.isArray(catalog.variants)
        ? catalog.variants.filter((entry) => entry && typeof entry.id === "string" && officialImageUrl(entry.imageUrl))
        : [],
    };
  } catch (error) {
    appearanceCatalog = { variants: [] };
  }
  migrateLegacyMappings();
  renderAll();
  scanAuthorizedDevices();
}

wireEvents();
renderAll();
loadModelCatalog();
