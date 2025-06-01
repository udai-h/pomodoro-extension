const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

startBtn.addEventListener("click", () => {
  chrome.storage.local.get(
    ["pomodoroStartedAt", "pomodoroState", "pausedAt"],
    (data) => {
      const alreadyRunning = data.pomodoroStartedAt && !data.pausedAt;
      if (alreadyRunning) return window.close();

      // if it is paused, resume
      // otherwise start new
      const init = {
        pomodoroState: "work",
        pomodoroStartedAt: Date.now(),
        cycleCount: 0,
        pausedAt: null,
        from: null,
      };
      chrome.storage.local.set(init, () => window.close());
    }
  );
});

// PAUSE
pauseBtn.addEventListener("click", () =>
  chrome.storage.local.set({ pausedAt: Date.now() }, () => window.close())
);

// RESET
resetBtn.addEventListener("click", () =>
  chrome.storage.local.remove(
    ["pomodoroState", "pomodoroStartedAt", "pausedAt", "cycleCount", "from"],
    () => window.close()
  )
);
