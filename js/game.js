// =================================================
// Global Game State
// =================================================

const board = document.getElementById("chessboard")
let currentTurn = "w"
let gameOver = false
let promotionInProgress = false
let selectedSquare = null 
let lastMove = null
let lastMoveSquares = null
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

Settings.load()
applySettingsToPage()
let boardFlipped = Settings.get("boardFlipped")
let showCoordinates = Settings.get("showCoordinates")
let showMoveHints = Settings.get("showMoveHints")
let highlightChecks = Settings.get("highlightChecks")
let highlightLastMove = Settings.get("highlightLastMove")
let audioVolume = Settings.get("volume")

let gameMode = localStorage.getItem("gameMode") || "human"
let computerColor = "b"


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

            if((row + col) % 2 === 0) {
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

function handlePieceSelection(square, piece, element) {
    if(!piece) return;
    if(piece[0] !== currentTurn) return;

    clearHighlights();

    selectedSquare = square
    element.classList.add("selected")

    highlightLegalMoves(square);
}

function switchSelectedPiece(square) {
    selectedSquare = square

    renderBoard();

    getSquareElement(square.row, square.col)?.classList.add("selected");
    highlightLegalMoves(square);
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
    Settings.set("boardFlipped", boardFlipped)

    document.getElementById("flip-board-toggle").checked = boardFlipped;

    refreshBoard();
    updateFileLabels();
    updateRankLabels();
}


// =================================================
// Display / Information Helpers
// =================================================

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

function isComputerGame() {
    return gameMode === "computer"
}


// =================================================
//  Configurations / Event Listeners
// =================================================

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar")
    const sidebarToggle = document.getElementById("sidebar-toggle")
    const overlay = document.getElementById("sidebar-overlay")
    const flipButton = document.getElementById("flip-board-toggle")

    function closeSidebar() {
        sidebar.classList.remove("open")
        overlay.classList.remove("show")
        sidebarToggle.classList.remove("hidden")
    }

    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.add("open")
        overlay.classList.add("show")
        sidebarToggle.classList.add("hidden")
    })

    overlay.addEventListener("click", closeSidebar)

    window.addEventListener("resize", () => {
        if(window.innerWidth > 1100) {
            closeSidebar();
        }
    })

    flipButton.addEventListener("change", () => {
        flipBoard();
    })

    syncChessSettingsUI();
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
    Settings.set("showCoordinates", showCoordinates)

    document.getElementById("rank-label").style.display = showCoordinates ? "grid" : "none";
    document.getElementById("file-label").style.display = showCoordinates ? "grid" : "none";
})

document.getElementById("move-hints-toggle").addEventListener("change", e => {
    showMoveHints = e.target.checked
    Settings.set("showMoveHints", showMoveHints)
    clearHighlights()

    if(selectedSquare && showMoveHints) {
        highlightLegalMoves(selectedSquare)
    }
})

document.getElementById("check-highlight-toggle").addEventListener("change", e => {
    highlightChecks = e.target.checked
    Settings.set("highlightChecks", highlightChecks)
    refreshBoard();
})

document.getElementById("lastmove-highlight-toggle").addEventListener("change", e => {
    highlightLastMove = e.target.checked
    Settings.set("highlightLastMove", highlightLastMove)
    refreshBoard();
})

document.getElementById("dark-mode-toggle").addEventListener("change", e => {
    Settings.set("darkMode", e.target.checked)
    applySettingsToPage()
})

document.getElementById("theme-select").addEventListener("change", e => {
    document.documentElement.classList.remove(
        "theme-classic",
        "theme-blue",
        "theme-brown",
        "theme-gray"
    )

    Settings.set("theme", e.target.value)
    applySettingsToPage()
})

window.addEventListener("settingsChanged", (e) => {
    const s = e.detail

    boardFlipped = Settings.get("boardFlipped")
    showCoordinates = Settings.get("showCoordinates")
    showMoveHints = Settings.get("showMoveHints")
    highlightChecks = Settings.get("highlightChecks")
    highlightLastMove = Settings.get("highlightLastMove")
    audioVolume = Settings.get("volume")
    
    syncChessSettingsUI();
    refreshBoard();
});

function syncChessSettingsUI() {
    document.getElementById("flip-board-toggle").checked =
        Settings.get("boardFlipped")

    document.getElementById("coordinates-toggle").checked =
        Settings.get("showCoordinates")

    document.getElementById("move-hints-toggle").checked =
        Settings.get("showMoveHints")

    document.getElementById("check-highlight-toggle").checked =
        Settings.get("highlightChecks")

    document.getElementById("lastmove-highlight-toggle").checked =
        Settings.get("highlightLastMove")

    document.getElementById("dark-mode-toggle").checked =
        Settings.get("darkMode")

    document.getElementById("theme-select").value =
        Settings.get("theme")

    const volume = Settings.get("volume")
    updateVolumeUI(volume)

    document.getElementById("rank-label").style.display =
        Settings.get("showCoordinates") ? "grid" : "none"

    document.getElementById("file-label").style.display =
        Settings.get("showCoordinates") ? "grid" : "none"
}


