const abfEnabled = document.getElementById("abf-enabled")! as HTMLInputElement;
const abfFilterRefiner = document.getElementById("abf-filter-refiner")! as HTMLInputElement;
const abfFilterRefinerHide = document.getElementById("abf-filter-refiner-hide")! as HTMLInputElement;
const abfFilterRefinerGrey = document.getElementById("abf-filter-refiner-grey")! as HTMLInputElement;
const abfAllowRefineBypass = document.getElementById("abf-allow-refine-bypass")! as HTMLInputElement;
const abfDebugMode = document.getElementById("abf-debug-mode")! as HTMLInputElement;
const abfPersonalBlockText = document.getElementById("abf-personal-block-text")! as HTMLTextAreaElement;
const abfPersonalBlockButton = document.getElementById("abf-personal-block-button")! as HTMLButtonElement;
const abfVersion = document.getElementById("abf-version")! as HTMLSpanElement;
const abfPersonalBlockSavedConfirm = document.getElementById("abf-personal-block-saved-confirm")! as HTMLSpanElement;
const versionNumber = document.getElementById("version-number")! as HTMLSpanElement;
const brandCount = document.getElementById("brand-count")! as HTMLSpanElement;
const lastRun = document.getElementById("last-run")! as HTMLSpanElement;

const setPopupBoxStates = () => {
  console.log("AmazonBrandFilter: Setting Popup Box States");
  chrome.storage.local.get().then((settings) => {
    console.log("AmazonBrandFilter: abfSettings is " + JSON.stringify(settings));
    if (settings.enabled) {
      console.log("AmazonBrandFilter: abfSettings.enabled is enabled");
      abfEnabled.checked = true;
    } else {
      console.log("AmazonBrandFilter: abfSettings is not enabled");
      abfEnabled.checked = false;
    }

    if (settings.filterRefiner) {
      console.log("AmazonBrandFilter: abfSettings.filterRefiner is enabled");
      abfFilterRefiner.checked = true;
    } else {
      console.log("AmazonBrandFilter: abfSettings.filterRefiner is not enabled");
      abfFilterRefiner.checked = false;
    }

    if (settings.refinerBypass) {
      console.log("AmazonBrandFilter: abfSettings.filterRefiner is enabled");
      abfAllowRefineBypass.checked = true;
    } else {
      console.log("AmazonBrandFilter: abfSettings.filterRefiner is not enabled");
      abfAllowRefineBypass.checked = false;
    }

    if (settings.refinerMode == "grey") {
      console.log("AmazonBrandFilter: abfSettings.refinerMode is grey");
      abfFilterRefinerGrey.checked = true;
      abfFilterRefinerHide.checked = false;
    } else {
      console.log("AmazonBrandFilter: abfSettings.refinerMode is hide");
      abfFilterRefinerHide.checked = true;
      abfFilterRefinerGrey.checked = false;
    }
    setIcon();
    versionNumber.innerText = settings.brandsVersion;
    brandCount.innerText = settings.brandsCount;
    if (settings.lastMapRun != null) {
      lastRun.innerText = settings.lastMapRun + "ms";
    } else {
      lastRun.innerText = "N/A";
    }

    if (settings.debugMode) {
      console.log("AmazonBrandFilter: abfSettings.debugMode is enabled");
      abfDebugMode.checked = true;
    }
  });
};

const setAddonVersion = () => {
  const manifest = chrome.runtime.getManifest();
  abfVersion.innerText = "v" + manifest.version;
};

const setIcon = async () => {
  await chrome.storage.local.get("enabled").then((result) => {
    console.log("AmazonBrandFilter: abfSettings.enabled bool eval: " + JSON.stringify(result.enabled));
    if (result.enabled == true) {
      console.log("AmazonBrandFilter: setting icon to enabled");
      chrome.action.setIcon({
        path: {
          48: "icons/abf-enabled-128.png",
        },
      });
    } else {
      console.log("AmazonBrandFilter: setting icon to disabled");
      chrome.action.setIcon({
        path: {
          48: "icons/abf-disabled-128.png",
        },
      });
    }
  });
};

