import { ActionController } from "content/action-controller";
import { MessageType, actionContainerId, actionContainerClosedStyle, actionIframeStyle } from "utils/config";
import { sleep } from "utils/helpers";
import { State } from "utils/state";

let actionController: ActionController | undefined;
let isInserted: boolean = false;

// listen for messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (!actionController) return;
  actionController.toggleVisibility();
  sendResponse(MessageType.actionClickedResponse); // synchronously
});

const handleInsert = () => {
  // if the div has already been added, do nothing
  if (isInserted) {
    return;
  }
  // immediately set to true to prevent multiple elements from being added
  isInserted = true;

  const state = new State();

  // append the elements to the DOM
  const actionContainer = document.createElement("div");
  actionContainer.setAttribute("id", actionContainerId);
  actionContainer.setAttribute("style", actionContainerClosedStyle);

  const actionIframe = document.createElement("iframe");
  actionIframe.setAttribute("src", chrome.runtime.getURL("action.html"));
  actionIframe.setAttribute("style", actionIframeStyle);

  actionContainer.appendChild(actionIframe);
  document.body.appendChild(actionContainer);

  // set up the controllers
  actionController = new ActionController(state);

  window.addEventListener("unload", function (_event) {
    console.log("UNLOADED");
  });
};

handleInsert();

const checkBrandFilter = (): boolean => {
  return false;
};