// =================================================
//  Rules, Move Handling, and Game State Management
// =================================================

async function handleSquareClick(event) {
    if(gameOver || promotionInProgress) return;

    const square = getClickedSquare(event);
    const clickedPiece = gameboard[square.row][square.col]

    if(!selectedSquare) {
        handlePieceSelection(square, clickedPiece, event.currentTarget);
        return;
    }

    if(isSameSquare(selectedSquare, square)) {
        deselectPiece();
        return;
    }

    if(clickedPiece && clickedPiece[0] === currentTurn) {
        switchSelectedPiece(square);
         return;
    }

    await attemptMove(selectedSquare, square)

    selectedSquare = null
    
    clearHighlights();
    refreshBoard();
    renderCapturedPieces();
    updateMaterialStatus();
    updateGameInfo();
}

function getClickedSquare(event) {
    const square = {row: Number(event.currentTarget.dataset.row), col: Number(event.currentTarget.dataset.col)}
    return square;
}

function isSameSquare(a, b) {
    return a.row === b.row && a.col === b.col;
}

async function attemptMove(from, to) {
    const piece = gameboard[from.row][from.col]

    if(!isLegalMove(piece, from, to)) {
        return;
    }

    const moveData = await prepareMove(piece, from, to);

    if(!moveData) return;

    executeMove(moveData);
    updateMoveTracking(moveData);
    finishTurn(moveData);
}

async function prepareMove(piece, from, to) {
    const isCastleMove = piece[1] === "k" && Math.abs(to.col - from.col) === 2
    const isEnPassant = piece[1] === "p" && Math.abs(to.col - from.col) === 1 && !gameboard[to.row][to.col] &&
                        lastMove && Math.abs(lastMove.from.row - lastMove.to.row) === 2 && 
                        lastMove.to.row === from.row && lastMove.to.col === to.col

    let promotionChoice = null
    let enPassantCapturedPiece = isEnPassant ? gameboard[from.row][from.col] : null
    
    if(piece[1] === "p" && (to.row === 0 || to.row === 7)) {
        promotionChoice = await promotePawn(piece, to)

        if(promotionChoice == null && (to.row === 0 || to.row === 7)) {
            deselectPiece();
            return;
        }
    }

    const move = {piece, from, to, isCastleMove, isEnPassant, promotionChoice, capturedPiece: gameboard[to.row][to.col], enPassantCapturedPiece}
    return move;
}

function executeMove(move) {
    handleCapture(move);
    movePiece(move);
    handlePromotion(move);
    handleEnPassant(move);
    handleCastling(move);
    markMoved(move.piece, move.from);
}

function handleCapture(move) {
    const captured = move.capturedPiece

    if(!captured) return;

    updateCastlingRightsOnCapture(captured, move.to);

    if(captured[0] === "w") {
        capturedWhite.push(captured)
    } 
    else {
        capturedBlack.push(captured)
    }
    gameStats.captures++
}

function movePiece(move) {
    gameboard[move.to.row][move.to.col] = move.piece
    gameboard[move.from.row][move.from.col] = null
}

function handlePromotion(move) {
    if(move.piece[1] === "p" && move.promotionChoice) {
        gameboard[move.to.row][move.to.col] = move.piece[0] + move.promotionChoice
        gameStats.promotions++
    }
}

function handleEnPassant(move) {
    if(!move.isEnPassant) return;

    const captured = gameboard[move.from.row][move.to.col]

    if(captured) {
        if(captured[0] === "w") {
            capturedWhite.push(captured)
        } 
        else {
            capturedBlack.push(captured)
        }
        gameStats.captures++
    }

    gameboard[move.from.row][move.to.col] = null
}

function handleCastling(move) {
    if(!move.isCastleMove) return;

    if(move.to.col === 6) {
        const rook = gameboard[move.from.row][7]
        gameboard[move.from.row][5] = gameboard[move.from.row][7]
        gameboard[move.from.row][7] = null

        markMoved(rook, {row: move.from.row, col: 7})
    }
    
    if(move.to.col === 2) {
        const rook = gameboard[move.from.row][0]
        gameboard[move.from.row][3] = gameboard[move.from.row][0]
        gameboard[move.from.row][0] = null

        markMoved(rook, {row: move.from.row, col: 0})
    }
    gameStats.castles++
}

