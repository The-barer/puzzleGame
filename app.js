const board = document.querySelector('#playground') 
const controls = document.querySelector('.controls')

let moves = 0, time = 55, endTime = '', size = 3, timer

showStartPage()

board.addEventListener('click', clickToMove)
function clickToMove(event) {
    const elem = event.target;
    (elem.classList.value === 'col') && direction(elem);
    (elem.dataset.type === 'start') && startGame(size);
    (elem.dataset.type === 'again') && showStartPage();
    (elem.dataset.type === 'easier') && setSize(-1); 
    (elem.dataset.type === 'harder') && setSize(+1);
}

function setSize(num=0) {
    const level = document.querySelector('[data-level]')
    if(level === null){return}
    let max = Math.floor(board.getBoundingClientRect().width/50) 
    if(size+num < 2) {
        size = 2
        return
    } else if(size+num > max) {
        size = max
        return
    }
    size = size + num
    level.innerHTML = `${size}x${size}`
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
        document.querySelector('.timeEl').innerHTML=`Время: ${zero(minutes)}:${zero(seconds)}`
        endTime = `${minutes} мин ${seconds} cек`
        if(time === 3600) {
            clearInterval(timer)
        }
    }, 1000)
} 

function clearBoard() {
    controls.classList = 'controls'
    board.innerHTML = ''
    board.classList = 'board'
    time = 0
    moves = 0
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
        board.appendChild($row)
        for (let col = 0; col < number; col++) {
            const index = (row * number) + (col)
            const $col = document.createElement('div')
            $col.classList.add('col')
            $col.posX = col
            $col.posY = row
            if(randomlist[index] === 'freespace') {
                $col.classList.add('FS')
            } else {
                $col.dataset.id =""
                $col.innerHTML = randomlist[index]
            }
            $row.appendChild($col)
        }
    }
    board.classList.add('start') 
}

function startGame(num) {
    clearBoard()
    startTime()
    generateBoard(num)
    controls.classList.add('start')
}

function move($elem, newX, newY) {
    const y = $elem.posY+newY
    const x = $elem.posX+newX 
    const fieldSize = board.childNodes.length-1
    const onPlace = board.childNodes[y].childNodes[x];
    if(((x < 0) || (x > fieldSize)) || ((y < 0) || (y > fieldSize))) {
        return console.log('Край')
    }
    const sizeY = $elem.getBoundingClientRect().height
    const sizeX = $elem.getBoundingClientRect().height
    $elem.style.transform = `translate(${newX*sizeX}px, ${newY*sizeY}px)`;
    
    setTimeout(() => {
        $elem.style = ''
        board.childNodes[y].insertBefore($elem, onPlace);
        board.childNodes[$elem.posY].insertBefore(onPlace, board.childNodes[$elem.posY].childNodes[$elem.posX]);
        [$elem.posY, $elem.posX] = [y, x];
        [onPlace.posY, onPlace.posX] = [onPlace.posY-newY, onPlace.posX-newX];
        document.querySelector('.movesEl').innerHTML = `Ходов: ${++moves}`
        validateWin(onPlace.posX, onPlace.posY, fieldSize)
    }, 200);
}

function direction($elem) {
    const FS = board.querySelector('.FS')
    const x = FS.posX - $elem.posX
    const y = FS.posY - $elem.posY
    if (((x === 0 && Math.abs(y) < 2) || (y === 0 && Math.abs(x) < 2))) {
        move($elem, x, y)
    }
}

function validateWin(x, y, size) {
    if ((x === 0 && y === 0) || (x === size && y === size)) {
        const combination = board.querySelectorAll('[data-id]')
        for (let i = 0; i < combination.length; i++) {   
            if (parseInt(combination[i].innerHTML) !== i+1) {
                return
            }
        }
        stopGame()
    }
}

function stopGame() {
        board.classList.add('win')
        clearInterval(timer)
        setTimeout(() => {
            controls.classList.add('end')
            setTimeout(() => {showResultPage(moves)}, 500);
        }, 500)
}

function showResultPage(move) {
    clearBoard()
    board.innerHTML=`
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
function showStartPage() {
    board.innerHTML = `
    <button class="start-btn" data-type='start'>Start game</button>
    <div class="difficulty">
        <i class="fa-sharp fa-solid fa-angle-left" data-type="easier"></i>
        <strong data-level>4x4</strong>
        <i class="fa-sharp fa-solid fa-angle-right" data-type="harder"></i>
    </div>`;
    setSize();
}