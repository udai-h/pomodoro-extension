chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getStartTime") {
    chrome.storage.local.get("pomodoroStartedAt", (data) => {
      sendResponse({ pomodoroStartedAt: data.pomodoroStartedAt });
    });
    return true;
  }
});
