const pieceData = {
    pawn: {
        image: "img/black-pawn.png",
        name: "Pawn",
        value: "1",
        symbol: "♙",
        details: [
            "Moves forward one square.",
            "Can move two squares on its first move.",
            "Captures diagonally.",
            "Can promote on the final rank."
        ]
    },
    rook: {
        image: "img/black-rook.png",
        name: "Rook",
        value: "5",
        symbol: "♖",
        details: [
            "Moves horizontally.",
            "Moves vertically.",
            "Any number of squares."
        ]
    },
    knight: {
        image: "img/black-knight.png",
        name: "Knight",
        value: "3",
        symbol: "♘",
        details: [
            "Moves in an L shape.",
            "Can jump over pieces.",
            "Excellent for forks."
        ]
    },
    bishop: {
        image: "img/black-bishop.png",
        name: "Bishop",
        value: "3",
        symbol: "♗",
        details: [
            "Moves diagonally.",
            "Any number of squares.",
            "Controls long diagonals."
        ]
    },
    queen: {
        image: "img/black-queen.png",
        name: "Queen",
        value: "9",
        symbol: "♕",
        details: [
            "The most powerful piece.",
            "Moves like a rook and bishop combined."
        ]
    },
    king: {
        image: "img/black-king.png",
        name: "King",
        value: "Infinite",
        symbol: "♔",
        details: [
            "Moves one square in any direction.",
            "Must never move into check.",
            "Can castle."
        ]
    }
}

