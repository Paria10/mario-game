const scene = document.querySelector('.game-scene');
const hero = document.querySelector('#hero');
const ground = document.querySelector('.ground');
const platforms = [...document.querySelectorAll('.platform')];
const coins = [...document.querySelectorAll('.coin')];
const score = document.querySelector('#score');
const flag = document.querySelector('#flag');
const winMessage = document.querySelector('#win-message');
const playAgain = document.querySelector('#play-again');
const finalScore = document.querySelector('#final-score');
const finalScoreValue = document.querySelector('#final-score-value');
const moveSpeed = 420;
const jumpSpeed = 760;
const gravity = 1800;
const pressedKeys = new Set();
let heroY = 0;
let verticalSpeed = 0;
let isGrounded = true;
let collectedCoins = 0;
let hasWon = false;
let lastTime = performance.now();

function moveHero(direction, elapsedSeconds) {
  const sceneWidth = scene.clientWidth;
  const heroWidth = hero.offsetWidth;
  const currentLeft = hero.offsetLeft;
  const nextLeft = currentLeft + direction * moveSpeed * elapsedSeconds;
  const clampedLeft = Math.max(0, Math.min(sceneWidth - heroWidth, nextLeft));

  hero.style.left = `${clampedLeft}px`;
}

function overlapsHorizontally(left, width, platform) {
  return left < platform.offsetLeft + platform.offsetWidth &&
    left + width > platform.offsetLeft;
}

function collectCoins() {
  const heroBounds = hero.getBoundingClientRect();

  for (const coin of coins) {
    if (coin.hidden) continue;
    const coinBounds = coin.getBoundingClientRect();
    const touching = heroBounds.left < coinBounds.right &&
      heroBounds.right > coinBounds.left &&
      heroBounds.top < coinBounds.bottom &&
      heroBounds.bottom > coinBounds.top;

    if (touching) {
      coin.hidden = true;
      collectedCoins += 1;
      score.textContent = collectedCoins;
    }
  }
}

function checkWin() {
  if (hasWon) return;
  const heroBounds = hero.getBoundingClientRect();
  const flagBounds = flag.getBoundingClientRect();
  const isRightOfFlag = heroBounds.right > flagBounds.left;
  if (isRightOfFlag && heroBounds.bottom > flagBounds.top &&
      heroBounds.top < flagBounds.bottom) {
    hasWon = true;
    winMessage.hidden = false;
    playAgain.hidden = false;
    finalScoreValue.textContent = collectedCoins;
    finalScore.hidden = false;
  }
}

playAgain.addEventListener('click', () => {
  window.location.reload();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    pressedKeys.add(event.key);
  }

  if (event.code === 'Space') {
    event.preventDefault();
    if (!event.repeat && isGrounded) {
      verticalSpeed = jumpSpeed;
      isGrounded = false;
    }
  }
});

document.addEventListener('keyup', (event) => {
  pressedKeys.delete(event.key);
});

function update(time) {
  const elapsedSeconds = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  const movingLeft = pressedKeys.has('ArrowLeft');
  const movingRight = pressedKeys.has('ArrowRight');
  if (movingLeft !== movingRight) {
    moveHero(movingLeft ? -1 : 1, elapsedSeconds);
  }

  const groundTop = ground.offsetTop;
  const baseBottom = scene.clientHeight - groundTop;
  const heroLeft = hero.offsetLeft;
  const heroWidth = hero.offsetWidth;
  const currentBottom = baseBottom + heroY;
  const nextBottom = currentBottom + verticalSpeed * elapsedSeconds;
  let landed = false;

  if (verticalSpeed <= 0) {
    for (const platform of platforms) {
      const platformTop = scene.clientHeight - platform.offsetTop;
      if (currentBottom >= platformTop && nextBottom <= platformTop &&
          overlapsHorizontally(heroLeft, heroWidth, platform)) {
        heroY = platformTop - baseBottom;
        verticalSpeed = 0;
        isGrounded = true;
        landed = true;
        break;
      }
    }
  }

  if (!landed) {
    isGrounded = false;
    verticalSpeed -= gravity * elapsedSeconds;
    heroY += verticalSpeed * elapsedSeconds;
    if (heroY <= 0) {
      heroY = 0;
      verticalSpeed = 0;
      isGrounded = true;
    }
  }

  hero.style.bottom = `${baseBottom + heroY}px`;
  collectCoins();
  checkWin();

  requestAnimationFrame(update);
}

requestAnimationFrame(update);
