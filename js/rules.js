let hasMoved = {
    wk: false,
    bk: false,
    wkr: false,
    wqr: false,
    bkr: false,
    bqr: false
}

/* =============================================
   Move Validation
   ============================================= */

// Tracks whether each king and rook has moved.
// Used to determine if castling is still legal.
function isValidMove(piece, from, to) {
    switch(piece[1]) {
        
        case "p":
            return isValidPawnMove(piece, from, to)
        case "n":
            return isValidKnightMove(piece, from, to)
        case "b":
            return isValidBishopMove(piece, from, to)
        case "r":
            return isValidRookMove(piece, from, to)
        case "q":
            return isValidQueenMove(piece, from, to)
        case "k":
            return isValidKingMove(piece, from, to)
    }

    return false;
}


/* =============================================
   Attack Logic (Check System)
   ============================================= */

// Checks whether a square is currently attacked
// by any piece of the specified color.
function isSquareAttacked(row, col, attackerColor) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {

            const piece = gameboard[r][c]

            if(!piece) continue;
            if(piece[0] !== attackerColor) continue;

            const from = {row: r, col: c} 
            const to = {row, col}
            if(isPseudoLegalAttack(piece, from, to)) {
                return true;
            }
        }
    }
    
    return false;
} 

// Determines if a piece attacks a square without
// considering whether its own king is left in check.
function isPseudoLegalAttack(piece, from, to) {
    const target = gameboard[to.row][to.col]

    if(target && target[0] === piece[0]) {
        return false;
    }

    switch(piece[1]) {

        case "p":
            return canPawnAttack(piece, from, to)
        case "n":
            return canKnightAttack(from, to)
        case "b":
            return canBishopAttack(from, to) && isPathClear(from, to)
        case "r":
            return canRookAttack(from, to) && isPathClear(from, to)
        case "q":
            return canQueenAttack(from, to) && isPathClear(from, to)
        case "k":
            return canKingAttack(from, to)
    }

    return false;
}


/* =============================================
   Chess Piece Attack and Movement Logic
   ============================================= */

// Returns whether a pawn attacks the destination square.
function canPawnAttack(piece, from, to) {
    const direction = piece[0] === "w" ? -1 : 1
    
    return (Math.abs(to.col - from.col) === 1 && to.row === from.row + direction);
}

// Returns whether a knight attacks the destination square.
function canKnightAttack(from, to) {
    const rowDiff = Math.abs(to.row - from.row)
    const colDiff = Math.abs(to.col - from.col)

    return ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2));
}

// Returns whether a bishop attacks the destination square.
function canBishopAttack(from, to) {
    return Math.abs(to.row - from.row) === Math.abs(to.col - from.col);
}

// Returns whether a rook attacks the destination square.
function canRookAttack(from, to) {
    return (to.row === from.row) || (to.col === from.col);
}

// Returns whether a queen attacks the destination square.
function canQueenAttack(from, to) {
    return (canBishopAttack(from, to) || canRookAttack(from, to));
}

// Returns whether a king attacks the destination square.
function canKingAttack(from, to) {
    const rowDiff = Math.abs(to.row - from.row) 
    const colDiff = Math.abs(to.col - from.col)

    return (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0));
}

// Validates all pawn movement including:
// • Single move
// • Double move
// • Captures
// • En passant
function isValidPawnMove(piece, from, to) {
    const direction = piece[0] === "w" ? -1 : 1
    const target = gameboard[to.row][to.col]
    
    if(isFriendly(piece, target)) {
        return false;
    }

    if(from.col === to.col && from.row + direction === to.row && !target) {
        return true;
    }

    const startPawn = (piece[0] === "w" && from.row === 6) || (piece[0] === "b" && from.row === 1)
    const middleRow = from.row + direction
    const middleSpace = (middleRow >= 0 && middleRow < 8) ? gameboard[from.row + direction][from.col] : null

    if(from.col === to.col && from.row + direction * 2 === to.row && startPawn && !target && !middleSpace) {
        return true;
    }

    if(Math.abs(to.col - from.col ) === 1 && from.row + direction === to.row && target && target[0] !== piece[0]) {
        return true;
    }

    if(Math.abs(to.col - from.col) === 1 && from.row + direction === to.row && !target && lastMove) {
        const enemyPawn = gameboard[from.row][to.col]

        if(enemyPawn && enemyPawn === lastMove.piece && enemyPawn[1] === "p" && 
           enemyPawn[0] !== piece [0] && Math.abs(lastMove.from.row - lastMove.to.row) === 2 && 
           lastMove.to.row === from.row && lastMove.to.col === to.col) {
            return true;
        }
    }

    return false;
}

