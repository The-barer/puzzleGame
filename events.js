showStartPage(true)
document.addEventListener('keydown', keyActions)
controls.addEventListener('click', gameControlsBtn)

let touched = false, waited = false, $waitedElement;

function baseEvents() {
    board.addEventListener('click', clickToMove)
    removeMobileDrag()
    board.removeEventListener('click',dragAndDrop)
}

function gameControlsBtn(event) {
    switch (event.target.dataset.type) {
        case 'stopgame':
            showStartPage()
            break;
        case 'dragg':
            event.target.classList.toggle('dragEnabled')
            dragPrompt.classList.toggle('hide')
            if(event.target.classList.contains('dragEnabled')) {
                board.removeEventListener('click', clickToMove)
                board.addEventListener('click', dragAndDrop)
                addMobileDrag()
            } else {
                baseEvents()
            }
            break;
        case 'refresh':
            startGame(size)
            break;    
    }   
}

function clickToMove(event) {
    const elem = event.target;
    (elem.dataset.type === 'piece') && move(elem, FS);
    (elem.dataset.type === 'start') && startGame(size);
    (elem.dataset.type === 'again') && showStartPage();
    (elem.dataset.type === 'easier') && setSize(-1); 
    (elem.dataset.type === 'harder') && setSize(+1);
}

function promptText(event) {
    if(event.type === 'touchstart') {
        dragPrompt.innerHTML = 'Каснитесь и подержите на объекте, переставьте'
    } else {
        dragPrompt.innerHTML = 'Нажимить на объект, затем перетащите'
    }
}

function dragAndDrop(event) {
    promptText(event)
    $dragelem = event.target
    let started = false
    if($dragelem.dataset.type !== 'piece') {
        return
    }
    $dragelem.classList.add('draggable')
    $dragelem.setAttribute('draggable', true)
    playground.addEventListener('dragover', dragOver)
    playground.addEventListener('dragstart', dragStart)
    playground.addEventListener('drop', dragDrop)
    playground.addEventListener('dragenter', dragEnter)
    playground.addEventListener('dragleave', dragLeave)
    playground.addEventListener('dragend', clearDrag)

    function dragStart(event) {
        started = true
        $dragelem = event.target
        $dragelem.classList.add('hold')
        setTimeout(() => {$dragelem.classList.add('hide')}, 0);
    }
    function dragOver(event) {
        event.preventDefault()
    }
    function dragEnter(event) {
        event.target.classList.add('hovered')
    }
    function dragLeave(event) {
        event.target.classList.remove('hovered')
    }
    function dragDrop(event) {
        event.target.classList.remove('hovered')
        move($dragelem, event.target)  
        clearDrag() 
    }
    setTimeout(() => {
        !started && clearDrag()
    }, 5000)
    function clearDrag() {
        $dragelem.classList.remove('hide')
        $dragelem.classList.remove('hold')
        $dragelem.classList.remove('draggable')
        $dragelem.removeAttribute('draggable', true)
        playground.removeEventListener('dragover', dragOver)
        playground.removeEventListener('dragstart', dragStart)
        playground.removeEventListener('drop', dragDrop)
        playground.removeEventListener('dragenter', dragEnter)
        playground.removeEventListener('dragleave', dragLeave)
        playground.removeEventListener('dragend', clearDrag)
    }
}

function keyActions(event) {
    event.preventDefault()
    switch (board.dataset.type) {
        case 'startPage':
            if(event.key === 'Enter') {
                startGame(size)
            }
            event.key === 'ArrowLeft' && setSize(-1)
            event.key === 'ArrowRight' && setSize(+1)
            break;
        case 'playPage':
            playgroundKeys(event)
            break;
        case 'resultPage':
            event.key === 'Enter' && showStartPage(size)
            break;
        default:
            break;
    }
    
    function playgroundKeys(event) {
        const x = FS.posX
        const y = FS.posY
        switch (event.key) {
            case 'ArrowUp':
                try{move(playground.childNodes[y+1].childNodes[x], FS)}
                catch {return}   
                break;
            case 'ArrowDown':
                try{move(playground.childNodes[y-1].childNodes[x], FS)}
                catch {return} 
                break;
            case 'ArrowLeft':
                try{move(playground.childNodes[y].childNodes[x+1], FS)}
                catch {return} 
                break;
            case 'ArrowRight':
                try{move(playground.childNodes[y].childNodes[x-1], FS)}
                catch {return} 
                break;
            case 'Enter':
                startGame(size)
                break;
            case 'Escape':
                showStartPage()
                break;
        }
    }
}

function addMobileDrag() {
    board.addEventListener('touchstart', touchStart)
    board.addEventListener('touchend', touchEnd)
}

function removeMobileDrag() {
    board.removeEventListener('touchstart', touchStart)
    board.removeEventListener('touchend', touchEnd)
}

function touchEnd() {
    touched = false
}

function touchStart(event) {
    promptText(event)
    event.preventDefault()
    touched = true
    if (waited) {
        move($waitedElement, event.target)
        clearTouch()
        return
    }
    setTimeout(()=>{
        if(touched) {
            waited = true
            $waitedElement = event.target
            $waitedElement.classList.add('draggable')
            setTimeout(()=>{
                clearTouch()
            }, 5000)
        }
    }, 500)
    function clearTouch() {
        waited = false
        $waitedElement.classList.remove('draggable')
    }
}
