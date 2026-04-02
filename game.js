const gameBoard = document.getElementById('game-board');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

let score = 0;
let time = 0;
let timerInterval;
let isPlaying = false;
let currentItem = null;

// 플레이어 이동 (마우스나 터치로 조작)
function movePlayer(e) {
    if (!isPlaying) return;
    let x = e.clientX || (e.touches && e.touches[0].clientX);
    if (!x) return;
    
    let boardRect = gameBoard.getBoundingClientRect();
    let newLeft = x - boardRect.left - 20; // 20은 바구니의 절반 크기
    
    // 바구니가 화면 밖으로 나가지 않도록 고정
    if (newLeft < 0) newLeft = 0;
    if (newLeft > gameBoard.clientWidth - 40) newLeft = gameBoard.clientWidth - 40;
    
    player.style.left = newLeft + 'px';
}

gameBoard.addEventListener('mousemove', movePlayer);
gameBoard.addEventListener('touchmove', (e) => { 
    movePlayer(e); 
    e.preventDefault(); 
}, {passive: false});

function spawnItem() {
    if (currentItem) {
        currentItem.remove();
    }

    const item = document.createElement('div');
    item.classList.add('item');
    item.innerText = '🥐'; // 소라빵(크루아상) 이모티콘
    
    // 가로 위치 랜덤 설정
    const maxLeft = gameBoard.clientWidth - 40;
    const randomLeft = Math.floor(Math.random() * maxLeft);
    item.style.left = randomLeft + 'px';
    
    gameBoard.appendChild(item);
    currentItem = item;

    // 낙하 속도: 1.5초 ~ 2.0초 사이 랜덤
    const fallDuration = (Math.random() * 0.5 + 1.5); 
    let startTime = performance.now();

    function fall(currentTime) {
        if (!isPlaying) return;

        const elapsedTime = (currentTime - startTime) / 1000;
        const progress = elapsedTime / fallDuration;
        const currentY = progress * gameBoard.clientHeight;

        item.style.top = currentY + 'px';

        // 충돌 감지 로직
        const playerRect = player.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        // 아이템이 바닥 근처에 왔을 때
        if (currentY > gameBoard.clientHeight - 60) {
            // 바구니와 소라빵이 겹쳤는지 확인
            if (itemRect.right > playerRect.left && itemRect.left < playerRect.right) {
                // 성공적으로 잡았을 때
                score++;
                scoreDisplay.innerText = score;
                item.remove();
                currentItem = null;
                spawnItem(); // 다음 소라빵 떨어뜨리기
                return;
            } else if (currentY > gameBoard.clientHeight) {
                // 놓쳤을 때 (게임 종료)
                gameOver();
                return;
            }
        }

        if (isPlaying) {
            requestAnimationFrame(fall);
        }
    }
    requestAnimationFrame(fall);
}

function startGame() {
    score = 0;
    time = 0;
    scoreDisplay.innerText = score;
    timeDisplay.innerText = time.toFixed(1);
    startScreen.style.display = 'none';
    isPlaying = true;

    // 시간 타이머 작동
    timerInterval = setInterval(() => {
        time += 0.1;
        timeDisplay.innerText = time.toFixed(1);
    }, 100);

    spawnItem();
}

function gameOver() {
    isPlaying = false;
    clearInterval(timerInterval);
    if (currentItem) currentItem.remove();
    
    startScreen.innerHTML = `
        <h2>게임 오버!</h2>
        <p>최종 점수: ${score}점<br>버틴 시간: ${time.toFixed(1)}초</p>
        <button id="restart-btn">다시 하기</button>
    `;
    startScreen.style.display = 'flex';
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        startScreen.innerHTML = `
            <h2>두쫀쿠(🥐)를 받아주세요!</h2>
            <p>하나라도 놓치면 실패!</p>
            <button id="start-btn">게임 시작</button>
        `;
        document.getElementById('start-btn').addEventListener('click', startGame);
        startScreen.style.display = 'flex';
    });
}

startBtn.addEventListener('click', startGame);