// Validates knight movement.
function isValidKnightMove(piece, from, to) {
    const target = gameboard[to.row][to.col]

    if(isFriendly(piece, target)) {
        return false;
    }

    return canKnightAttack(from, to)
}

// Validates bishop movement and ensures
// no pieces block its path.
function isValidBishopMove(piece, from, to) {
    const target = gameboard[to.row][to.col]

    if(isFriendly(piece, target)) {
        return false;
    }

    if(Math.abs(to.row - from.row) !== Math.abs(to.col - from.col)) {
        return false
    }

    return isPathClear(from, to);
}

// Validates rook movement and ensures
// no pieces block its path.
function isValidRookMove(piece, from , to) {
    const target = gameboard[to.row][to.col]

    if(isFriendly(piece, target)) {
        return false;
    }

    if((to.row !== from.row) && (to.col !== from.col)) {
        return false;
    }

    return isPathClear(from, to);
}

// Queen movement combines rook and bishop movement.
function isValidQueenMove(piece, from, to) {
    return isValidBishopMove(piece, from, to) || isValidRookMove(piece, from, to);
}

// Validates king movement including castling.
function isValidKingMove(piece, from, to) {
    const target = gameboard[to.row][to.col]
    
    if(isFriendly(piece, target)) {
        return false;
    }

    const rowDiff = Math.abs(to.row - from.row)
    const colDiff = Math.abs(to.col - from.col)

    if(rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)) {
        return !wouldLeaveKingInCheck(piece, from, to);
    }

    if(canCastle(piece, from, to)) {
        return true;
    }

    return false;
}


/* =============================================
   Special Moves (Castling, En Passant, Promotion)
   ============================================= */

// Determines whether castling is currently legal
// on either the king-side or queen-side.
function canCastle(piece, from, to) {
    const color = piece[0]
    const row = color === "w" ? 7 : 0
    const enemy = color === "w" ? "b" : "w"
    const kingSideSquares = [4, 5, 6]
    const queenSideSquares = [4, 3, 2]

    if(isKingInCheck(color)) {
        return false;   
    }

    if(to.row !== row || from.row !== row) {
        return false;
    }

    if(Math.abs(to.col - from.col) !== 2) {
        return false;
    }

    if(to.col === 6) {
        const rook = gameboard[row][7]
        
        if(rook !== color + "r") return false;
        
        if(hasMoved[color + "k"]) return false;
        if(color === "w" && hasMoved.wkr) return false;
        if(color === "b" && hasMoved.bkr) return false;
        
        if(gameboard[row][5] || gameboard[row][6]) return false;

        for (let c of kingSideSquares) {
            if(isSquareAttacked(row, c, enemy)) {
                return false;
            }
        }

        return true;
    }

    if(to.col === 2) {
        const rook = gameboard[row][0]

        if(rook !== color + "r") return false;

        if(hasMoved[color + "k"]) return false;
        if(color === "w" && hasMoved.wqr) return false;
        if(color === "b" && hasMoved.bqr) return false;
        
        if(gameboard[row][1] || gameboard[row][2] || gameboard[row][3]) return false;
        
        for (let c of queenSideSquares) {
            if(isSquareAttacked(row, c, enemy)) {
                return false;
            }
        }

        return true;
    }

    return false;
}

// Displays the promotion dialog when a pawn
// reaches the final rank.
async function promotePawn(piece, to) {
    if(piece[1] !== "p") return null;
    
    const reachedEnd = (piece[0] === "w" && to.row === 0) || (piece[0] === "b" && to.row === 7)

    if(!reachedEnd) return null;

    const choice = await showPromotionModal(piece[0])

    return choice;
}


/* =============================================
   Helper Functions
   ============================================= */

// Returns true if both pieces belong to the same player.
function isFriendly(piece, target) {
    return target && target[0] === piece[0];
}

// Checks whether every square between the start
// and destination is empty.
function isPathClear(from, to) {
    const rowStep = Math.sign(to.row - from.row)
    const colStep = Math.sign(to.col - from.col)

    let row = from.row + rowStep
    let col = from.col + colStep

    while (row !== to.row || col !== to.col) {

        if(gameboard[row][col]) {
            return false;
        }

        row += rowStep
        col += colStep
    }

    return true;
}

// Returns a list of every piece currently on the board.
function getPieces() {
    const pieces = []

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameboard[row][col]

            if(piece) {
                pieces.push({piece, row, col})
            }
        }
    }

    return pieces;
}


/* =============================================
   Check, Checkmate, Stalemate, and Insufficient Material Detection
   ============================================= */

// Returns true if the specified player is checkmated.
function isCheckmate(color) {
    return isKingInCheck(color) && !hasLegalMoves(color);
}

// Returns true if the specified player has no legal
// moves but is not in check.
function isStalemate(color) {
    return !isKingInCheck(color) && !hasLegalMoves(color);
}

