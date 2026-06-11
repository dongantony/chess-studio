const board = document.getElementById("chessboard");
let currentTurn = "w"
let gameOver = false
let selectedSquare = null
let lastMove = null
let promotionInProgress = false
let halfMoveClock = 0
let positionHistory = []
let moveHistory = []
let capturedWhite = []
let capturedBlack = []
let gameStats = {
    captures: 0,
    checks: 0,
    castles: 0,
    promotions: 0
}

let boardFlipped = false
let showCoordinates = true
let showMoveHints = true
let highlightChecks = true
let highlightLastMove = true
let lastMoveSquares = null
let audioVolume = 0.5

// =============================================
// UI Rendering and Updates
// =============================================

function renderBoard() {
    board.innerHTML = ""

    for (let displayRow = 0; displayRow < 8; displayRow++) {
        for (let displayCol = 0; displayCol < 8; displayCol++) {
            
            const row = boardFlipped ? 7 - displayRow : displayRow
            const col = boardFlipped ? 7 - displayCol : displayCol
            const square = document.createElement("div")

            square.classList.add("square")

            if((row + col) % 2 == 0) {
                square.classList.add("light")
            } 
            else {
                square.classList.add("dark")
            }

            square.dataset.row = row
            square.dataset.col = col
            square.addEventListener("click", handleSquareClick)

            const piece = gameboard[row][col]

            if(piece) {
                const img = document.createElement("img")

                img.src = pieces[piece]
                img.alt = piece
                img.classList.add("piece")
                
                square.appendChild(img)
            }

            board.appendChild(square)
        }
    }
}

function updateBoardSize() {
    const mobileLayout = window.innerWidth <= 1100

    const sidebarWidth = mobileLayout ? 0 : 320
    const gap = mobileLayout ? 0 : 30
    const pagePadding = 40
    const minSize = 280

    const availableWidth = window.innerWidth - sidebarWidth - gap - pagePadding
    const availableHeight = window.innerHeight - 140

    const boardSize = Math.min(availableWidth, availableHeight) * 0.95
    const squareSize = Math.max(minSize / 8, boardSize / 8)

    document.documentElement.style.setProperty("--square-size", `${squareSize}px`)
}

function clearHighlights() {
    document.querySelectorAll(".move-hint, .capture-hint").forEach(square => {
        square.classList.remove("move-hint", "capture-hint")
    });
}

