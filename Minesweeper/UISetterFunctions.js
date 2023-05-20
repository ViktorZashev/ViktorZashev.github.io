//
// UI Setter and Timer Functions
//
var Module = (function () {

    var privateMethod = function () { };

    return {
        publicStartTimer: startTimer,
        publicStopTimer: stopTimer,
        setBombs: setBombs,
        setFlags: setFlags,
    };

})();

let timeInSeconds = 0;
let timerIsStopped = false;
let specialEffect = false;

function startTimer() {
    console.log(`Timer started!`)
    timerEl = document.querySelector("#topbar-time .label__text");
    let [milliseconds, seconds, minutes] = [0, 0, 0];
    let int = null;
    if (int !== null) {
        clearInterval(int);
    }
    int = setInterval(displayTimer, 100);

    function displayTimer() {
        if (timerIsStopped) {
            clearInterval(int);
        }
        if (specialEffect) {
            seconds = timeInSeconds % 60;
            minutes = Math.floor(timeInSeconds / 60);
        }
        milliseconds += 100;
        if (milliseconds == 1000) {
            milliseconds = 0;
            seconds++;
            if (seconds == 60) {
                seconds = 0;
                minutes++;
                if (minutes == 60) {
                    minutes = 0;
                    console.log(`Too slow`)
                }
            }
        }
        timeInSeconds = minutes * 60 + seconds;
        let m = minutes < 10 ? `0` + minutes : minutes;
        let s = seconds < 10 ? `0` + seconds : seconds;
        timerEl.innerHTML = `${m}:${s}`;
    }
    
}

function stopTimer() {
    console.log(`Timer stopped!`)
    timerIsStopped = true;
    printTimer();
}

function printTimer() {
    let minutes = Math.floor(timeInSeconds / 60);
    let seconds = timeInSeconds % 60;
    let m = minutes < 10 ? `0` + minutes : minutes;
    let s = seconds < 10 ? `0` + seconds : seconds;
    console.log(`${m}:${s}`);
}


function setGold() {
    console.log(`Gold is set: ${goldCount}`)
    var score_El = document.querySelector("#topbar-score .label__text");
    score_El.innerHTML = goldCount.toString().padStart(9, '0');
}
function setBombs() {
    console.log(`Bombs are set: ${minesCount}`)
    let bombs_El = document.querySelector(`#topbar-bombs .label__text--x`);
    bombs_El.innerHTML = minesCount.toString().padStart(2, '0');
}
function setFlags() {
    console.log(`Flags are set: ${remainingFlags}`)
    let flags_El = document.querySelector(`#topbar-flags .label__text--x`);
    flags_El.innerHTML = remainingFlags.toString().padStart(2, '0');
}
function setRadars() {
    console.log(`Radars are set: ${inventory.radarCount}`)
    let radars_El = document.querySelector(`#radar .label__text--x`);
    radars_El.innerHTML = inventory.radarCount.toString().padStart(1, '0');
}
function setHealth() {
    console.log(`Health is set: ${health}`)
    let healthValue_El = document.querySelector(`#footer-health .label__text`);
    healthValue_El.innerHTML = health.toString();
    let healthProgress_El = document.querySelector(`#footer-health .label__fill`);
    healthProgress_El.style.width = health / maxHealth * 100 + "%";
}


function setUICounters() {
    startTimer();
    setHealth(health);
    setGold(goldCount);
    setBombs(minesCount);
    setFlags(remainingFlags);
    setRadars(inventory);
}
function setWinScore(score) {
    var winScoreEl = document.getElementById("showScore");
    winScoreEl.innerHTML = score.toString().padStart(9, '0');
}