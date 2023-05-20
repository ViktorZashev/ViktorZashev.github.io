function openFullscreen() {
    let elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
    fullscreenLinkEl.classList.add("on");
    isFullScreen = true;
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
    fullscreenLinkEl.classList.remove("on");
    isFullScreen = false;
}

function enbledBackgroundMovement() {
    var movementStrength = 25;
    var height = movementStrength / window.innerHeight;
    var width = movementStrength / window.innerWidth;
    var wrapperEl = document.getElementById("minefield-wrapper");
    wrapperEl.addEventListener("mousemove", function (e) {
        var pageX = e.pageX - (window.innerWidth / 2);
        var pageY = e.pageY - (window.innerHeight / 2);
        var newvalueX = width * pageX * -1 - 25;
        var newvalueY = height * pageY * -1 - 50;
        wrapperEl.style.backgroundPosition = "calc(50% - " + newvalueX + "px) " + "calc(50% - " + newvalueY + "px)";
    });
}

function insertFireflies() {
    for (var i = 0; i < fireflyCount; i++) {
        var fireflyEl = document.createElement("div");
        fireflyEl.classList.add("firefly");
        document.body.appendChild(fireflyEl);
    }
}

function animateMinefieldInit() {
    let delay = 2;
    minefieldEl.querySelectorAll(".cell").forEach(function (item, index) {
        // stagger transition with transitionDelay
        item.style.transitionDelay = (index * delay) + 'ms';
        item.classList.toggle('is-moved');
    });
}
function disableInspect() {
    console.log(`disable inspect`)
    document.onkeydown = function (e) {

        // disable F12 key
        if (e.keyCode == 123) {
            return false;
        }

        // disable I key
        if (e.ctrlKey && e.shiftKey && e.keyCode == 73) {
            return false;
        }

        // disable J key
        if (e.ctrlKey && e.shiftKey && e.keyCode == 74) {
            return false;
        }

        // disable U key
        if (e.ctrlKey && e.keyCode == 85) {
            return false;
        }
    }
}
/////////////// Minefield Calculations
function addBombs() {
    let bombsToAdd = undiscoveredMines;
    while (bombsToAdd > 0) {
        let row = Math.floor(Math.random() * (x));
        let col = Math.floor(Math.random() * (y));
        let currentBomb = minefield[row][col];
        var contentEl = currentBomb.El.children.item(1);
        if (currentBomb.isMine === 0) {
            let bombType = Math.floor(Math.random() * 2) + 1;
            currentBomb.isMine = bombType;
            if (bombType === 1) {
                contentEl.classList.add("blackmine");
            } else {
                contentEl.classList.add("redmine");
            }
            bombsToAdd--;
        } else {
            console.log(`This cell is a mine`);
        }
    }
}

function addChest() {
    if (countEmptyCells() < chestCount) {
        chestCount = countEmptyCells();
    }
    let chestsToAdd = chestCount;
    while (chestsToAdd > 0) {
        let row = Math.floor(Math.random() * (x));
        let col = Math.floor(Math.random() * (y));
        let currentChest = minefield[row][col];
       /// var contentEl = currentChest.El.children.item(1);
        if (currentChest.isChest == 0) {
            if (currentChest.isMine === 0 && currentChest.nearMines === 0) {
                let chestType = Math.floor(Math.random() * 4) + 1;
                currentChest.isChest = chestType;
                currentChest.El.classList.add("unopened");
                ///currentChest.El.classList.add("chest");
                chestsToAdd--;
            }
        } else {
            console.log(`This cell is a chest`);
        }
    }
}

function countAdjacentMines() {
    for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
            var minesCount = 0;
            let current = minefield[i][j];
            if (current.isMine == false) {
                for (let row = i - 1; row <= i + 1; row++) {
                    for (let col = j - 1; col <= j + 1; col++) {
                        // check if the adjacent cell is within the grid bounds
                        if (row >= 0 && row < x && col >= 0 && col < y) {
                            // check if the adjacent cell contains a mine
                            if (minefield[row][col].isMine) {
                                minesCount++;
                            }
                        }
                    }
                }
                current.nearMines = minesCount;
            }
        }
    }
}

function countAdjacentMinesSidesOnly() {
    for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
            var minesCount = 0;
            let current = minefield[i][j];
            if (current.isMine == false) {
                for (let row = i - 1; row <= i + 1; row++) {
                    for (let col = j - 1; col <= j + 1; col++) {

                        if ((row == i - 1 && col == j) || (row == i + 1 && col == j) || (row == i && col == j + 1) || (row == i && col == j - 1)) {
                            if (row >= 0 && row < x && col >= 0 && col < y) {

                                if (minefield[row][col].isMine) {
                                    minesCount++;
                                }
                            }
                        }
                    }
                }
                current.nearMinesSides = minesCount;
            }
        }
    }
}

function normalOrSidesOnly() {
    for (let row = 0; row < x; row++) {
        for (let col = 0; col < y; col++) {
            let chanceSides = getRandomWithFrequency(40)// 40 percent to return 1, otherwise 2
            let current = minefield[row][col];
            if (current.nearMinesSides == 0) {
                setnormalcounter(current);
            }
            else {
                if (chanceSides == 1) setsidescounter(current);
                else {
                    setnormalcounter(current);
                }
            }
        }
    }
}

function revealAll() {
    minefield.forEach((x) => x.forEach((y) => { if (y.isMine) { y.isRevealed = true; cellTypeCheck(y); } }));
    /*
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function demo() {
        let bombount = 0;
        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                if (minefield[i][j].isMine && !minefield[i][j].isRevealed) {
                    bombount++;
                }
            }
        }
        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                await sleep(bombount * 1000); 
                minefield[i][j].isRevealed = true;
                cellTypeCheck(minefield[i][j])
            }
        }
        console.log('Done');
    }

    demo();
    */

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function getRandomWithFrequency(frequncy) {
    let random = getRandomInt(0, 100);
    frequncy = 100 - frequncy;
    if (random >= frequncy) {
        return 1;
    } else {
        return 2;
    }
}

function setnormalcounter(current) {
    current.cellType = `normal`;
    var contentEl = current.El.children.item(1);
    if (current.nearMines === 1) {
        contentEl.classList.add("number1");
    } else if (current.nearMines === 2) {
        contentEl.classList.add("number2");
    } else if (current.nearMines === 3) {
        contentEl.classList.add("number3");
    } else if (current.nearMines === 4) {
        contentEl.classList.add("number4");
    } else if (current.nearMines === 5) {
        contentEl.classList.add("number5");
    } else if (current.nearMines === 6) {
        contentEl.classList.add("number6");
    } else if (current.nearMines === 7) {
        contentEl.classList.add("number7");
    } else if (current.nearMines === 8) {
        contentEl.classList.add("number8");
    }
}

function setsidescounter(current) {
    current.cellType = `sidesOnly`;
    var contentEl = current.El.children.item(1);
    if (current.nearMinesSides === 1) {
        contentEl.classList.add("number1sides");
    } else if (current.nearMinesSides === 2) {
        contentEl.classList.add("number2sides");
    } else if (current.nearMinesSides === 3) {
        contentEl.classList.add("number3sides");
    } else if (current.nearMinesSides === 4) {
        contentEl.classList.add("number4sides");
    }
}

function countEmptyCells() {
    let count = 0;
    minefield.forEach((x) => x.forEach((y) => {
        if (y.nearMines == 0 && y.isMine == false) {
            count++;
        }
    }));
    return count;
}