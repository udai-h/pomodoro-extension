document.getElementById("startBtn").addEventListener("click", () => {
  chrome.storage.local.set({ pomodoroStartedAt: Date.now() }, () => {
    console.log("Pomodoro started");
  });
});
