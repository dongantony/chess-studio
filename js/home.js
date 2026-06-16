// Animated Quote Typing
const quotes = [
    "Every chess master was once a beginner.",
    "Move in silence, only speak when it's time to say checkmate.",
    "The game ends when the King falls, not when a pawn takes your queen.",
    "A well placed pawn is more powerful than a King.",
    "The board may be small, but the lessons are vast.",
    "Help your pieces, so they can help you.",
    "Bong Cloud!",
    "I hate Sicilian players.",
    "Sometimes, you have to put everything on the line to achieve greatness.",
    "When you see a good move, look for a better one.",
    "In chess, the king is the most important piece, but even he needs protection. In life, never forget that strength comes from those who stand beside you.",
    "If you know the enemy and know yourself, you need not fear the result of a hundred battles.",
]

const quoteEl = document.getElementById("quote-text")

let quoteIndex = 0
let charIndex = 0
let typing = true

function typeQuote() {
    const current = quotes[quoteIndex]

    if(typing) {
        charIndex ++

        quoteEl.textContent = `"${current.slice(0, charIndex)}"`

        if(charIndex == current.length) {
            typing = false
            setTimeout(typeQuote, 9000)
            return;
        }
    }
    else {
        charIndex--

        quoteEl.textContent = `"${current.slice(0, charIndex)}`

        if(charIndex == 0) {
            typing = true
            quoteIndex = (quoteIndex + 1) % quotes.length
        }
    }

    setTimeout(typeQuote, typing ? 50 : 25)
}

typeQuote();

// UI Modals
const playButton = document.getElementById("play-game-btn")
const modal = document.getElementById("game-mode-modal")

const twoPlayerBtn = document.getElementById("two-player-btn")
const computerBtn = document.getElementById("computer-btn")
const closeBtn = document.getElementById("close-game-mode")

playButton.addEventListener("click", () => {
    modal.classList.remove("hidden")
})

closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden")
})

twoPlayerBtn.addEventListener("click", () => {
    localStorage.setItem("gameMode", "human")
    window.location.href = "chess.html"
})

const gameModeScreen = document.getElementById("game-mode-screen")
const difficultyScreen = document.getElementById("difficulty-screen")
const backBtn = document.getElementById("back-btn")
const easyBtn = document.getElementById("easy-btn")

playButton.addEventListener("click", () => {
    modal.classList.remove("hidden")
    gameModeScreen.classList.remove("hidden")
    difficultyScreen.classList.add("hidden")
})

computerBtn.addEventListener("click", () => {
    gameModeScreen.classList.add("hidden")
    difficultyScreen.classList.remove("hidden")
})

backBtn.addEventListener("click", () => {
    gameModeScreen.classList.remove("hidden")
    difficultyScreen.classList.add("hidden")
})

easyBtn.addEventListener("click", () => {
    localStorage.setItem("gameMode", "computer")
    localStorage.setItem("difficulty", "easy")

    window.location.href = "chess.html"
})
