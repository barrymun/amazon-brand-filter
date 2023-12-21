import { ActionController } from "content/action-controller";
import { MessageType, actionContainerId, actionContainerClosedStyle } from "utils/config";
import { State } from "utils/state";

let actionController: ActionController | undefined;

let isInserted: boolean = false;

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
  document.body.appendChild(actionContainer);

  // set up the controllers
  actionController = new ActionController(state);

  window.addEventListener("unload", function (_event) {
    console.log("UNLOADED");
  });
};

handleInsert();

// listen for messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (!actionController) return;
  actionController.toggleVisibility();
  sendResponse(MessageType.actionClickedResponse); // synchronously
});