const specialData = {
    castleBefore: [
        {piece: "white-rook", row: 7, col: 0},
        {piece: "white-knight", row: 7, col: 1},
        {piece: "white-bishop", row: 7, col: 2},
        {piece: "white-queen", row: 7, col: 3},
        {piece: "white-king", row: 7, col: 4},
        {piece: "white-rook", row: 7, col: 7},
        {piece: "white-pawn", row: 6, col: 0},
        {piece: "white-pawn", row: 6, col: 1},
        {piece: "white-pawn", row: 6, col: 2},
        {piece: "white-pawn", row: 6, col: 3},
        {piece: "white-pawn", row: 6, col: 4},
        {piece: "white-pawn", row: 6, col: 5},
        {piece: "white-pawn", row: 6, col: 6},
        {piece: "white-pawn", row: 6, col: 7},

        {piece: "black-rook", row: 0, col: 0},
        {piece: "black-knight", row: 0, col: 1},
        {piece: "black-bishop", row: 0, col: 2},
        {piece: "black-queen", row: 0, col: 3},
        {piece: "black-king", row: 0, col: 4},
        {piece: "black-bishop", row: 0, col: 5},
        {piece: "black-knight", row: 0, col: 6},
        {piece: "black-rook", row: 0, col: 7},
        {piece: "black-pawn", row: 1, col: 0},
        {piece: "black-pawn", row: 1, col: 1},
        {piece: "black-pawn", row: 1, col: 2},
        {piece: "black-pawn", row: 1, col: 3},
        {piece: "black-pawn", row: 1, col: 4},
        {piece: "black-pawn", row: 1, col: 5},
        {piece: "black-pawn", row: 1, col: 6},
        {piece: "black-pawn", row: 1, col: 7}
    ],
    castleAfter: [
        {piece: "white-rook", row: 7, col: 0},
        {piece: "white-knight", row: 7, col: 1},
        {piece: "white-bishop", row: 7, col: 2},
        {piece: "white-queen", row: 7, col: 3},
        {piece: "white-king", row: 7, col: 6},
        {piece: "white-rook", row: 7, col: 5},
        {piece: "white-pawn", row: 6, col: 0},
        {piece: "white-pawn", row: 6, col: 1},
        {piece: "white-pawn", row: 6, col: 2},
        {piece: "white-pawn", row: 6, col: 3},
        {piece: "white-pawn", row: 6, col: 4},
        {piece: "white-pawn", row: 6, col: 5},
        {piece: "white-pawn", row: 6, col: 6},
        {piece: "white-pawn", row: 6, col: 7},

        {piece: "black-rook", row: 0, col: 0},
        {piece: "black-knight", row: 0, col: 1},
        {piece: "black-bishop", row: 0, col: 2},
        {piece: "black-queen", row: 0, col: 3},
        {piece: "black-king", row: 0, col: 4},
        {piece: "black-bishop", row: 0, col: 5},
        {piece: "black-knight", row: 0, col: 6},
        {piece: "black-rook", row: 0, col: 7},
        {piece: "black-pawn", row: 1, col: 0},
        {piece: "black-pawn", row: 1, col: 1},
        {piece: "black-pawn", row: 1, col: 2},
        {piece: "black-pawn", row: 1, col: 3},
        {piece: "black-pawn", row: 1, col: 4},
        {piece: "black-pawn", row: 1, col: 5},
        {piece: "black-pawn", row: 1, col: 6},
        {piece: "black-pawn", row: 1, col: 7}
    ],
    enPassantBefore: [
        {piece: "white-rook", row: 7, col: 0},
        {piece: "white-knight", row: 7, col: 1},
        {piece: "white-bishop", row: 7, col: 2},
        {piece: "white-queen", row: 7, col: 3},
        {piece: "white-king", row: 7, col: 4},
        {piece: "white-bishop", row: 7, col: 5},
        {piece: "white-knight", row: 7, col: 6},
        {piece: "white-rook", row: 7, col: 7},
        {piece: "white-pawn", row: 6, col: 0},
        {piece: "white-pawn", row: 6, col: 1},
        {piece: "white-pawn", row: 6, col: 2},
        {piece: "white-pawn", row: 6, col: 3},
        {piece: "white-pawn", row: 3, col: 4},
        {piece: "white-pawn", row: 6, col: 5},
        {piece: "white-pawn", row: 6, col: 6},
        {piece: "white-pawn", row: 6, col: 7},

        {piece: "black-rook", row: 0, col: 0},
        {piece: "black-knight", row: 0, col: 1},
        {piece: "black-bishop", row: 0, col: 2},
        {piece: "black-queen", row: 0, col: 3},
        {piece: "black-king", row: 0, col: 4},
        {piece: "black-bishop", row: 0, col: 5},
        {piece: "black-knight", row: 0, col: 6},
        {piece: "black-rook", row: 0, col: 7},
        {piece: "black-pawn", row: 1, col: 0},
        {piece: "black-pawn", row: 1, col: 1},
        {piece: "black-pawn", row: 1, col: 2},
        {piece: "black-pawn", row: 3, col: 3},
        {piece: "black-pawn", row: 1, col: 4},
        {piece: "black-pawn", row: 1, col: 5},
        {piece: "black-pawn", row: 1, col: 6},
        {piece: "black-pawn", row: 1, col: 7}
    ],
    enPassantAfter: [
        {piece: "white-rook", row: 7, col: 0},
        {piece: "white-knight", row: 7, col: 1},
        {piece: "white-bishop", row: 7, col: 2},
        {piece: "white-queen", row: 7, col: 3},
        {piece: "white-king", row: 7, col: 4},
        {piece: "white-bishop", row: 7, col: 5},
        {piece: "white-knight", row: 7, col: 6},
        {piece: "white-rook", row: 7, col: 7},
        {piece: "white-pawn", row: 6, col: 0},
        {piece: "white-pawn", row: 6, col: 1},
        {piece: "white-pawn", row: 6, col: 2},
        {piece: "white-pawn", row: 6, col: 3},
        {piece: "white-pawn", row: 2, col: 3},
        {piece: "white-pawn", row: 6, col: 5},
        {piece: "white-pawn", row: 6, col: 6},
        {piece: "white-pawn", row: 6, col: 7},

        {piece: "black-rook", row: 0, col: 0},
        {piece: "black-knight", row: 0, col: 1},
        {piece: "black-bishop", row: 0, col: 2},
        {piece: "black-queen", row: 0, col: 3},
        {piece: "black-king", row: 0, col: 4},
        {piece: "black-bishop", row: 0, col: 5},
        {piece: "black-knight", row: 0, col: 6},
        {piece: "black-rook", row: 0, col: 7},
        {piece: "black-pawn", row: 1, col: 0},
        {piece: "black-pawn", row: 1, col: 1},
        {piece: "black-pawn", row: 1, col: 2},
        {piece: "black-pawn", row: 1, col: 4},
        {piece: "black-pawn", row: 1, col: 5},
        {piece: "black-pawn", row: 1, col: 6},
        {piece: "black-pawn", row: 1, col: 7}
    ],
    promotionBefore: [
        {piece: "white-pawn", row: 1, col: 4},
        {piece: "black-king", row: 0, col: 7},
        {piece: "white-king", row: 7, col: 6},
        {piece: "white-rook", row: 6, col: 0},
        {piece: "black-pawn", row: 2, col: 6}
    ],
    promotionAfter: [
        {piece: "white-queen", row: 0, col: 4},
        {piece: "black-king", row: 1, col: 7},
        {piece: "white-king", row: 7, col: 6},
        {piece: "white-rook", row: 6, col: 0},
        {piece: "black-pawn", row: 2, col: 6}
    ],
    castleHighlights: [
        {row: 7, col: 5, class: "special-target"},
        {row: 7, col: 6, class: "special-target"}
    ],
    enPassantHighlights: [
        {row: 1, col: 3, class: "special-target"},
        {row: 2, col: 3, class: "special-target"}
    ],
    promotionHighlights: [
        {row: 0, col: 4, class: "special-target"},
    ],
    empty: []
}

