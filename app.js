const playground = document.querySelector('#playground')
const board = document.querySelector('.board') 
const backboard = document.querySelector('.backboard')
const controls = document.querySelector('.controls')
let moves = 0, time = 0, endTime = '', size = 1, timer, FS
showStartPage(true)

document.addEventListener('keydown', keyActions)
controls.addEventListener('click', gameControl)
board.addEventListener('click', clickToMove)

function gameControl(event) {
    switch (event.target.dataset.type) {
        case 'stopgame':
            showStartPage()
            break;
        case 'dragg':
            event.target.classList.toggle('dragEnabled')
            controls.querySelector('.prompt').classList.toggle('hide')
            if(event.target.classList.contains('dragEnabled')) {
                board.removeEventListener('click', clickToMove)
                board.addEventListener('dblclick', dragAndDrop)
                addMobileDrag()

            } else {
                board.addEventListener('click', clickToMove)
                board.removeEventListener('dblclick',dragAndDrop)
                removeMobileDrag()
            }
            break;
        case 'refresh':
            startGame(size)
            break;    
    }

}

function clickToMove(event) {
    const elem = event.target;
    (elem.dataset.type === 'piece') && direction(elem, FS);
    (elem.dataset.type === 'start') && startGame(size);
    (elem.dataset.type === 'again') && showStartPage();
    (elem.dataset.type === 'easier') && setSize(-1); 
    (elem.dataset.type === 'harder') && setSize(+1);
}

function setSize(num = 0) {
    const level = document.querySelector('[data-level]')
    const newSize = Math.abs(num) > 1 ? num : size+num ;
    let max = Math.floor(board.getBoundingClientRect().width/70) 
    console.log(max);
    size = newSize
    if(newSize < 3) {
        size = 3
    } else if(newSize > max) {
        size = max
    }
    if(level !== null){level.innerHTML = `${size}x${size}`}
}

function startTime() {
    timer = setInterval(() => {
        time++
        let minutes = Math.floor(time/60)
        let seconds = time-minutes*60
        function zero(num) {
            if(num < 10) num = `0${num}`
            return num
        }
        document.querySelector('.timecount').innerHTML=`${zero(minutes)}:${zero(seconds)}`
        endTime = `${minutes} мин ${seconds} cек`
        if(time === 3600) {
            clearInterval(timer)
        }
    }, 1000)
} 

function clearBoard() {
    clearInterval(timer)
    controls.classList = 'controls'
    playground.innerHTML = ''
    backboard.innerHTML = ''
    playground.classList = 'playground'
    backboard.classList = 'backboard'
    document.querySelector('.timecount').innerHTML='00:00'
    document.querySelector('.movescount').innerHTML='0'
    time = 0
    moves = 0
    document.location.hash = ''
}

function generateBoard(number) {
    clearBoard()
    const randomlist = ['freespace']
    for (let i = 1; i < number**2; i++) {
        randomlist.push(i)
        const j = Math.floor(Math.random()*(i+1))
        const tmp = randomlist[i]
        randomlist[i] = randomlist[j]
        randomlist[j] = tmp
    }
    for (let row = 0; row < number; row++) {
        const $row = document.createElement('div')
        $row.classList.add('row')
        const $backRow = document.createElement('div')
        $backRow.classList.add('row')
        playground.appendChild($row)
        backboard.appendChild($backRow)
        for (let col = 0; col < number; col++) {
            const index = (row * number) + (col)
            const $col = document.createElement('div')
            const $backCol = document.createElement('div')
            $backCol.classList.add('backcol')
            $backCol.innerHTML = index+1 !== number**2 ? index+1 : "";
            $backRow.appendChild($backCol)
            $col.classList.add('col')
            $col.posX = col
            $col.posY = row
            if(randomlist[index] === 'freespace') {
                $col.classList.add('FS')
                $col.dataset.startrow = row+1
            } else {
                $col.dataset.type = 'piece'
                $col.innerHTML = randomlist[index]
            }
            $row.appendChild($col)
        }
    }
    setTimeout(() => {
        playground.classList.add('start')
    }, 1000); 
    FS = playground.querySelector('.FS') 
}

