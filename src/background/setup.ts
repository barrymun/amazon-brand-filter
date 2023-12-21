import { sleep } from "utils/helpers";

async function getFirstRun() {
  const result = await chrome.storage.local.get("abfFirstRun");
  console.log("AmazonBrandFilter: first run status is: " + result.abfFirstRun);
  return result.abfFirstRun;
}

const setIcon = async () => {
  const enabled = await chrome.storage.local.get("abf-enabled");
  if (enabled) {
    chrome.action.setIcon({
      path: {
        48: "icons/abf-enabled-128.png",
      },
    });
  } else {
    chrome.action.setIcon({
      path: {
        48: "icons/abf-disabled-128.png",
      },
    });
  }
};

const updateBrandMap = async () => {
  console.log("AmazonBrandFilter: Starting updateBrandList");

  const brandsUrl = "https://raw.githubusercontent.com/chris-mosley/AmazonBrandFilterList/main/brands.txt";
  let brandsGet: string[] = [];
  try {
    brandsGet = await fetch(brandsUrl, { mode: "cors" })
      .then((response) => response.text())
      .then((text) => text.toUpperCase())
      .then((text) => text.split("\n"));
  } catch (err) {
    console.error("AmazonBrandFilter: Error downloading brands list");
    return;
  }
  let brandsMap = {};
  for (let i = 0; i < brandsGet.length; i++) {
    console.debug("AmazonBrandFilter: Adding " + brandsGet[i] + " to brands list");
    // protect against possible empty lines in the list
    if (brandsGet[i] !== "") {
      brandsMap = {
        ...brandsMap,
        [brandsGet[i]]: true,
      };
    }
  }

  console.log("AmazonBrandFilter: Brands count is " + brandsGet.length);

  chrome.storage.local.set({ brandsMap: brandsMap });

  const keys = Object.keys(brandsMap);
  let maxWordCount = 0;
  for (let i = 0; i < keys.length; i++) {
    if (keys[i].split(" ").length > maxWordCount) {
      maxWordCount = keys[i].split(" ").length;
    }
  }
  chrome.storage.local.set({ maxWordCount: maxWordCount });
  console.log("AmazonBrandFilter: Max brand word count is " + maxWordCount);
  console.log("AmazonBrandFilter: Brands are " + keys);
  chrome.storage.local.set({ brandsCount: keys.length });
};

const checkBrandsVersion = async () => {
  console.log("AmazonBrandFilter: Checking latest brands list version");
  // let currentVersion = await getCurrentBrandsVersion();
  const currentVersion = 0;
  const latestReleaseUrl = "https://api.github.com/repos/chris-mosley/AmazonBrandFilterList/releases/latest";
  const latestRelease = await fetch(latestReleaseUrl, { mode: "cors" }).then((response) => response.json());
  const latestVersion = parseInt(latestRelease.tag_name.slice(1));

  console.log("AmazonBrandFilter: Latest brands list version is " + latestVersion);
  console.log("AmazonBrandFilter: Current brands list version is " + currentVersion);

  if (currentVersion != latestVersion) {
    console.log("AmazonBrandFilter: Downloading latest brands list");
    try {
      // updateBrandList();
      updateBrandMap();
    } catch (err) {
      console.error("AmazonBrandFilter: Error downloading brands list");
      return;
    }
    chrome.storage.local.set({ brandsVersion: latestVersion });
  }

  console.log("AmazonBrandFilter: background.js sleeping for one day");
  await sleep(86400000);
  checkBrandsVersion();
};

export const initialise = async () => {
  console.log("AmazonBrandFilter: Starting initialise");
  // set the default values for the extension
  if (await getFirstRun()) {
    console.log("AmazonBrandFilter: First run, setting defaults");
    chrome.storage.local.set({ enabled: true });
    chrome.storage.local.set({ brandsVersion: 0 });
    chrome.storage.local.set({ brandsCount: 0 });
    chrome.storage.local.set({ brandsMap: {} });
    chrome.storage.local.set({ refinerBypass: true });
    chrome.storage.local.set({ abfFirstRun: false });
  } else {
    console.log("AmazonBrandFilter: Not first run");
  }

  // set the icon the first time the extension is loaded
  setIcon();
  // Start checking for updates
  checkBrandsVersion();
};