const demoData = {
    center: {
        title: "Control the Center",
        text: "Central squares allow your pieces to influence more of the board.",
        category: "Strategy",
        explanation: [
            "Green show important central squares.",
            "Pieces placed here attack more squares.",
            "Controlling the center gives greater mobility."
        ],
        pieces: [
            {piece: "white-pawn", row: 4, col: 3},
            {piece: "white-pawn", row: 4, col: 4},
            {piece: "black-pawn", row: 3, col: 3},
            {piece: "black-pawn", row: 3, col: 4},
            {piece: "black-knight", row: 2, col: 5}, 
            {piece: "white-knight", row: 5, col: 2},
            {piece: "white-bishop", row: 6, col: 2}, 
            {piece: "black-rook", row: 3, col: 7}
        ],
        highlights: [
            {row: 3, col: 3, class: "mini-good"},
            {row: 3, col: 4, class: "mini-good"},
            {row: 4, col: 3, class: "mini-good"},
            {row: 4, col: 4, class: "mini-good"}
        ]
    },
    development: {
        title: "Develop Minor Pieces",
        text: "Knights and bishops should come out early.",
        category: "Strategy",
        explanation: [
            "Green represent active developing squares.",
            "Minor pieces should leave the back rank quickly.",
            "Active pieces help control the center."
        ],
        pieces: [
            {piece: "white-king", row: 7, col: 4},
            {piece: "white-knight", row: 5, col: 2},
            {piece: "white-knight", row: 5, col: 5},
            {piece: "white-bishop", row: 4, col: 5}, 
            {piece: "white-bishop", row: 4, col: 2},
            {piece: "white-pawn", row: 6, col: 3}, 
            {piece: "white-pawn", row: 6, col: 4}
        ],
        highlights: [
            {row: 5, col: 2, class: "mini-good"},
            {row: 5, col: 5, class: "mini-good"},
            {row: 4, col: 2, class: "mini-good"},
            {row: 4, col: 5, class: "mini-good"}
        ]
    },
    safety: {
        title: "King Safety",
        text: "Castling keeps the king protected.",
        category: "Strategy",
        explanation: [
            "Green indicate a safe king position.",
            "Castling hides the king behind pawns.",
            "The rook becomes active after castling."
        ],
        pieces: [
            {piece: "white-king", row: 7, col: 6},
            {piece: "white-rook", row: 7, col: 5},
            {piece: "white-pawn", row: 6, col: 5},
            {piece: "white-pawn", row: 6, col: 6}, 
            {piece: "white-pawn", row: 6, col: 7},
            {piece: "black-queen", row: 3, col: 2}, 
            {piece: "black-knight", row: 1, col: 3}
        ],
        highlights: [
            {row: 7, col: 5, class: "mini-good"},
            {row: 7, col: 6, class: "mini-good"},
            {row: 6, col: 5, class: "mini-good"},
            {row: 6, col: 6, class: "mini-good"},
            {row: 6, col: 7, class: "mini-good"}
        ]
    },
    hanging: {
        title: "Hanging Piece",
        text: "Always defend your pieces.",
        category: "Tactic",
        explanation: [
            "Red mean danger.",
            "The knight is undefended.",
            "Your opponent can capture it for free."
        ],
        pieces: [
            {piece: "black-knight", row: 2, col: 5}, 
            {piece: "white-rook", row: 2, col: 2},
            {piece: "black-pawn", row: 3, col: 5}, 
            {piece: "black-king", row: 0, col: 4},
            {piece: "white-knight", row: 5, col: 4}, 
            {piece: "white-king", row: 7, col: 6}
        ],
        highlights: [
            {row: 2, col: 5, class: "mini-danger"},
            {row: 3, col: 5, class: "mini-danger"}
        ]
    },
    fork: {
        title: "Fork",
        text: "A fork occurs when one piece attacks two or more enemy pieces at the same time.",
        category: "Tactic",
        explanation: [
            "The knight attacks both the king and queen.",
            "Fork often win material.",
            "Knights are good at forking since they jump over pieces."
        ],
        pieces: [
            {piece: "white-knight", row: 4, col: 4}, 
            {piece: "black-king", row: 2, col: 3},
            {piece: "black-queen", row: 2, col: 5},
            {piece: "white-king", row: 6, col: 2}, 
            {piece: "white-rook", row: 7, col: 7},
            {piece: "black-pawn", row: 4, col: 6}
        ],
        highlights: [
            {row: 2, col: 5, class: "mini-danger"},
            {row: 2, col: 3, class: "mini-danger"},
            {row: 4, col: 4, class: "mini-good"}              
        ]
    },
    pin: {
        title: "Pin",
        text: "A pinned piece cannot move because doing so would expose a more valuable piece behind it.",
        category: "Tactic",
        explanation: [
            "The bishop attacks through the knight.",
            "Moving the knight would expose the king.",
            "Pinned pieces often become difficult to defend."
        ],
        pieces: [
            {piece: "black-king", row: 2, col: 4}, 
            {piece: "black-knight", row: 3, col: 3},
            {piece: "white-bishop", row: 5, col: 1},
            {piece: "white-king", row: 6, col: 2}, 
            {piece: "white-rook", row: 1, col: 0},
            {piece: "black-pawn", row: 6, col: 6}
        ],
        highlights: [
            {row: 2, col: 4, class: "mini-danger"},
            {row: 5, col: 1, class: "mini-good"}        
        ]
    },
    discovered: {
        title: "Discovered Attack",
        text: "Moving one piece can reveal an attack from another piece behind it.",
        category: "Tactic",
        explanation: [
            "The bishop is blocked by its own knight.",
            "When the knight moves, the bishop can attack the queen.",
            "Discovered attacks can create powerful tactical threats."
        ],
        pieces: [
            {piece: "white-bishop", row: 6, col: 1},
            {piece: "white-knight", row: 4, col: 3},
            {piece: "black-queen", row: 2, col: 5},
            {piece: "white-king", row: 6, col: 2}, 
            {piece: "black-king", row: 0, col: 3},
            {piece: "black-bishop", row: 4, col: 6}
        ],
        highlights: [
            {row: 4, col: 3, class: "mini-good"},
            {row: 2, col: 5, class: "mini-danger"}        
        ]
    }
}

