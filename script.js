//
// Minesweeper Script file
//

var x;
var y;
var minesCount;
var minesMaxCount;
var chestCount;
var undiscoveredMines;
var goldCount = 0;
var remainingFlags;
var health;
var maxHealth = 100;
var inventory = { radarCount: 3 };
var minefield = [[], []];
var lockGame = false;
var isFullScreen = false;
var timerEl, minefieldEl, fullscreenLinkEl;
var level = "rock"; // level preset, do not change for demo
var fireflyCount = 15; //max 15
var revealedCount = 0;
var cellsToReveal = 0;
var audio = 0;
var radarIsActive = false;
var music = new Audio('./assets/sound/8-bit-dream-land-142093.mp3');
var cellRevealed = new Audio('./assets/sound/click.wav');
var explosion = new Audio('./assets/sound/explosion.wav');
var powerupPickup = new Audio('./assets/sound/pickupCoin.wav');
var winSound = new Audio('./assets/sound/crowd-cheer-ii-6263.mp3');
var loseSound = new Audio('./assets/sound/loseSound.mp3');
var radarSound = new Audio('./assets/sound/sonar-ping-95840.mp3')

function init(level) {
    minefieldEl = document.querySelector("#minefield");
    if (level == "rock") {
        x = 10;
        y = 10;
        chestCount = 7;
        minesCount = 40;
        minesMaxCount = minesCount;
        undiscoveredMines = minesCount;
        health = 100;
        remainingFlags = 40;
    }
    setUICounters();
    /*disableInspect();*/ //Disabling inspect
    let minefieldRowStyle = "";
    let minefieldColumnStyle = "";
    let isColumnAdded = false;
    for (var i = 0; i < x; i++) {
        minefieldRowStyle += "64px ";
        minefield.push([]);
        for (var j = 0; j < y; j++) {
            if (!isColumnAdded) {
                minefieldColumnStyle += "64px ";
            }
            var cellEl = document.createElement("div");
            cellEl.classList.add("cell");
            var chestEl = document.createElement("div");
            chestEl.classList.add("chest");
            var contentEl = document.createElement("div");
            contentEl.classList.add("content");
            var tileEl = document.createElement("div");
            tileEl.classList.add("tile");
            tileEl.classList.add("animated");
            var flagEl = document.createElement("div");
            flagEl.classList.add("flag");
            var backgroundEl = document.createElement("div");
            backgroundEl.classList.add("background");
     
            cellEl.setAttribute("data-x", i);
            cellEl.setAttribute("data-y", j);
            cellEl.appendChild(chestEl);
            cellEl.appendChild(contentEl);
            cellEl.appendChild(tileEl);
            cellEl.appendChild(flagEl);
            cellEl.appendChild(backgroundEl);
            minefieldEl.appendChild(cellEl);
            minefield[i][j] = cell(i, j);

        }
        isColumnAdded = true;
    }

    minefieldSetup();
    normalOrSidesOnly();

    minefieldEl.style.gridTemplateRows = minefieldRowStyle;
    minefieldEl.style.gridTemplateColumns = minefieldColumnStyle;
}
function cell(row, column) {
    var selector = '.cell[data-x="' + row + '"][data-y="' + column + '"]';
    var cellObj = {};
    cellObj.isMine = 0; // normal - 0; bomb - 1; special bomb - 2
    cellObj.isChest = 0; // normal - 0; gold - 1; radar - 2; health - 3; time - 4...
    cellObj.isRevealed = false;
    cellObj.isFlagged = false;
    cellObj.nearMines = 0;
    cellObj.nearMinesSides = 0;
    cellObj.cellType = "normal"; // "sidesOnly"
    cellObj.x = row;
    cellObj.y = column;
    cellObj.visited = false;
    cellObj.locked = false;
    cellObj.El = document.querySelector(selector);
    //cellObj.isInfected = false;
    //cellObj.hasImunity = false;
    cellObj.hover = function (isHovered) {
        if (isHovered) {
            El.addClass("hover");
        } else {
            El.removeClass("hover");
        }
    };

    return cellObj;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

window.addEventListener("load", async function () {
    
    //for (var i = 0; i < 100; i++) {
    //    console.log("------ " + i + " in " + new Date().getTime())
    //    await sleep(1000);
    //    console.log("------ 2" + i + " in " + new Date().getTime())
    //    //setTimeout(function () { console.log("------ timeout" + i + " in " + new Date().getTime()) }, i * 1000)
    //}

    // Init
    ///////////////////////
    fullscreenLinkEl = document.getElementById("topbar-fullscreen");
    init(level); //First so if global variable is used in the listeners, than it will be initialized

    // Listeners
    ///////////////////////
    document.querySelector("body").addEventListener("click", function (ev) {
        let cellEl = ev.target.closest(".cell");
        if (cellEl && lockGame == false && !cellEl.classList.contains('fade')) {
            var x = cellEl.dataset.x, y = cellEl.dataset.y;
            let current = minefield[x][y];
            if (radarIsActive) {
                console.log("DIDO E PEDAL")
                current.El.classList.add("fade");
                radarIsActive = false;
                if (audio == 1) radarSound.play();
                fadeRadarCells(current);
            } else {
                if (current.isRevealed == false && current.isFlagged == false) {
                    cellTypeCheck(current);
                } else if (current.isRevealed && current.isChest) {
                    current.visited = true;
                    cellTypeCheck(current);
                }
            }
            revealedCheck();
            console.log("left click x is: " + cellEl.dataset.x);
            console.log("left click y is: " + cellEl.dataset.y);
        }
    })

    document.querySelector("body").addEventListener("contextmenu", function (ev) {
        if (ev.ctrlKey)
            return;
        ev.preventDefault();
        let cellEl = ev.target.closest(".cell");
        if (cellEl && lockGame == false && !cellEl.classList.contains('fade')) {

            var x = cellEl.dataset.x, y = cellEl.dataset.y;
            if (minefield[x][y].isRevealed != true) {
                if (minefield[x][y].isFlagged == 0 && remainingFlags > 0) {
                    minefield[x][y].isFlagged = 1;
                    minefield[x][y].El.classList.add("flagged");
                    remainingFlags--;
                    setFlags();
                }
                else if (minefield[x][y].isFlagged == 1){
                    minefield[x][y].isFlagged = 0;
                    minefield[x][y].El.classList.remove("flagged");
                    remainingFlags++;
                    setFlags();
                }
            }

            console.log("right click x is: " + cellEl.dataset.x);
            console.log("right click y is: " + cellEl.dataset.y);
        }
    })

    fullscreenLinkEl.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (!isFullScreen) {
            openFullscreen();
        }
        else {
            closeFullscreen();
        }
    })
    /*
    document.getElementById("difficulties").addEventListener("click", function (ev) {
        document.getElementById("start").classList.remove("show-as-flex");
    })
    */
    document.getElementById("topbar").addEventListener("dblclick", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (!isFullScreen) {
            openFullscreen();
        }
        else {
            closeFullscreen();
        }
    })
    document.getElementById("footer-inventory").addEventListener("click", changingCursorForRadar);
    document.getElementById("topbar-audio").addEventListener("click", function (ev) {
        var footerAudioEl = document.getElementById("topbar-audio");
        if (audio == 0) {
            footerAudioEl.classList.add("on");
            console.log("Music is playing!")
            music.play();
            audio = 1;
        }
        else {
            footerAudioEl.classList.remove("on");
            music.pause();
            audio = 0;
        }
    })

    // Effects
    ///////////////////////////
    enbledBackgroundMovement();
    insertFireflies();
    //place cells on board
    setTimeout(() => { animateMinefieldInit(); }, 100);



    /*for (var i = 0; i < minefield.length; i++) {
        var ell = minefield[i];
        for (var j = 0; j < ell.length; j++) {
            console.log("minefield[" + i + "][" + j + "] = " + ell[j]);
        }
    }*/
})


