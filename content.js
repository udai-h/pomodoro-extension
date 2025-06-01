let interval = null;
let isPaused = false;

// create bar if there are no bar
function createBarIfNeeded() {
  let bar = document.getElementById("pomodoro-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "pomodoro-bar";
    document.body.appendChild(bar);
    bar.style.width = "0%";
  }
  return bar;
}

// remove bar if bar exists
function removeBarIfExists() {
  const bar = document.getElementById("pomodoro-bar");
  if (bar) bar.remove();
}

// start timer
function startPomodoro(startTime) {
  const DURATION = 25 * 60 * 1000;
  const bar = createBarIfNeeded();

  if (interval) clearInterval(interval);

  interval = setInterval(() => {
    if (isPaused) return;

    const elapsed = Date.now() - startTime;
    const percent = Math.min((elapsed / DURATION) * 100, 100);
    bar.style.width = percent + "%";

    if (elapsed >= DURATION) {
      // stop timer
      clearInterval(interval);
      // reset status by removing from storage
      chrome.storage.local.remove("pomodoroStartedAt");
      removeBarIfExists();
    }
  }, 200);
}

// check initial condition
chrome.storage.local.get(["pomodoroStartedAt", "pausedAt"], (data) => {
  isPaused = !!data.pausedAt;
  // start if it is not on progress/paused
  if (data.pomodoroStartedAt && !isPaused) {
    startPomodoro(data.pomodoroStartedAt);
  }
});

// check change of storage status
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if ("pausedAt" in changes) {
    isPaused = !!changes.pausedAt.newValue;
  }

  if ("pomodoroStartedAt" in changes) {
    const newStart = changes.pomodoroStartedAt.newValue;

    if (newStart) {
      startPomodoro(newStart);
    } else {
      clearInterval(interval);
      removeBarIfExists();
    }
  }
});