function getSquareElement(row, col) {
        return document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`)
}

function highlightLegalMoves(from) {
    if(!showMoveHints) return;

    const piece = gameboard[from.row][from.col]

    if(!piece) return;

    const squares = document.querySelectorAll(".square");

    for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 8; col++) {
            const to = { row, col }

            if(!isLegalMove(piece, from, to)) {
                continue;
            }

            const square = getSquareElement(row, col)
            const target = gameboard[row][col]

            if(target && target[0] !== piece[0]) {
                square.classList.add("capture-hint");
            } 
            else {
                square.classList.add("move-hint");
            }
        }
    }
}

function highlightCheckedKing() {
    if(!highlightChecks) return;

    if(!isKingInCheck(currentTurn)) return;

    const king = findKing(currentTurn)

    if(!king) return;

    getSquareElement(king.row, king.col)?.classList.add("incheck")
}

function highlightLastMoveSquares() {
    if(!highlightLastMove) return;
    if(!lastMoveSquares) return;

    getSquareElement(lastMoveSquares.from.row, lastMoveSquares.from.col)?.classList.add("last-move-square")
    getSquareElement(lastMoveSquares.to.row, lastMoveSquares.to.col)?.classList.add("last-move-square")
}

function refreshBoard() {
    renderBoard();
    highlightLastMoveSquares();
    highlightCheckedKing();
}

function deselectPiece() {
    selectedSquare = null
    clearHighlights();
    refreshBoard();
}

function showPromotionModal(color) {
    promotionInProgress = true

    return new Promise(r => {
        const modal = document.getElementById("promotion-modal")
        const buttons = document.querySelectorAll("#promotion-options button")
        const cancelButton = document.getElementById("promotion-cancel")

        buttons.forEach(button => {
            const pieceType = button.dataset.piece
            button.innerHTML = `<img src="${pieces[color + pieceType]}" alt="">`

            button.onclick = () => {
                modal.classList.add("hidden")
                promotionInProgress = false
                r(pieceType)
            }
        })

        cancelButton.onclick = () => {
            modal.classList.add("hidden")
            promotionInProgress = false
            r(null)
        }

        modal.classList.remove("hidden")
    })
}

function renderCapturedPieces() {
    const whiteBox = document.querySelector("#captured-white-row") 
    const blackBox = document.querySelector("#captured-black-row") 

    whiteBox.innerHTML = ""
    blackBox.innerHTML = ""

    const whiteCounts = countPieces(capturedWhite)
    const blackCounts = countPieces(capturedBlack)

    const pieceSymbols = {
        w: {
            p: "img/white-pawn.png",
            n: "img/white-knight.png",
            b: "img/white-bishop.png",
            r: "img/white-rook.png",
            q: "img/white-queen.png"
            },

        b: {
            p: "img/black-pawn.png",
            n: "img/black-knight.png",
            b: "img/black-bishop.png",
            r: "img/black-rook.png",
            q: "img/black-queen.png"
        }
    }

    const renderSide = (box, counts, color) => {
        for (const type in counts) {
            const wrapper = document.createElement("div")

            const img = document.createElement("img")
            img.src = pieceSymbols[color][type]
            img.alt = type
            img.classList.add("captured-piece")

            const label = document.createElement("span")
            label.textContent = ` x${counts[type]}`

            wrapper.appendChild(img)
            wrapper.appendChild(label)
            box.appendChild(wrapper)
        }
    };

    renderSide(whiteBox, whiteCounts, "w")
    renderSide(blackBox, blackCounts, "b")
}

function updateGameStatus(message = null) {
    const status = document.getElementById("game-status") 

    if(message) {
        status.textContent = message
        return;
    }

    status.textContent = currentTurn === "w" ? "White's turn" : "Black's turn"
}

function updateGameInfo() {
    document.getElementById("info-move").textContent = Math.floor(moveHistory.length / 2) + 1
    document.getElementById("info-last-move").textContent = moveHistory.length ? moveHistory[moveHistory.length - 1] : "None"
    document.getElementById("stats-capture").textContent = gameStats.captures   
    document.getElementById("stats-check").textContent = gameStats.checks
    document.getElementById("stats-castle").textContent = gameStats.castles
    document.getElementById("stats-promotions").textContent = gameStats.promotions       

    const max = 100
    const progress = Math.min(halfMoveClock, max)
    const percent = (progress / max) * 100 
    const bar = document.getElementById("halfmove-progress")
    const text = document.getElementById("halfmove-text")
    
    bar.style.width = `${percent}%`
    text.textContent = `${Math.floor(percent)}%`

    if(progress < 50) {
        bar.style.background = "linear-gradient(90deg, #5fa84a, #7ed957)"
    }
    else if(progress < 80) {
        bar.style.background = "linear-gradient(90deg,#e0c34f,#ffd84d)"
    }
    else {
        bar.style.background = "linear-gradient(90deg,#d9534f,#ff6b6b)"
    }
}

function updateFileLabels() {
    const files = boardFlipped 
            ? ["h", "g", "f", "e", "d", "c", "b", "a"]
            : ["a", "b", "c", "d", "e", "f", "g", "h"]
    
    const container = document.getElementById("file-label")
    
    container.innerHTML = ""

    files.forEach(file => {
        const div = document.createElement("div")
        div.textContent = file
        container.appendChild(div)
    })
}

function updateRankLabels() {
    const ranks = boardFlipped 
            ? ["1", "2", "3", "4", "5", "6", "7", "8"]
            : ["8", "7", "6", "5", "4", "3", "2", "1"]
    
    const container = document.getElementById("rank-label")
    
    container.innerHTML = ""

    ranks.forEach(rank => {
        const div = document.createElement("div")
        div.textContent = rank
        container.appendChild(div)
    })
}

function flipBoard() {
    boardFlipped = !boardFlipped

    document.getElementById("flip-board-toggle").checked = boardFlipped;

    refreshBoard();
    updateFileLabels();
    updateRankLabels();
}


// =============================================
// Game Information Helper Function
// =============================================

function pieceValue(piece) {
    switch(piece[1]) {
        case "p": 
            return 1;
        case "n": 
            return 3;
        case "b": 
            return 3;
        case "r": 
            return 5;
        case "q": 
            return 9;
        default: 
            return 0;
    }
}

function updateMaterialStatus() {
    const status = document.getElementById("material-status")

    const whiteScore = capturedWhite.reduce((sum,p) => sum + pieceValue(p), 0)
    const blackScore = capturedBlack.reduce((sum,p) => sum + pieceValue(p), 0)
    const diff = whiteScore - blackScore

    if(diff > 0) {
        status.textContent = `White +${diff}`
    } 
    else if(diff < 0) {
        status.textContent = `Black +${Math.abs(diff)}`
    } 
    else {
        status.textContent = "Equal material"
    }
}

function countPieces(list) {
    const map = {}

    for(const p of list) {
        const type = p[1]
        map[type] = (map[type] || 0) + 1;
    }

    return map;
}

function formatSquares(row, col) {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"]
    return files[col] + (8 - row);
}

function addMoveToHistory(piece, from, to, capturedPiece, promotionChoice, isCastleMove, isEnPassant) {
    const pieceLetters = {
        p: "",
        n: "N",
        b: "B",
        r: "R",
        q: "Q",
        k: "K"
    }

    let moveText = ""

    if(isCastleMove) {
        moveText = to.col === 6 ? "O-O" : "O-O-O"
    }
    else {
        const pieceLetter = pieceLetters[piece[1]]
        const isCapture = capturedPiece || isEnPassant
        
        if(piece[1] === "p") {
            if(isCapture) {
                const file = "abcdefgh"[from.col]
                moveText = file + "x" + formatSquares(to.row, to.col)
            }
            else {
                moveText = formatSquares(to.row, to.col)
            }
        }
        else {
            moveText = pieceLetter + (isCapture ? "x" : "") + formatSquares(to.row, to.col)
        }

        if(promotionChoice) {
            moveText += "=" + promotionChoice.toUpperCase();
        }
    }

    const movingColor = piece[0]
    const enemyColor = piece[0] === "w" ? "b" : "w"

    if(isCheckmate(enemyColor)) {
        moveText += "#"
    } 
    else if(isKingInCheck(enemyColor)){
        moveText += "+"
    }

    moveHistory.push(moveText)
    renderMoveHistory();
}

function renderMoveHistory() {
    const list = document.getElementById("move-history-list")
    list.innerHTML = ""

    for(let i = 0; i < moveHistory.length; i+= 2) {
        const moveNumber = Math.floor(i / 2) + 1

        const whiteMove = moveHistory[i]
        const blackMove = moveHistory[i + 1] || ""

        const row = document.createElement("div")
        row.className = "move-row"

        const num = document.createElement("div")
        num.className = "move-num"
        num.textContent = moveNumber + "."

        const white = document.createElement("div")
        white.className = "move-cell"
        white.textContent = whiteMove || ""

        const black = document.createElement("div")
        black.className = "move-cell"
        black.textContent = blackMove || ""

        const lastIdx = moveHistory.length - 1
        if(i === lastIdx) {
            white.classList.add("last-move")
        }
        if(i + 1 === lastIdx) {
            black.classList.add("last-move")
        }

        row.appendChild(num)
        row.appendChild(white)
        row.appendChild(black)
        list.appendChild(row)
    }

    list.scrollTop = list.scrollHeight;
}


// =============================================
//  Interacting with UI
// =============================================

async function handleSquareClick(event) {
    const row = Number(event.currentTarget.dataset.row)
    const col = Number(event.currentTarget.dataset.col)

    const clickedPiece = gameboard[row][col] 

    if(gameOver) return;
    if(promotionInProgress) return;

    if(!selectedSquare) {

        if(!clickedPiece) return;
        if(clickedPiece[0] !== currentTurn) return;

        clearHighlights();
        selectedSquare = {row, col}
        event.currentTarget.classList.add("selected")
        highlightLegalMoves(selectedSquare);

        return;
    }

    const from = selectedSquare

    if(from.row === row && from.col === col) {
        deselectPiece();
        return;
    }

    clearHighlights();
    const to = {row, col}
    const piece = gameboard[from.row][from.col]

    if(clickedPiece && clickedPiece[0] === currentTurn) {
        selectedSquare = { row, col }

        renderBoard();

        getSquareElement(row, col)?.classList.add("selected")
        highlightLegalMoves(selectedSquare)
        
        return;
    }

    if(isLegalMove(piece, from, to)) {
        const isCastleMove = piece[1] === "k" && Math.abs(to.col - from.col) === 2
        const isEnPassant = piece[1] === "p" && Math.abs(to.col - from.col) === 1 && !gameboard[to.row][to.col] &&
                            lastMove && Math.abs(lastMove.from.row - lastMove.to.row) === 2 && 
                            lastMove.to.row === from.row && lastMove.to.col === to.col

        let enPassantCapturedPiece = null

        if(isEnPassant) {
            enPassantCapturedPiece = gameboard[from.row][to.col]
        }

        let promotionChoice = null

        if(piece[1] === "p") {
            promotionChoice = await promotePawn(piece, to)

            if(promotionChoice == null && (to.row === 0 || to.row === 7)) {
                deselectPiece();
                return;
            }
        }

        const capturedPiece = gameboard[to.row][to.col]

        if(capturedPiece) {
            if (capturedPiece?.[1] === "r") {
                if(capturedPiece === "wr" && to.row === 7 && to.col === 0) hasMoved.wqr = true;
                if(capturedPiece === "wr" && to.row === 7 && to.col === 7) hasMoved.wkr = true;
                if(capturedPiece === "br" && to.row === 0 && to.col === 0) hasMoved.bqr = true;
                if(capturedPiece === "br" && to.row === 0 && to.col === 7) hasMoved.bkr = true;
            }

            if(capturedPiece[0] === "w") {
                capturedWhite.push(capturedPiece)
            }
            else {
                capturedBlack.push(capturedPiece)
            }

            gameStats.captures++
        }

        gameboard[to.row][to.col] = piece
        gameboard[from.row][from.col] = null

        if(piece[1] === "p" && promotionChoice) {
            gameboard[to.row][to.col] = piece[0] + promotionChoice
            gameStats.promotions++
        }

        if(isEnPassant) {
            const captured = gameboard[from.row][to.col]

            if(captured) {
                if(captured[0] === "w") {
                    capturedWhite.push(captured)
                } 
                else {
                    capturedBlack.push(captured)
                }
                gameStats.captures++
            }

            gameboard[from.row][to.col] = null
        }

        markMoved(piece, from)
        
        if(isCastleMove) {
            if(to.col === 6) {
                const rook = gameboard[from.row][7]
                gameboard[from.row][5] = gameboard[from.row][7]
                gameboard[from.row][7] = null

                markMoved(rook, {row: from.row, col: 7})
            }
            
            if(to.col === 2) {
                const rook = gameboard[from.row][0]
                gameboard[from.row][3] = gameboard[from.row][0]
                gameboard[from.row][0] = null

                markMoved(rook, {row: from.row, col: 0})
            }
            gameStats.castles++
        }

        const capturedPieceFinal = isEnPassant ? enPassantCapturedPiece : capturedPiece
        addMoveToHistory(piece, from, to, capturedPieceFinal, promotionChoice, isCastleMove, isEnPassant)

        let soundsToPlay = sounds.move
        const soundTurnCheck = piece[0] === "w" ? "b" : "w"

        if(isKingInCheck(soundTurnCheck)) {
            soundsToPlay = sounds.check;
            gameStats.checks++
        }
        else if(isCastleMove) {
            soundsToPlay = sounds.castle    
        }
        else if(promotionChoice) {
            soundsToPlay = sounds.promote
        }
        else if(capturedPiece || isEnPassant) {
            soundsToPlay = sounds.capture
        }

        lastMove = {piece, from: {...from}, to: {...to}}
        lastMoveSquares = {from: {...from}, to:{...to}}

        if(piece[1] === "p" || capturedPiece || isEnPassant) {
            halfMoveClock = 0
        } 
        else {
            halfMoveClock++
        }

        currentTurn = (currentTurn === "w" ? "b" : "w") 
        updateGameStatus();
        positionHistory.push(getPositionKey())

        if(isCheckmate(currentTurn)) {
            gameOver = true
            soundsToPlay = sounds.gameover
            const winner = currentTurn === "w" ? "Black" : "White"
            updateGameStatus(`Checkmate! ${winner} wins!`);
        }
        else if(isStalemate(currentTurn)) {
            gameOver = true
            soundsToPlay = sounds.gameover
            updateGameStatus("Stalemate! It's a draw!");
        }
        else if(isInsufficientMaterial()) {
            gameOver = true
            soundsToPlay = sounds.gameover
            updateGameStatus("Draw due to insufficient material!");
        }
        else if(halfMoveClock >= 100) {
            gameOver = true
            soundsToPlay = sounds.gameover
            updateGameStatus("Draw by fifty-move rule");
        }
        else if(isThreefoldRepetition()) {
            gameOver = true
            soundsToPlay = sounds.gameover
            updateGameStatus("Draw by threefold repetition!")
        }
        else if(isKingInCheck(currentTurn)) {
            updateGameStatus("Check!");
        }

        playSound(soundsToPlay);
    } 
    selectedSquare = null
    clearHighlights();
    refreshBoard();
    renderCapturedPieces();
    updateMaterialStatus();
    updateGameInfo();
}

function playSound(sound) {
    if(audioVolume == 0) return;

    sound.currentTime = 0
    sound.volume = audioVolume;
    sound.play();
}


renderBoard();
renderCapturedPieces();
updateGameStatus();
updateFileLabels();
updateRankLabels();
updateGameInfo();
positionHistory.push(getPositionKey());

updateBoardSize();
window.addEventListener("resize", updateBoardSize)

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar")
    const sidebarToggle = document.getElementById("sidebar-toggle")
    const overlay = document.getElementById("sidebar-overlay")
    const flipButton = document.getElementById("flip-board-toggle")
    const slider = document.getElementById("volume-slider")
    const volumeText = document.getElementById("volume-value")

    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.add("open")
        overlay.classList.add("show")
        sidebarToggle.classList.add("hidden")
    })

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open")
        overlay.classList.remove("show")
        sidebarToggle.classList.remove("hidden")
    })

    flipButton.addEventListener("change", () => {
        flipBoard();
    })

    slider.value = audioVolume
    volumeText.textContent = Math.round(audioVolume * 100) + "%"
})

document.querySelectorAll(".tab-btn").forEach(button => {
    button.addEventListener("click", () => {

        document.querySelectorAll(".tab-btn")
            .forEach(btn => btn.classList.remove("active"))

        document.querySelectorAll(".tab-content")
            .forEach(tab => tab.classList.remove("active"))

        button.classList.add("active")

        document
            .getElementById(`${button.dataset.tab}-tab`)
            .classList.add("active")
    })
})

document.getElementById("coordinates-toggle").addEventListener("change", e => {
    showCoordinates = e.target.checked

    document.getElementById("rank-label").style.display = showCoordinates ? "grid" : "none";
    document.getElementById("file-label").style.display = showCoordinates ? "grid" : "none";
})

document.getElementById("move-hints-toggle").addEventListener("change", e => {
    showMoveHints = e.target.checked

    clearHighlights()

    if(selectedSquare && showMoveHints) {
        highlightLegalMoves(selectedSquare)
    }
})

document.getElementById("check-highlight-toggle").addEventListener("change", e => {
    highlightChecks = e.target.checked

    refreshBoard();
})

document.getElementById("lastmove-highlight-toggle").addEventListener("change", e => {
    highlightLastMove = e.target.checked

    refreshBoard();
})

document.getElementById("dark-mode-toggle").addEventListener("change", e => {
    document.body.classList.toggle("dark-mode", e.target.checked);
})

document.getElementById("board-theme-select").addEventListener("change", e => {
    document.body.classList.remove(
        "theme-classic",
        "theme-blue",
        "theme-brown",
        "theme-gray"
    )

    document.body.classList.add(`theme-${e.target.value}`)
})

const volumeSlider = document.getElementById("volume-slider")
const volumeText = document.getElementById("volume-value")

document.getElementById("volume-slider").addEventListener("input", e => {
    audioVolume = parseFloat(e.target.value)

    const percent = Math.round(audioVolume * 100);
    volumeText.textContent = percent + "%"
})