function loseGame() {
    if (audio == 1) {
        music.pause(); loseSound.play();
    }
    revealAll();
    stopTimer();
    lockGame = true;
    console.log(`Game over!`)
    var loseScreenEl = document.getElementById("lose");
    loseScreenEl.classList.add("show-as-flex");
    document.getElementById("message").addEventListener("click", function (ev) {
        loseScreenEl.classList.remove("show-as-flex");
        window.location.reload();
    })
}

function winGame() {
    if (audio == 1) {
        music.pause();
        winSound.play();
    }
    stopTimer();
    lockGame = true;
    console.log(`Game Win!`)
    var winScreenEl = document.getElementById("win");
    winScreenEl.classList.add("show-as-flex");
    var explodedmines = minesMaxCount; - minesCount + 1;
    if (goldCount == 0) goldCount = 1;
    if (timeInSeconds == 0) timeInSeconds = 1;

    var score = (minesCount / explodedmines * 0.1) * goldCount / timeInSeconds;
    setWinScore(score);
    document.querySelector("#win #message").addEventListener("click", function (ev) {
        winScreenEl.classList.remove("show-as-flex");
        window.location.reload();
    })
}

function cellsToRevealCalc() {
    cellsToReveal = x * y - minesMaxCount;
}

function winCheck() {
    if (revealedCount == cellsToReveal) {
        console.log(revealedCount);
        console.log(cellsToReveal);
        winGame();
    }
}

