document.getElementById("startBtn").addEventListener("click", () => {
  chrome.storage.local.get(["pomodoroStartedAt", "pausedAt"], (data) => {
    // if it is already started, nothing will be done
    if (data.pomodoroStartedAt && !data.pausedAt) {
      window.close();
      return;
    }

    // if it is paused, resume
    if (data.pausedAt) {
      const delta = Date.now() - data.pausedAt;
      const newStart = data.pomodoroStartedAt + delta;
      chrome.storage.local.set({ pomodoroStartedAt: newStart }, () => {
        chrome.storage.local.remove("pausedAt", () => window.close());
      });
      return;
    }

    // newly start
    chrome.storage.local.set(
      { pomodoroStartedAt: Date.now(), pausedAt: null },
      () => window.close()
    );
  });
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  chrome.storage.local.set({ pausedAt: Date.now() }, () => window.close());
});

document.getElementById("resetBtn").addEventListener("click", () => {
  chrome.storage.local.remove(["pomodoroStartedAt", "pausedAt"], () =>
    window.close()
  );
});