function startGame(num) {
    
    generateBoard(num)
    startTime()
    if (num > 2) {validateGame()};
    controls.classList.add('start')
    board.dataset.type = 'playPage'
    document.location.hash = size
}
function move($elem, newX, newY, drag = false) {
    const y = $elem.posY+newY
    const x = $elem.posX+newX 
    const onPlace = playground.childNodes[y].childNodes[x];
    if(((x < 0) || (x > size-1)) || ((y < 0) || (y > size-1))) {
        return
    }
    switch (drag) {
        case true:
            replace()
            break;
        default:
            const sizeY = $elem.getBoundingClientRect().height
            const sizeX = $elem.getBoundingClientRect().height
            $elem.style.transform = `translate(${newX*sizeX}px, ${newY*sizeY}px)`;
            setTimeout(replace, 200);
            break;
    }
    function replace() {
        $elem.style = ''
        onPlace.style = ''
        playground.childNodes[y].insertBefore($elem, onPlace);
        playground.childNodes[$elem.posY].insertBefore(onPlace, playground.childNodes[$elem.posY].childNodes[$elem.posX]);
        [$elem.posY, $elem.posX] = [y, x];
        [onPlace.posY, onPlace.posX] = [onPlace.posY-newY, onPlace.posX-newX];
        document.querySelector('.movescount').innerHTML = ++moves
        validateWin()
    }  
}

function direction($elem, $FS) {
    const x = $FS.posX - $elem.posX
    const y = $FS.posY - $elem.posY
    if (((x === 0 && Math.abs(y) < 2) || (y === 0 && Math.abs(x) < 2))) {
        return move($elem, x, y)
    }
    if ($elem.classList.contains('draggable')) {
        move($elem, x, y)
    }
}

function validateWin() {
    const combination = playground.querySelectorAll('[data-type="piece"]')
    if ((FS.posX === 0 && FS.posY === 0) || (FS.posX === size-1 && FS.posY === size-1)) {
        for (let i = 0; i < combination.length; i++) {
            if (parseInt(combination[i].innerHTML) !== i+1) {
                if (i+2 === combination.length) {
                    return move(combination[i], 1, 0) 
                }
                return
            }
        }
        stopGame()
    }
}
function validateGame() {
    const combination = playground.querySelectorAll('[data-type="piece"]')
    let validateSum = parseInt(FS.dataset.startrow)%2 === 0 ? parseInt(FS.dataset.startrow) : 0
    const validatedSet = new Set
    let last, prevLast, tmp 
    for (let i = 0; i < combination.length; i++) {   
       let current = parseInt(combination[i].innerHTML)
       if( current === combination.length)  {
            last = combination[i]
        };
       if( current === combination.length-1)  {
            prevLast = combination[i]
        };
       for (let j=1; j<current; j++) {
            !validatedSet.has(j) && validateSum++
       }
       validatedSet.add(current)
    }
    if (validateSum%2 !== 0) {
        tmp = last.innerHTML
        last.innerHTML = prevLast.innerHTML
        prevLast.innerHTML = tmp
    } 
}

function stopGame() {
        playground.classList.add('win')
        backboard.classList.add('win')
        setTimeout(() => {
            controls.classList.add('end')
            setTimeout(() => {showResultPage(moves)}, 500);
        }, 500)
}

function showResultPage(move) {
    board.dataset.type = 'resultPage'
    clearBoard()
    backboard.innerHTML=`
    <div class="result">
        <div class="result-text">
            <p>Время</p>
            <strong><p>${endTime}</p></strong>
        </div>
        <div class="result-text">
            <p>Перемещений</p>
            <strong><p>${move}</p></strong>
        </div>
        <button class="start-btn" data-type="again">Еще раз</button>
    </div>`
}
function showStartPage(isInital) {
    board.dataset.type = 'startPage'
    if (isInital) {
        const sizeInHash = parseInt(document.location.hash.substring(1))
        if(isFinite(sizeInHash)) {
            setSize(sizeInHash)
            return startGame(size)
        }       
    }
    clearBoard()
    backboard.innerHTML = `
    <button class="start-btn" data-type='start'>Start game</button>
    <div class="difficulty">
        <i class="fa-sharp fa-solid fa-angle-left" data-type="easier"></i>
        <strong data-level></strong>
        <i class="fa-sharp fa-solid fa-angle-right" data-type="harder"></i>
    </div>`;
    setSize();
}

function dragAndDrop(event) {

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
        clearDrag()
        event.target.classList.remove('hovered')
        const x = event.target.posX - $dragelem.posX
        const y = event.target.posY - $dragelem.posY
        move($dragelem, x, y, true)   
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
    }
}

function keyActions(event) {
    event.preventDefault()
    switch (board.dataset.type) {
        case 'startPage':
            event.key === 'Enter' && startGame(size)
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
                try{direction(playground.childNodes[y+1].childNodes[x], FS)}
                catch {return}   
                break;
            case 'ArrowDown':
                try{direction(playground.childNodes[y-1].childNodes[x], FS)}
                catch {return} 
                break;
            case 'ArrowLeft':
                try{direction(playground.childNodes[y].childNodes[x+1], FS)}
                catch {return} 
                break;
            case 'ArrowRight':
                try{direction(playground.childNodes[y].childNodes[x-1], FS)}
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

