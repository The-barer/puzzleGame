let touched = false
let waited = false
let $waitedElement

function addMobileDrag() {
    board.addEventListener('touchstart', touchStart)
    board.addEventListener('touchend', touchEnd)
}

function removeMobileDrag() {
    board.removeEventListener('touchstart', touchStart)
    board.removeEventListener('touchend', touchEnd)
}

function touchEnd(event) {
    touched = false
    //Сбрасываем состояние и не доходим до долгого касания.
}
function touchStart(event) {
    event.preventDefault()
    touched = true
    if (waited) {
        //Если уже активирован объект, то обрабатываем касание на новый и делаем перемещение
        console.log($waitedElement, event.target);
        direction($waitedElement, event.target)
        clearTouch()
        return
    }
    //Если нет активированного объекта, то долгое касание приведет к активации и ожиданию следующего касания на 5 сек.
    setTimeout(()=>{
        if(touched) {
            waited = true
            $waitedElement = event.target
            $waitedElement.classList.add('draggable')
            setTimeout(()=>{
                //через 5 сек активация снимится.
                clearTouch()
            }, 5000)
        }
    }, 800)
}
function clearTouch() {
    waited = false
    $waitedElement.classList.remove('draggable')
}