// Returns whether a piece is a king.
function isKing(piece) {
    return piece && piece[1] === "k";
}

// Finds and returns the king's position.
function findKing(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameboard[row][col]

            if(isKing(piece) && piece[0] === color) {
                return {row, col}
            }
        }
    }

    return null;
}

// Determines whether the specified king
// is currently under attack.
function isKingInCheck(color) {
    const kingPosition = findKing(color) 
    const enemyColor = color === "w" ? "b" : "w"

    if(!kingPosition) {
        return false;
    }

    return isSquareAttacked(kingPosition.row, kingPosition.col, enemyColor)
}

// Simulates a move to determine whether
// it would expose the player's king to check.
function wouldLeaveKingInCheck(piece, from, to) {
    const captured = gameboard[to.row][to.col]
    let enPassantCaptured = null

    const isEnPassant = piece[1] === "p" && Math.abs(to.col - from.col) === 1 && !captured &&
                        lastMove && Math.abs(lastMove.from.row - lastMove.to.row) === 2 && 
                        lastMove.to.row === from.row && lastMove.to.col === to.col

    if(isEnPassant) {
        enPassantCaptured = gameboard[from.row][to.col]
        gameboard[from.row][to.col] = null
    }

    gameboard[to.row][to.col] = piece
    gameboard[from.row][from.col] = null

    const isCheck = isKingInCheck(piece[0]) 

    gameboard[to.row][to.col] = captured
    gameboard[from.row][from.col] = piece

    if(isEnPassant) {
        gameboard[from.row][to.col] = enPassantCaptured
    }

    return isCheck;
}

// Determines whether a board square is light colored.
function isLightSquare(row, col) {
    return (row + col) % 2 === 0;
}

// Detects draw positions caused by
// insufficient mating material.
function isInsufficientMaterial() {
    const pieces = getPieces()

    const nonKings = pieces.filter(p => p.piece[1] !== "k")

    if(nonKings.length === 0) {
        return true;
    }

    if(nonKings.length === 1) {
        const type = nonKings[0].piece[1]
        return type === "b" || type === "n";
    }

    if(nonKings.length === 2) {
        const piece1 = nonKings[0]
        const piece2 = nonKings[1]
        const types = [piece1.piece[1], piece2.piece[1]].sort().join("")

        if(types === "bb" && piece1.piece[0] !== piece2.piece[0]) {
            return (isLightSquare(piece1.row, piece1.col) === isLightSquare(piece2.row, piece2.col));
        }

        if(types === "nn") {
            return true;
        }

        if((types === "bn") || (types === "nb")) {
            return true;
        }
    }

    return false;
}

// Creates a unique key representing the
// current board state for repetition detection.
function getPositionKey() {
    const enPassantSquare = lastMove && lastMove.piece[1] === "p" &&
                            Math.abs(lastMove.from.row - lastMove.to.row) === 2 ?
                            { row: (lastMove.from.row + lastMove.to.row) / 2, col: lastMove.to.col } : null

    return JSON.stringify({board: gameboard, turn: currentTurn, castling: hasMoved, enPassant: enPassantSquare});
}

// Detects threefold repetition.
function isThreefoldRepetition() {
    const current = getPositionKey()
    let count = 0

    for (const pos of positionHistory) {
        if(pos === current) {
            count++

            if(count >= 3) {
                return true;
            }
        }
    }
    
    return false;
}


/* =============================================
   Move Legality and Game State Helpers
   ============================================= */

// Returns whether a move is completely legal,
// including king safety.
function isLegalMove(piece, from, to) {
    return isValidMove(piece, from, to) && !wouldLeaveKingInCheck(piece, from, to);
}

// Determines whether the specified player
// has at least one legal move remaining.
function hasLegalMoves(color) {
    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const piece = gameboard[fromRow][fromCol]
            const from = {row: fromRow, col: fromCol}

            if(!piece || piece[0] !== color) {
                continue;
            }

            for (let toRow = 0; toRow < 8; toRow++) {
                for (let toCol = 0; toCol < 8; toCol++) {
                    const to = {row: toRow, col: toCol}

                    if(isLegalMove(piece, from, to)) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

// Records whether a king or rook has moved,
// permanently affecting castling rights.
function markMoved(piece, from) {
    if(!piece) {
        return;
    }

    const color = piece[0]
    const type = piece[1]

    if(type === "k") {
        hasMoved[color + "k"] = true;
    }

    if(type === "r") {
        if(color === "w") {
            if(from.col === 7) hasMoved["wkr"] = true;
            if(from.col === 0) hasMoved["wqr"] = true;
        }

        if(color === "b") {
            if(from.col === 7) hasMoved["bkr"] = true;
            if(from.col === 0) hasMoved["bqr"] = true;
        }
    }
}