const setPersonalList = async () => {
  const personalBrands = await chrome.storage.sync.get("personalBrands");
  const personalBrandsMap = personalBrands.personalBrands;

  if (!personalBrandsMap) {
    console.log("AmazonBrandFilter: personalBrandsMap is undefined");
    return;
  }
  console.log("AmazonBrandFilter: personalBrandsMap is: " + JSON.stringify(personalBrandsMap));
  if (!personalBrandsMap) {
    return;
  }

  console.log("personalbrandmap keys are: " + Object.keys(personalBrandsMap));
  const textValue = Object.keys(personalBrandsMap);
  let textHeight = Object.keys(personalBrandsMap).length;
  if (textHeight > 10) {
    textHeight = 10;
    abfPersonalBlockText.style.overflow = "scroll";
  }

  console.log("AmazonBrandFilter: setting personal block list text area to: " + textValue);
  abfPersonalBlockText.value = textValue.join("\n");
  abfPersonalBlockText.rows = textHeight;
};

const getCurrentTab = () => {
  console.log("AmazonBrandFilter: Starting getCurrentTab");
  const tab = chrome.tabs.query({ currentWindow: true, active: true });
  return tab;
};

const enableDisable = async (_event: Event) => {
  if (abfEnabled.checked) {
    chrome.storage.local.set({ enabled: true });
  } else {
    const tab = await getCurrentTab();
    console.log(tab);
    chrome.storage.local.set({ enabled: false });
  }

  chrome.storage.local.get("enabled").then((result) => {
    console.log("enabled: " + result.enabled);
  });
  setIcon();
};

const setFilterRefiner = (_event: Event) => {
  if (abfFilterRefiner.checked) {
    chrome.storage.local.set({ filterRefiner: true });
  } else {
    chrome.storage.local.set({ filterRefiner: false });
  }

  chrome.storage.local.get("filterRefiner").then((result) => {
    console.log("filterRefiner: " + result.filterRefiner);
  });
};

const setRefinerHide = (_event: Event) => {
  if (abfFilterRefinerHide.checked) {
    chrome.storage.local.set({ refinerMode: "hide" });
    abfFilterRefinerGrey.checked = false;
  } else {
    chrome.storage.local.set({ refinerMode: "grey" });
  }

  chrome.storage.local.get("refinerMode").then((result) => {
    console.log("refinerMode: " + result.refinerMode);
  });
};

const setRefinerGrey = (_event: Event) => {
  if (abfFilterRefinerGrey.checked) {
    chrome.storage.local.set({ refinerMode: "grey" });
    abfFilterRefinerHide.checked = false;
  } else {
    chrome.storage.local.set({ refinerMode: "hide" });
  }

  chrome.storage.local.get("refinerMode").then((result) => {
    console.log("refinerMode: " + result.refinerMode);
  });
};

const setRefinerBypass = (_event: Event) => {
  if (abfAllowRefineBypass.checked) {
    chrome.storage.local.set({ refinerBypass: true });
  } else {
    chrome.storage.local.set({ refinerBypass: false });
  }

  chrome.storage.local.get("refinerBypass").then((result) => {
    console.log("refinerBypass: " + result.refinerBypass);
  });
};

const setDebugMode = (_event: Event) => {
  if (abfDebugMode.checked) {
    chrome.storage.local.set({ debugMode: true });
  } else {
    chrome.storage.local.set({ debugMode: false });
  }

  chrome.storage.local.get("debugMode").then((result) => {
    console.log("debugMode: " + result.debugMode);
  });
};

const getSanitizedUserInput = () => {
  const userInput = abfPersonalBlockText.value.split("\n");
  console.log(userInput);
  const sanitizedInput = [];
  for (const line of userInput) {
    if (line == "" || line == " " || line == "\n" || line == "\r\n" || line == "\r") {
      continue;
    }
    sanitizedInput.push(line);
  }
  return sanitizedInput;
};

const savePersonalList = () => {
  const userInput = getSanitizedUserInput();
  const personalBrandsMap = new Map();
  for (const brand of userInput) {
    console.log("AmazonBrandFilter: adding brand: " + brand);
    personalBrandsMap.set(brand, true);
  }
  console.log("AmazonBrandFilter: personalBrandsMap is: " + JSON.stringify(personalBrandsMap));
  chrome.storage.sync.set({ personalBrands: personalBrandsMap });
  abfPersonalBlockSavedConfirm.style.display = "block";
};

setPopupBoxStates();
setAddonVersion();
setPersonalList();

abfEnabled.addEventListener("click", enableDisable);
abfFilterRefiner.addEventListener("click", setFilterRefiner);
abfFilterRefinerHide.addEventListener("click", setRefinerHide);
abfFilterRefinerGrey.addEventListener("click", setRefinerGrey);
abfAllowRefineBypass.addEventListener("click", setRefinerBypass);
abfDebugMode.addEventListener("click", setDebugMode);
abfPersonalBlockButton.addEventListener("click", savePersonalList);

export {}; // for index.ts
