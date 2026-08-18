const scene = document.querySelector('.game-scene');
const hero = document.querySelector('#hero');
const ground = document.querySelector('.ground');
const platforms = [...document.querySelectorAll('.platform')];
const coins = [...document.querySelectorAll('.coin')];
const score = document.querySelector('#score');
const flag = document.querySelector('#flag');
const winMessage = document.querySelector('#win-message');
const playAgain = document.querySelector('#play-again');
const nextLevel = document.querySelector('#next-level');
const finalScore = document.querySelector('#final-score');
const finalScoreValue = document.querySelector('#final-score-value');
const laser = document.querySelector('#laser');
const exitDoor = document.querySelector('#exit-door');
const levelMenuButton = document.querySelector('#level-menu-button');
const levelMenu = document.querySelector('#level-menu');
const levelTwoOption = document.querySelector('#level-two-option');
const hearts = [...document.querySelectorAll('.heart')];
const moveSpeed = 420;
const jumpSpeed = 760;
const gravity = 1800;
const pressedKeys = new Set();
let heroY = 0;
let verticalSpeed = 0;
let isGrounded = true;
let collectedCoins = 0;
let hasWon = false;
let levelTwo = false;
let damagedHalves = 0;
let fallingFromPlatform = false;
let lastTime = performance.now();

function updateLevelLocks() {
  const unlocked = localStorage.getItem('level2Unlocked') === 'true';
  levelTwoOption.disabled = !unlocked;
  levelTwoOption.querySelector('.level-lock').hidden = unlocked;
}

function resetHearts() {
  damagedHalves = 0;
  fallingFromPlatform = false;
  updateHearts();
}

function updateHearts() {
  hearts.forEach((heart, index) => {
    const damageForHeart = damagedHalves - index * 2;
    heart.classList.toggle('damaged', damageForHeart === 1);
    heart.classList.toggle('empty', damageForHeart >= 2);
  });
}

function damageHeart() {
  if (damagedHalves >= hearts.length * 2) return;
  damagedHalves += 1;
  updateHearts();

  if (damagedHalves === hearts.length * 2) {
    hasWon = true;
    winMessage.textContent = 'GAME OVER';
    finalScoreValue.textContent = collectedCoins;
    finalScore.hidden = false;
    winMessage.hidden = false;
    playAgain.hidden = false;
    nextLevel.hidden = levelTwo;
    nextLevel.disabled = localStorage.getItem('level2Unlocked') !== 'true';
  }
}

updateLevelLocks();

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
  const finishBounds = (levelTwo ? exitDoor : flag).getBoundingClientRect();
  const isRightOfFinish = heroBounds.right > finishBounds.left;
  if (isRightOfFinish && heroBounds.bottom > finishBounds.top &&
      heroBounds.top < finishBounds.bottom) {
    hasWon = true;
    winMessage.textContent = 'YOU WIN';
    if (!levelTwo) {
      localStorage.setItem('level2Unlocked', 'true');
      updateLevelLocks();
    }
    winMessage.hidden = false;
    playAgain.hidden = false;
    nextLevel.hidden = false;
    finalScoreValue.textContent = collectedCoins;
    finalScore.hidden = false;
  }
}

function enterLevelTwo() {
  levelTwo = true;
  scene.classList.add('level-two');
  hero.style.left = '1rem';
  heroY = 0;
  verticalSpeed = 0;
  isGrounded = true;
  hasWon = false;
  winMessage.textContent = 'YOU WIN';
  resetHearts();
  winMessage.hidden = true;
  finalScore.hidden = true;
  playAgain.hidden = true;
  nextLevel.hidden = true;
  for (const coin of coins) coin.hidden = false;
  collectedCoins = 0;
  score.textContent = collectedCoins;
}

function checkLaser() {
  if (!levelTwo || getComputedStyle(laser).opacity === '0') return;
  const heroBounds = hero.getBoundingClientRect();
  const laserBounds = laser.getBoundingClientRect();
  if (heroBounds.left < laserBounds.right && heroBounds.right > laserBounds.left &&
      heroBounds.top < laserBounds.bottom && heroBounds.bottom > laserBounds.top) {
    hero.style.left = '1rem';
    heroY = 0;
    verticalSpeed = 0;
    isGrounded = true;
  }
}

function moveLaserToRandomHeight() {
  const minHeight = 20;
  const maxHeight = 76;
  const randomHeight = minHeight + Math.random() * (maxHeight - minHeight);
  laser.style.bottom = `${randomHeight}%`;
}

moveLaserToRandomHeight();
setInterval(moveLaserToRandomHeight, 4500);

function restartCurrentLevel() {
  if (!levelTwo) {
    window.location.reload();
    return;
  }

  hero.style.left = '1rem';
  heroY = 0;
  verticalSpeed = 0;
  isGrounded = true;
  hasWon = false;
  winMessage.textContent = 'YOU WIN';
  resetHearts();
  winMessage.hidden = true;
  finalScore.hidden = true;
  playAgain.hidden = true;
  nextLevel.hidden = true;
  for (const coin of coins) coin.hidden = false;
  collectedCoins = 0;
  score.textContent = collectedCoins;
  moveLaserToRandomHeight();
}

playAgain.addEventListener('click', restartCurrentLevel);

nextLevel.addEventListener('click', () => {
  if (!nextLevel.disabled) enterLevelTwo();
});

levelMenuButton.addEventListener('click', () => {
  levelMenu.hidden = !levelMenu.hidden;
  levelMenuButton.setAttribute('aria-expanded', String(!levelMenu.hidden));
});

levelMenu.addEventListener('click', (event) => {
  const selectedButton = event.target.closest('button');
  if (!selectedButton) return;
  const selectedLevel = selectedButton.dataset.level;
  if (!selectedLevel) return;
  if (selectedButton.disabled) return;
  levelMenu.hidden = true;
  levelMenuButton.setAttribute('aria-expanded', 'false');
  if (selectedLevel === '1' && levelTwo) {
    window.location.reload();
  } else if (selectedLevel === '2' && !levelTwo) {
    enterLevelTwo();
  }
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
    if (heroY > 0 && verticalSpeed <= 0) {
      fallingFromPlatform = true;
    }
    isGrounded = false;
    verticalSpeed -= gravity * elapsedSeconds;
    heroY += verticalSpeed * elapsedSeconds;
    if (heroY <= 0) {
      if (fallingFromPlatform) damageHeart();
      heroY = 0;
      verticalSpeed = 0;
      isGrounded = true;
      fallingFromPlatform = false;
    }
  }

  hero.style.bottom = `${baseBottom + heroY}px`;
  collectCoins();
  checkWin();
  checkLaser();

  requestAnimationFrame(update);
}

requestAnimationFrame(update);