function RevealNearby(xi, yi) {
    if (0 > xi || xi >= x || 0 > yi || yi >= y) return;
    current = minefield[xi][yi];
    if (current.isRevealed == true) return;
    current.El.classList.add("revealed");
    current.isRevealed = true;
    revealedCount++;
    winCheck();
    if (current.isChest > 0) current.El.classList.add("unopened");
    if (current.nearMines == 0) { // empty cell or chest cell
        RevealNearby(xi - 1, yi);
        RevealNearby(xi + 1, yi);
        RevealNearby(xi, yi - 1);
        RevealNearby(xi, yi + 1);
    }
    return; // if a numbered cell, the recursion stops
}
function cellTypeCheck(current) {
    if (current.isMine == 0 && current.nearMines == 0) {
        console.log("Recursion starts");
        revealedCount--;
        RevealNearby(current.x, current.y);
    }
    current.El.classList.add("revealed");
    current.isRevealed = true;
    if (audio == 1) cellRevealed.play();
    if (current.isMine > 0) {
        if (audio == 1) explosion.play();
        minesCount--;
        setBombs();
        let bombType = current.isMine;
        if (bombType === 1) {
            health -= 35;
        } else if (bombType === 2) {
            health -= 50;
        }
        current.isMine = 0;
        if (health <= 0) {
            health = 0;
            loseGame();
        }
        setHealth();
    }
    else if (current.isChest && current.visited && current.locked == false) {
        current.locked = true;
        var contentEl = current.El.children.item(1);
        if (audio == 1) powerupPickup.play();
        if (current.isChest === 1) {
            goldCount += Math.round(getRandomInt(10000, 100000) / 1000) * 1000;
            current.El.classList.remove("unopened");
            contentEl.classList.add(`points`);
            contentEl.classList.add('hide');
            setGold();
        } else if (current.isChest === 2) {
            current.El.classList.remove("unopened");
            contentEl.classList.add(`radar`);
            contentEl.classList.add('hide');
            inventory.radarCount++;
            setRadars();
        } else if (current.isChest === 3) {
            current.El.classList.remove("unopened");
            contentEl.classList.add(`health`);
            contentEl.classList.add('hide');
            health += 25;
            if (health > 100) {
                health = 100;
            }
            setHealth();
        } else if (current.isChest === 4) {
            current.El.classList.remove("unopened");
            contentEl.classList.add(`time`);
            contentEl.classList.add('hide');
            if (timeInSeconds - 20 < 0) {
                timeInSeconds = 0;
            } else {
                timeInSeconds -= 20;
            }
            specialEffect = true;
        }

        //To do
    } else {
        revealedCount++;
        winCheck();
    }
}
// Debug functions
function minefieldSetup() {
    addBombs();
    console.log(`Bombs:`)
    for (let i = 0; i < x; i++) {
        let tempArr = minefield[i];
        let resultArr = [];
        tempArr.forEach((x) => resultArr.push(x.isMine))
        console.log(resultArr.join(` `));
    }

    countAdjacentMines();
    console.log(`Adjacent mines:`)
    for (let i = 0; i < x; i++) {
        let tempArr = minefield[i];
        let resultArr = [];
        tempArr.forEach((x) => resultArr.push(x.nearMines))
        console.log(resultArr.join(` `));
    }

    countAdjacentMinesSidesOnly()
    console.log(`Adjacent mines (sides only):`)
    for (let i = 0; i < x; i++) {
        let tempArr = minefield[i];
        let resultArr = [];
        tempArr.forEach((x) => resultArr.push(x.nearMinesSides))
        console.log(resultArr.join(` `));
    }

    addChest();
    console.log(`Chests:`)
    for (let i = 0; i < x; i++) {
        let tempArr = minefield[i];
        let resultArr = [];
        tempArr.forEach((x) => resultArr.push(x.isChest ? 1 : 0))
        console.log(resultArr.join(` `));
    }
    cellsToRevealCalc();


    //winSimulation();

}

function revealedCheck() {
    console.log(`Revealed:`)
    for (let i = 0; i < x; i++) {
        let tempArr = minefield[i];
        let resultArr = [];
        tempArr.forEach((x) => resultArr.push(x.isRevealed ? 1 : 0))
        console.log(resultArr.join(` `));
    }
}



function winSimulation() {
    minefield.forEach((x) => x.forEach((y) => { if (!y.isMine) { y.isRevealed = true; cellTypeCheck(y); } }));
}

function changingCursorForRadar() {
    console.log("DIDO E GEI")
    if (inventory.radarCount > 0) {
        radarIsActive = true;
        let bodyEl = document.querySelector("body");
        let minefieldEl = document.getElementById("minefield");
        minefieldEl.classList.remove("customCursor");
        bodyEl.classList.add("radar_cursor");
    }
}

function fadeRadarCells(current) {
    console.log("DIDO E GOLQM GEI")
    let bodyEl = document.querySelector("body");
    let minefieldEl = document.getElementById("minefield");
    bodyEl.classList.remove("radar_cursor");
    minefieldEl.classList.add("customCursor");
    inventory.radarCount--;
    setRadars();
    let i = current.x;
    let j = current.y;
    for (let row = i - 1; row <= i + 1; row++) {
        for (let col = j - 1; col <= j + 1; col++) {
            if (row >= 0 && row < x && col >= 0 && col < y) {
                minefield[row][col].El.classList.add("fade");
            }
        }
    }
    setTimeout(() => {
        for (let row = i - 1; row <= i + 1; row++) {
            for (let col = j - 1; col <= j + 1; col++) {
                if (row >= 0 && row < x && col >= 0 && col < y) {
                    minefield[row][col].El.classList.remove("fade");
                }
            }
        }
    }, 3000);

    
}

function pausecomp(millis) {
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while (curDate - date < millis);
}