function updateCastlingRightsOnCapture(capturedPiece, square) {
    if(capturedPiece?.[1] !== "r") return;
    
    const {row, col} = square

    if(capturedPiece === "wr" && row === 7 && col === 0) hasMoved.wqr = true;
    if(capturedPiece === "wr" && row === 7 && col === 7) hasMoved.wkr = true;
    if(capturedPiece === "br" && row === 0 && col === 0) hasMoved.bqr = true;
    if(capturedPiece === "br" && row === 0 && col === 7) hasMoved.bkr = true;
}

function finishTurn(move) {
    playMoveSound(move);

    currentTurn = currentTurn === "w" ? "b" : "w"

    updateGameStatus();
    positionHistory.push(getPositionKey());
    checkGameEndingConditions();

    if(isComputerGame() && !gameOver && currentTurn === "b") {
        setTimeout(makeComputerMove, 1000)
    }
} 

function updateMoveTracking(move) {
    const capturedPieceFinal  = move.isEnPassant ? move.enPassantCapturedPiece : move.capturedPiece

    addMoveToHistory(move.piece, move.from, move.to, capturedPieceFinal, move.promotionChoice, move.isCastleMove, move.isEnPassant);

    lastMove = {piece: move.piece, from: {...move.from}, to: {...move.to}}
    lastMoveSquares = {from: {...move.from}, to: {...move.to}}

    updateHalfMoveClock(move);
}

function updateHalfMoveClock(move) {
    if(move.piece[1] === "p" || move.capturedPiece || move.isEnPassant) {
        halfMoveClock = 0
    } 
    else {
        halfMoveClock++
    }
}

function checkGameEndingConditions() {
    if(isCheckmate(currentTurn)) {
        gameOver = true
        playSound(sounds.gameover);
        const winner = currentTurn === "w" ? "Black" : "White"
        updateGameStatus(`Checkmate! ${winner} wins!`);
        return;
    }
    else if(isStalemate(currentTurn)) {
        gameOver = true
        playSound(sounds.gameover);
        updateGameStatus("Stalemate! It's a draw!");
        return;
    }
    else if(isInsufficientMaterial()) {
        gameOver = true
        playSound(sounds.gameover);
        updateGameStatus("Draw due to insufficient material!");
        return;
    }
    else if(halfMoveClock >= 100) {
        gameOver = true
        playSound(sounds.gameover);
        updateGameStatus("Draw by fifty-move rule");
        return;
    }
    else if(isThreefoldRepetition()) {
        gameOver = true
        playSound(sounds.gameover);
        updateGameStatus("Draw by threefold repetition!");
        return;
    }
    else if(isKingInCheck(currentTurn)) {
        updateGameStatus("Check!");
    }
}

// =================================================
//  Audio System
// =================================================

function playMoveSound(move) {
    let soundsToPlay = sounds.move

    const soundTurnCheck = move.piece[0] === "w" ? "b" : "w"

    if(isKingInCheck(soundTurnCheck)) {
        soundsToPlay = sounds.check;
        gameStats.checks++
    }
    else if(move.isCastleMove) {
        soundsToPlay = sounds.castle    
    }
    else if(move.promotionChoice) {
        soundsToPlay = sounds.promote
    }
    else if(move.capturedPiece || move.isEnPassant) {
        soundsToPlay = sounds.capture
    }

    playSound(soundsToPlay);
}

function playSound(sound) {
    if(audioVolume == 0) return;

    sound.currentTime = 0
    sound.volume = audioVolume;
    sound.play();
}

// =================================================
//  Computer Mode
// =================================================

function getAllLegalMoves(color) {
    const moves = []

    for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 8; col++) {
            const piece = gameboard[row][col]

            if(!piece || piece[0] !== color) continue;

            const from = {row, col}

            for(let r = 0; r < 8; r++) {
                for(let c = 0; c < 8; c++) {
                    const to = {row: r, col: c}

                    if(isLegalMove(piece, from, to)) {
                        moves.push({piece, from, to})
                    }
                }
            }
        }
    }

    return moves;
}

async function makeComputerMove() {
    if(gameOver) return;

    const legalMoves = getAllLegalMoves(computerColor);

    if(!legalMoves.length) return;

    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)]

    const moveData = await prepareMove(randomMove.piece, randomMove.from, randomMove.to);

    if(!moveData) return;

    executeMove(moveData);
    updateMoveTracking(moveData);
    refreshBoard();
    renderCapturedPieces();
    updateMaterialStatus();
    updateGameInfo();
    finishTurn(moveData);
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