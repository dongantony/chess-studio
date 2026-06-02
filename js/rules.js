// =============================================
// Move Validation
// =============================================

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


// =============================================
// Attack Logic (Check System)
// =============================================

function isSquareAttacked(row, col, attackerColor) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {

            const piece = gameboard[r][c]

            if(!piece) {
                continue;
            }

            if(piece[0] !== attackerColor) {
                continue;
            }

            const from = {row: r, col: c} 
            const to = {row, col}
            if(isPseudoLegalAttack(piece, from, to)) {
                return true;
            }
        }
    }
    
    return false;
} 

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


// =============================================
// Chess Piece Attack and Movement Logic
// =============================================

function canPawnAttack(piece, from, to) {
    const direction = piece[0] === "w" ? -1 : 1
    
    return (Math.abs(to.col - from.col) === 1 && to.row === from.row + direction);
}

function canKnightAttack(from, to) {
    const rowDiff = Math.abs(to.row - from.row)
    const colDiff = Math.abs(to.col - from.col)

    return ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2));
}

function canBishopAttack(from, to) {
    return Math.abs(to.row - from.row) === Math.abs(to.col - from.col);
}

function canRookAttack(from, to) {
    return (to.row === from.row) || (to.col === from.col);
}

function canQueenAttack(from, to) {
    return (canBishopAttack(from, to) || canRookAttack(from, to));
}

function canKingAttack(from, to) {
    const rowDiff = Math.abs(to.row - from.row) 
    const colDiff = Math.abs(to.col - from.col)

    return (rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0));
}

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

    return false;
}

function isValidKnightMove(piece, from, to) {
    const target = gameboard[to.row][to.col]

    if(isFriendly(piece, target)) {
        return false;
    }

    return canKnightAttack(from, to)
}

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

function isValidQueenMove(piece, from, to) {
    return isValidBishopMove(piece, from, to) || isValidRookMove(piece, from, to);
}

function isValidKingMove(piece, from, to) {
    const target = gameboard[to.row][to.col]
    
    if(isFriendly(piece, target)) {
        return false;
    }

    const rowDiff = Math.abs(to.row - from.row)
    const colDiff = Math.abs(to.col - from.col)

    if(rowDiff === 0 && colDiff === 0) {
        return false;
    }

    if(rowDiff > 1 || colDiff > 1) {
        return false;
    }

    const enemyColor = piece[0] === "w" ? "b" : "w"
    if(isSquareAttacked(to.row, to.col, enemyColor)) {
        return false;
    }

    const enemyKing = findKing(enemyColor) 
    if(enemyKing) {
        const r = Math.abs(to.row - enemyKing.row)
        const c = Math.abs(to.col - enemyKing.col)

        if (r <= 1 && c <= 1) {
            return false;
        }
    }

    return true;
}


// =============================================
// Helpers
// =============================================

function isFriendly(piece, target) {
    return target && target[0] === piece[0];
}

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

// =============================================
// Check Logic
// =============================================

function findKing(color) {
    const king = color + "k"

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameboard[row][col]

            if(piece === king) {
                return {row, col}
            }
        }
    }

    return null;
}

function isKingInCheck(color) {
    const kingPosition = findKing(color) 
    const enemyColor = color === "w" ? "b" : "w"

    if(!kingPosition) {
        return false;
    }

    return isSquareAttacked(kingPosition.row, kingPosition.col, enemyColor)
}

function wouldLeaveKingInCheck(piece, from, to) {
    const captured = gameboard[to.row][to.col]

    gameboard[to.row][to.col] = piece
    gameboard[from.row][from.col] = null

    const isCheck = isKingInCheck(piece[0]) 

    gameboard[to.row][to.col] = captured
    gameboard[from.row][from.col] = piece

    return isCheck;
}

function isAdjacentKing(to, enemyKingPos) {
    const rowDiff = Math.abs(to.row - enemyKingPos.row)
    const colDiff = Math.abs(to.col - enemyKingPos.col)

    return rowDiff <= 1 && colDiff <= 1;
}

function isLegalMove(piece, from, to) {
    return isValidMove(piece, from, to) && !wouldLeaveKingInCheck(piece, from, to);
}