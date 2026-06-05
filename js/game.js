const board = document.getElementById("chessboard");
let currentTurn = "w"
let gameOver = false
let selectedSquare = null
let lastMove = null
let positionHistory = []
let halfMoveClock = 0
let hasMoved = {
    wk: false,
    bk: false,
    wkr: false,
    wqr: false,
    bkr: false,
    bqr: false
}

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

function updateGameStatus(message = null) {
    const status = document.getElementById("game-status") 

    if(message) {
        status.textContent = message
        return;
    }

    status.textContent = currentTurn === "w" ? "White's turn" : "Black's turn"
}

function handleSquareClick(event) {
    const row = Number(event.target.dataset.row)
    const col = Number(event.target.dataset.col)

    const clickedPiece = gameboard[row][col] 

    if(gameOver) return;

    if(!selectedSquare) {

        if(!clickedPiece) return;
        if(clickedPiece[0] !== currentTurn) return;

        clearHighlights();
        selectedSquare = {row, col}
        event.target.classList.add("selected")
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

        const capturedPiece = gameboard[to.row][to.col]
        gameboard[to.row][to.col] = piece
        gameboard[from.row][from.col] = null

        if(isEnPassant) {
            gameboard[from.row][to.col] = null
        }

        promotePawn(piece, to.row, to.col)
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
            const winner = currentTurn === "w" ? "Black" : "White"
            updateGameStatus(`Checkmate! ${winner} wins!`);
        }
        else if(isStalemate(currentTurn)) {
            gameOver = true
            updateGameStatus("Stalemate! It's a draw!");
        }
        else if(isInsufficientMaterial()) {
            gameOver = true
            updateGameStatus("Draw due to insufficient material!");
        }
        else if(halfMoveClock >= 100) {
            gameOver = true
            updateGameStatus("Draw by fifty-move rule");
        }
        else if(isThreefoldRepetition()) {
            gameOver = true
            updateGameStatus("Draw by threefold repetition!")
        }
        else if(isKingInCheck(currentTurn)) {
            updateGameStatus("Check!");
        }
    } 
    selectedSquare = null
    clearHighlights();
    renderBoard();
    highlightCheckedKing();
}

renderBoard();
updateGameStatus();
positionHistory.push(getPositionKey());