const demos = [
    "center",
    "development",
    "safety",
    "hanging",
    "fork",
    "pin",
    "discovered"
]

const accordionBtn = document.querySelectorAll(".accordion-header")
const tabs = document.querySelectorAll(".piece-tab")

let currentDemo = 0
const demoSelect = document.getElementById("demo-select")
const prevDemoBtn = document.getElementById("prev-demo")
const nextDemoBtn = document.getElementById("next-demo")

accordionBtn.forEach(button => {
    button.addEventListener("click", () => {
        const content = button.nextElementSibling
        button.classList.toggle("active")

        if(content.style.maxHeight) {
            content.style.maxHeight = null
            content.classList.remove("open")
        } 
        else {
            content.style.maxHeight = content.scrollHeight + "px"
            content.classList.add("open")
        }
    })
})

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"))
        tab.classList.add("active")

        const piece = pieceData[tab.dataset.piece]

        document.getElementById("piece-image").src = piece.image
        document.getElementById("piece-name").textContent = piece.name
        document.getElementById("piece-value").textContent = `Value: ${piece.value}`
        document.getElementById("piece-details").innerHTML = 
            piece.details.map(
                detail => `<li>${detail}</li>`
            ).join("")

        renderMiniBoard(tab.dataset.piece)
    })
})

function renderMiniBoard(pieceType) {
    const board = document.getElementById("movement-board")
    board.innerHTML = ""
    const center = {row: 2, col: 1}

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const square = document.createElement("div")

            square.classList.add("mini-square", (row + col) % 2 === 0 ? "mini-light" : "mini-dark")

            if(row === center.row && col === center.col) {
                square.innerHTML = `<img class="mini-movement-piece" src="${pieceData[pieceType].image}" alt="">`
            }

            board.appendChild(square)
        }
    }
    highlightMoves(pieceType, center)
}

function highlightSquare(row, col) {
    if(row < 0 || row > 3 || col < 0 || col > 3) return;

    const index = row * 4 + col 

    document.querySelectorAll("#movement-board .mini-square")[index].classList.add("mini-target")
}

