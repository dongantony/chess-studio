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


// =============================================
// UI Rendering and Updates
// =============================================

function renderBoard() {
    board.innerHTML = ""

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            
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
    const mobileLayout = window.innerHeight <= 1100

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

function highlightLegalMoves(from) {
    const piece = gameboard[from.row][from.col]

    if(!piece) return;

    const squares = document.querySelectorAll(".square");

    for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 8; col++) {
            const to = { row, col }

            if(!isLegalMove(piece, from, to)) {
                continue;
            }

            const index = row * 8 + col
            const square = squares[index]

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
    if(!isKingInCheck(currentTurn)) return;

    const king = findKing(currentTurn)

    if(!king) return;

    const index = king.row * 8 + king.col
    document.querySelectorAll(".square")[index].classList.add("incheck")
}

function deselectPiece() {
    selectedSquare = null
    clearHighlights();
    renderBoard();
    highlightCheckedKing();
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

    renderSide(whiteBox, whiteCounts, "b")
    renderSide(blackBox, blackCounts, "w")
}

function updateGameStatus(message = null) {
    const status = document.getElementById("game-status") 

    if(message) {
        status.textContent = message
        return;
    }

    status.textContent = currentTurn === "w" ? "White's turn" : "Black's turn"
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

    moveHistory.forEach(move => {
        const li = document.createElement("li")
        li.textContent = move
        list.appendChild(li)
    })

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

        const squares = document.querySelectorAll(".square")
        const index = row * 8 + col

        squares[index].classList.add("selected")
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
            if(capturedPiece[0] === "w") {
                capturedWhite.push(capturedPiece)
            }
            else {
                capturedBlack.push(capturedPiece)
            }
        }

        gameboard[to.row][to.col] = piece
        gameboard[from.row][from.col] = null

        if(piece[1] === "p" && promotionChoice) {
            gameboard[to.row][to.col] = piece[0] + promotionChoice
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
        }

        const capturedPieceFinal = isEnPassant ? enPassantCapturedPiece : capturedPiece
        addMoveToHistory(piece, from, to, capturedPieceFinal, promotionChoice, isCastleMove, isEnPassant)

        let soundsToPlay = sounds.move
        const soundTurnCheck = piece[0] === "w" ? "b" : "w"

        if(isKingInCheck(soundTurnCheck)) {
            soundsToPlay = sounds.check;
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
    renderBoard();
    renderCapturedPieces();
    updateMaterialStatus();
    highlightCheckedKing();
}

function playSound(sound) {
    sound.currentTime = 0
    sound.play();
}


renderBoard();
renderCapturedPieces();
updateGameStatus();
positionHistory.push(getPositionKey());

updateBoardSize();
window.addEventListener("resize", updateBoardSize)

document.addEventListener("DOMContentLoaded", () => {
   const sidebar = document.getElementById("sidebar")
   const sidebarToggle = document.getElementById("sidebar-toggle")
   const overlay = document.getElementById("sidebar-overlay")
   
   sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open")
        overlay.classList.toggle("show")
   })

   overlay.addEventListener("click", () => {
        sidebar.classList.toggle("open")
        overlay.classList.toggle("show")
   })
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