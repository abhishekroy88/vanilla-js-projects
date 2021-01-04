const keys = document.querySelectorAll('.key')

window.addEventListener('keydown', playPressedKeySound)

keys.forEach(key => {
    key.addEventListener('mousedown', playClickedKeySound)
    
    key.addEventListener('transitionend', (e) => {
        removeSpecialStyling(e.target)
    })
})


function playPressedKeySound (e) {
    const divElem = document.querySelector(`div[data-key="${e.key.toUpperCase()}"]`)

    if (divElem) {
        const audioElem = divElem.querySelector('audio')
        playAudio(audioElem)
        addSpecialStyling(divElem)
    }
}


function playClickedKeySound (e) {
    const audioElem = e.target.querySelector('audio')
    playAudio(audioElem)
    addSpecialStyling(e.target)
}


function addSpecialStyling (elem) {
    elem.classList.add('playing')
}


function removeSpecialStyling (elem) {
    elem.classList.remove('playing')
}


function playAudio (audioElem) {
    audioElem.currentTime = 0
    audioElem.play()
}
