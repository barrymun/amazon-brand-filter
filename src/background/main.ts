import { MessageType } from "utils/config";
import { Message } from "utils/types";

chrome.action.onClicked.addListener((tab) => {
  console.log("action clicked");
  if (!tab.id) {
    return;
  }
  const message: Message = { type: MessageType.actionClicked };
  try {
    chrome.tabs.sendMessage(tab.id, message);
  } catch (e) {
    // no-op
  }
});