function highlightMoves(piece, center) {
    const r = center.row
    const c = center.col

    switch(piece) {
        
        case "pawn":
            highlightSquare(r - 1, c)
            break;

        case "rook":
            for (let i = 0; i < 4; i++) {
                if(i !== r) highlightSquare(i, c)
                if(i !== c) highlightSquare(r, i)
            }
            break;

        case "bishop":
            for (let i  = -3; i <= 3; i++) {
                if(i === 0) continue;

                highlightSquare(r + i, c + i)
                highlightSquare(r + i, c - i)
            }
            break;

        case "queen":
            for (let i = 0; i < 4; i++) {
                if(i !== r) highlightSquare(i, c)
                if(i !== c) highlightSquare(r, i)
            }

            for (let i  = -3; i <= 3; i++) {
                if(i === 0) continue;

                highlightSquare(r + i, c + i)
                highlightSquare(r + i, c - i)
            }
            break;

        case "king":
            for (let kR = -1; kR <= 1; kR++) {
                for (let kC = -1; kC <= 1; kC++) {

                    if(kR === 0 && kC === 0) continue;
                    
                    highlightSquare(r + kR, c + kC)
                }
            }
            break;
        
        case "knight":
            const jumps = [
                [-2,-1],
                [-2, 1],
                [-1,-2],
                [-1, 2],
                [ 1,-2],
                [ 1, 2],
                [ 2,-1],
                [ 2, 1]
            ]

            jumps.forEach(([nR, nC]) => 
                highlightSquare(r + nR, c + nC)
            ) 
            break;
    }
}

function renderSpecialBoard(id, pieces, highlights) {
    const board = document.getElementById(id)
    board.innerHTML = ""

    for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 8; col++) {
            const square = document.createElement("div")

            square.classList.add("mini-square", (row + col) % 2 === 0 ? "mini-light" : "mini-dark")
            pieces.forEach(piece => {
                if(piece.row === row && piece.col === col) {
                    square.innerHTML = `<img class="special-rule-piece" src="img/${piece.piece}.png">`
                }
            })

            highlights.forEach(highlight => {
                if(highlight.row === row && highlight.col === col) {
                    square.classList.add(highlight.class)
                }
            })

            board.appendChild(square)
        }
    }
}

function renderDemoBoard(type) {
    const board = document.getElementById("strategy-board")
    board.innerHTML = ""
    const data = demoData[type]

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col ++) {
            const square = document.createElement("div")
            
            square.classList.add("mini-square", (row + col) % 2 === 0 ? "mini-light" : "mini-dark")

            data.highlights?.forEach(h => {
                if(h.row === row && h.col === col) {
                    square.classList.add(h.class)
                }
            })

            data.pieces.forEach(p => {
                if(p.row === row && p.col === col) {
                    square.innerHTML = `<img class="mini-strategy-piece" src="img/${p.piece}.png">`
                }
            })

            board.appendChild(square)
        }
    }

    document.getElementById("demo-title").textContent = data.title
    document.getElementById("demo-text").textContent = data.text
    document.querySelector(".lesson-tag").textContent = data.category
    document.getElementById("demo-explanation").innerHTML = data.explanation
        .map(item => `<li>${item}</li>`).join("")
}

function setDemo(index) {
    currentDemo = (index + demos.length) % demos.length
    const demo = demos[currentDemo]
    demoSelect.value = demo
    renderDemoBoard(demo)
}

prevDemoBtn.addEventListener("click", () => {
    setDemo(currentDemo - 1)
})

nextDemoBtn.addEventListener("click", () => {
    setDemo(currentDemo + 1)
})

demoSelect.addEventListener("change", () => {
    currentDemo = demos.indexOf(demoSelect.value)
    renderDemoBoard(demoSelect.value)
})

renderMiniBoard("pawn")
renderSpecialBoard("castle-before", specialData.castleBefore, specialData.castleHighlights)
renderSpecialBoard("castle-after", specialData.castleAfter, specialData.empty)
renderSpecialBoard("en-passant-before", specialData.enPassantBefore, specialData.enPassantHighlights)
renderSpecialBoard("en-passant-after", specialData.enPassantAfter, specialData.empty)
renderSpecialBoard("promotion-before", specialData.promotionBefore, specialData.promotionHighlights)
renderSpecialBoard("promotion-after", specialData.promotionAfter, specialData.empty)
setDemo(0)