const dragPrompt = document.querySelector('.prompt')
const playground = document.querySelector('#playground')
const board = document.querySelector('.board') 
const backboard = document.querySelector('.backboard')
const controls = document.querySelector('.controls')

let moves = 0, time = 0, endTime = '', size = 1, timer, FS, isMoveing = false

function setSize(num = 0) {
    const level = document.querySelector('[data-level]')
    const newSize = Math.abs(num) > 1 ? num : size+num ;
    let max = Math.floor(board.getBoundingClientRect().width/70) 
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
    document.querySelector('[data-type="dragg"]').classList.remove('dragEnabled')
    playground.innerHTML = ''
    backboard.innerHTML = ''
    playground.classList = 'playground'
    backboard.classList = 'backboard'
    dragPrompt.classList.add('hide')
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
    baseEvents()
}

function move($elem, $newPlace) {
    if(typeof $elem === 'undefined'){
        return
    }
    if (isMoveing) {
        return 
    }
    isMoveing = true
    const newX = $newPlace.posX
    const newY = $newPlace.posY 
    const oldX = $elem.posX
    const oldY = $elem.posY
    if ($elem.classList.contains('draggable')) {
        return replace()
    } else {
        const sizeY = $elem.getBoundingClientRect().height
        const sizeX = $elem.getBoundingClientRect().height
        $elem.style.transform = `translate(${(newX-oldX)*sizeX}px, ${(newY-oldY)*sizeY}px)`;
        setTimeout(replace, 200);
    }
    function replace() {
        $elem.style = ''
        playground.childNodes[newY].insertBefore($elem, $newPlace);
        if(oldX === size-1){
            playground.childNodes[oldY].appendChild($newPlace);
        } else if(newY === oldY && newX < oldX ){
            playground.childNodes[oldY].insertBefore($newPlace, playground.childNodes[oldY].childNodes[oldX].nextSibling);
        } else {
            playground.childNodes[oldY].insertBefore($newPlace, playground.childNodes[oldY].childNodes[oldX]);
        }
        [$elem.posX, $elem.posY] = [newX, newY];
        [$newPlace.posX, $newPlace.posY] = [oldX, oldY];
        document.querySelector('.movescount').innerHTML = ++moves
        isMoveing = false
        validateWin()
    }  
}

function validateWin() {
    const combination = playground.querySelectorAll('[data-type="piece"]')
    if ((FS.posX === size-1 && FS.posY === size-1)) {
        for (let i = 0; i < combination.length; i++) {
            if (parseInt(combination[i].innerHTML) !== i+1) {
                if (i+2 === combination.length) {
                    return move(combination[i], combination[i+1]) 
                }
                return
            }
        }
        stopGame()
    }
}

function validateGame() {
    const combination = playground.querySelectorAll('[data-type="piece"]')
    let validateSum = size%2 === 0 ? parseInt(FS.dataset.startrow) : 0;
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
    baseEvents()
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
    baseEvents()
    backboard.innerHTML = `
    <button class="start-btn" data-type='start'>Start game</button>
    <div class="difficulty">
        <i class="fa-sharp fa-solid fa-angle-left" data-type="easier"></i>
        <strong data-level></strong>
        <i class="fa-sharp fa-solid fa-angle-right" data-type="harder"></i>
    </div>`;
    setSize();
}