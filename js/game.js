const board = document.getElementById("chessboard");
let selectedSquare = null
let currentTurn = "w"

function renderBoard() {
    board.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            
            const square = document.createElement("div");

            square.classList.add("square");

            if((row + col) % 2 == 0) {
                square.classList.add("light")
            } 
            else {
                square.classList.add("dark")
            }

            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener("click", handleSquareClick)

            const piece = gameboard[row][col];

            if(piece) {
                square.textContent = pieces[piece]
            }

            board.appendChild(square);
        }
    }
}

function handleSquareClick(event) {
    const row = Number(event.target.dataset.row)
    const col = Number(event.target.dataset.col)

    const clickedPiece = gameboard[row][col] 

    if (!selectedSquare) {

        if (!clickedPiece) return;
        if (clickedPiece[0] !== currentTurn) return;

        selectedSquare = {row, col};

        event.target.classList.add("selected");

        return;
    }

    const from = selectedSquare
    const to = {row, col}
    const piece = gameboard[from.row][from.col]

    if(isLegalMove(piece, from, to)) {
        gameboard[to.row][to.col] = gameboard[from.row][from.col]
        gameboard[from.row][from.col] = null

        currentTurn = (currentTurn === "w" ? "b" : "w") 
    } 

    selectedSquare = null
    renderBoard();
}


renderBoard();