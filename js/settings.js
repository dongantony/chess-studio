const Settings = {
    data: {
        boardFlipped: false,
        showCoordinates: true,
        showMoveHints: true,
        highlightChecks: true,
        highlightLastMove: true,
        darkMode: false,
        theme: "classic",
        volume: 1
    },

    load() {
        const saved = localStorage.getItem("chessSettings")
        if (saved) {
            this.data = { ...this.data, ...JSON.parse(saved) }
        }
    },

    save() {
        localStorage.setItem("chessSettings", JSON.stringify(this.data))
    },

    set(key, value) {
        this.data[key] = value
        this.save()
    },

    get(key) {
        return this.data[key]
    }
}

function applySettingsToPage() {
    const s = Settings.data

    document.documentElement.classList.remove("theme-classic", "theme-blue", "theme-brown", "theme-gray")
    document.documentElement.classList.add(`theme-${s.theme}`)

    document.documentElement.classList.toggle("dark-mode", s.darkMode)

    window.dispatchEvent(new CustomEvent("settingsChanged", {detail: s}))
}

document.addEventListener("DOMContentLoaded", () => {
    const settingsBtn = document.getElementById("settings-btn")
    if (settingsBtn) {
        settingsBtn.addEventListener("click", openSettingsModal)
    }

    const closeBtn = document.getElementById("close-settings")
    if (closeBtn) {
        closeBtn.addEventListener("click", closeSettingsModal)
    }

    const darkMode = document.getElementById("global-dark-mode")
    const theme = document.getElementById("global-theme")
    const volume = document.getElementById("global-volume")
    const modal = document.getElementById("global-settings-modal")

    if (darkMode) {
        darkMode.addEventListener("change", e => {
            Settings.set("darkMode", e.target.checked)
            applySettingsToPage()
        })
    }

    if (theme) {
        theme.addEventListener("change", e => {
            Settings.set("theme", e.target.value)
            applySettingsToPage()
        })
    }

    if (volume) {
        volume.addEventListener("input", e => {
            const v = parseFloat(e.target.value)
            Settings.set("volume", v)

            if (typeof audioVolume !== "undefined") {
                audioVolume = v
                updateVolumeUI(v)
            }
        })
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target.id === "global-settings-modal") {
                closeSettingsModal()
            }
        })
    }
})

function openSettingsModal() {
    const modal = document.getElementById("global-settings-modal")
    if (!modal) return

    const dark = document.getElementById("global-dark-mode")
    const theme = document.getElementById("global-theme")
    const volume = document.getElementById("global-volume")

    if (dark) dark.checked = Settings.get("darkMode")
    if (theme) theme.value = Settings.get("theme")
    if (volume) volume.value = Settings.get("volume")


    modal.classList.remove("hidden")
}

function closeSettingsModal() {
    document.getElementById("global-settings-modal").classList.add("hidden")
}

let volumeSlider;
let volumeText;
let globalVolume;

document.addEventListener("DOMContentLoaded", () => {
    volumeSlider = document.getElementById("volume-slider")
    volumeText = document.getElementById("volume-value")
    globalVolume = document.getElementById("global-volume")

    volumeSlider?.addEventListener("input", e => {
        audioVolume = parseFloat(e.target.value)
        Settings.set("volume", audioVolume)
        updateVolumeUI(audioVolume)
    })

    globalVolume?.addEventListener("input", e => {
        audioVolume = parseFloat(e.target.value)
        Settings.set("volume", audioVolume)
        updateVolumeUI(audioVolume)
    })

    updateVolumeUI(Settings.get("volume"))
})

function updateVolumeUI(value) {
    const percent = Math.round(value * 100)

    if (volumeSlider) {
        volumeSlider.value = value
        volumeSlider.style.setProperty("--volume", percent)
    }

    if (globalVolume) {
        globalVolume.value = value
        globalVolume.style.setProperty("--volume", percent)
    }

    if (volumeText) {
        volumeText.textContent = percent + "%"
    }
}