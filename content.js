const bar = document.createElement("div");
bar.id = "pomodoro-bar";
document.body.appendChild(bar);
bar.style.width = "0%";

function startPomodoro(startTime) {
  const DURATION = 10 * 1000;
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const percent = Math.min((elapsed / DURATION) * 100, 100);
    bar.style.width = percent + "%";

    if (elapsed >= DURATION) {
      clearInterval(interval);
      console.log("Pomodoro completed.");
    }
  }, 1000);
}

chrome.runtime.sendMessage({ type: "getStartTime" }, (response) => {
  if (response?.pomodoroStartedAt) {
    startPomodoro(response.pomodoroStartedAt);
  }
});
