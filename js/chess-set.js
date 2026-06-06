const pieces = {
    // black pieces
    bp: "img/black-pawn.png",
    bn: "img/black-knight.png",
    bb: "img/black-bishop.png",
    br: "img/black-rook.png",
    bq: "img/black-queen.png",
    bk: "img/black-king.png",

    // white pieces
    wp: "img/white-pawn.png",
    wn: "img/white-knight.png",
    wb: "img/white-bishop.png",
    wr: "img/white-rook.png",
    wq: "img/white-queen.png",
    wk: "img/white-king.png"
}

const sounds = {
    move: new Audio("audio/move.mp3"),
    capture: new Audio("audio/capture.mp3"),
    castle: new Audio("audio/castle.mp3"),
    check: new Audio("audio/check.mp3"),
    promote: new Audio("audio/promote.mp3"),
    gameover: new Audio("audio/gameover.mp3")
}

const gameboard = [
    ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
    ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
    ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"]
]