const getItemDivs = (): HTMLCollectionOf<HTMLDivElement> => {
  console.log("AmazonBrandFilter: Starting getItemDivs");
  const divs = document.getElementsByClassName("s-result-item");
  return divs as HTMLCollectionOf<HTMLDivElement>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const descriptionSearch = (settings: any, div: HTMLDivElement) => {
  const shortText = div.getElementsByClassName("a-color-base a-text-normal") as HTMLCollectionOf<HTMLDivElement>;
  if (shortText.length == 0) {
    return;
  }
  console.debug("AmazonBrandFilter: Checking " + div.innerText);
  const fullText = shortText[0].innerText.toUpperCase();
  console.log("AmazonBrandFilter: Full text is " + fullText);
  const wordList = fullText.replace(", ", ",").split(" ").slice(0, 8);

  for (let w = 0; w < settings.maxWordCount; w++) {
    for (let x = 0; x < wordList.length; x++) {
      const searchTerm = wordList.slice(x, w).join(" ");
      console.debug("AmazonBrandFilter: searchTerm is: " + searchTerm);
      if (settings.brandsMap[searchTerm]) {
        // check to see if each word is in the map.  if we dont stop then we hide it.
        console.log("AmazonBrandFilter: Found " + searchTerm + " in brands list");
        if (settings.debugMode) {
          div.style.backgroundColor = "green";
          // eslint-disable-next-line max-len
          div.innerHTML =
            "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " +
            searchTerm +
            "</span><br>" +
            div.innerHTML;
        }
        return;
      }
    }
  }
  console.debug("AmazonBrandFilter: Hiding " + fullText);
  if (settings.debugMode) {
    div.style.backgroundColor = "red";
  } else {
    div.style.display = "none";
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterRefiner = (settings: any) => {
  console.log("AmazonBrandFilter: Starting filterRefiner");
  const refiner = document.getElementById("brandsRefinements");
  if (!refiner) {
    return;
  }
  const divs = refiner.getElementsByClassName("a-spacing-micro") as HTMLCollectionOf<HTMLDivElement>;

  console.log("AmazonBrandFilter: Refiner contains " + divs.length + " brands");
  for (let i = 0; i < divs.length; i++) {
    console.debug("AmazonBrandFilter: Checking Refiner " + divs[i].className);

    const brand = (
      divs[i].getElementsByClassName("a-size-base a-color-base") as HTMLCollectionOf<HTMLDivElement>
    )[0].innerText.toUpperCase();
    if (brand.length == 0) {
      continue;
    }

    console.debug("AmazonBrandFilter: settings.brandsMap[" + brand + "] is: " + settings.brandsMap[brand]);
    if (!settings.brandsMap[brand]) {
      console.debug("AmazonBrandFilter: Hiding Refiner " + brand);
      if (settings.debugMode) {
        divs[i].style.backgroundColor = "red";
      } else {
        if (settings.refinerMode == "grey") {
          divs[i].getElementsByClassName("a-size-base a-color-base")[0].setAttribute("style", "color:grey !important");
        } else {
          divs[i].style.display = "none";
        }
      }
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const filterBrands = async (settings: any) => {
  console.log("AmazonBrandFilter: Starting filterBrands");
  const brands = settings.brandsMap;
  // brandsGet.then(function(brands){
  console.log("AmazonBrandFilter: Brands are " + brands);
  if (brands.length != 0) {
    console.log("AmazonBrandFilter: Brands found");
  } else {
    console.log("AmazonBrandFilter: No brands found");
    return;
  }

  console.log("AmazonBrandFilter: refinerBypass is " + settings.refinerBypass);
  if (settings.refinerBypass) {
    if (checkBrandFilter()) {
      console.log("AmazonBrandFilter: Brand filter is checked, not filtering");
      return;
    }
  }

  const divs = getItemDivs();
  console.log("AmazonBrandFilter: maxWordCount is " + settings.maxWordCount);
  for (let i = 0; i < divs.length; i++) {
    const itemHeader = divs[i].getElementsByClassName("s-line-clamp-1") as HTMLCollectionOf<HTMLDivElement>;
    if (itemHeader.length != 0) {
      const searchTerm = itemHeader[0].innerText.toUpperCase();
      if (settings.brandsMap[searchTerm]) {
        // check to see if each word is in the map.  if we dont stop then we hide it.
        console.log("AmazonBrandFilter: Found " + " in brands list");
        if (settings.debugMode) {
          divs[i].style.backgroundColor = "green";
          // eslint-disable-next-line max-len
          divs[i].innerHTML =
            "<span style='color: black; background-color: white;font-size: large;'>ABF DEBUG: " +
            searchTerm +
            "</span><br>" +
            divs[i].innerHTML;
        }
        continue;
      } else {
        console.debug("AmazonBrandFilter: Hiding " + searchTerm);
        if (settings.debugMode) {
          divs[i].style.backgroundColor = "red";
        } else {
          divs[i].style.display = "none";
        }
        continue;
      }
    }

    const shortText = divs[i].getElementsByClassName("a-color-base a-text-normal") as HTMLCollectionOf<HTMLDivElement>;
    if (shortText.length == 0) {
      continue;
    }
    console.debug("AmazonBrandFilter: Checking " + divs[i].innerText);
    const fullText = shortText[0].innerText.toUpperCase();
    console.log("AmazonBrandFilter: Full text is " + fullText);
    await descriptionSearch(settings, divs[i]);
  }

  if (settings.filterRefiner) {
    console.log("AmazonBrandFilter: filterRefiner is true, filtering refiner");
    await filterRefiner(settings);
  }
};

const _abfSettings = chrome.storage.local.get().then((settings) => {
  console.log("AmazonBrandFilter: settings are: " + JSON.stringify(settings));
  console.log("AmazonBrandFilter: abfSettings.enabled bool eval: " + settings.enabled);
  if (settings.enabled) {
    console.log("AmazonBrandFilter: abf is enabled");
    let previousUrl = "";
    const observer = new MutationObserver((_mutations) => {
      if (location.href !== previousUrl) {
        previousUrl = location.href;
        console.log(`URL data changed to ${location.href}`);
        sleep(1000).then(() => {
          const timerStart = performance.now();
          filterBrands(settings);
          //filterBrandsByList(settings);
          const timerEnd = performance.now();
          console.log(`AmazonBrandFilter: filterBrands took ${timerEnd - timerStart} milliseconds.`);
          chrome.storage.local.set({ lastMapRun: timerEnd - timerStart });
        });
      }
    });

    const config = { attributes: true, childList: true, subtree: true };
    observer.observe(document, config);
  } else {
    console.log("AmazonBrandFilter: abf is disabled");
  }
});
