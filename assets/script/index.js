'use strict';

const words = [
    'apple', 'banana', 'cherry', 'orange', 'pear', 'grape', 'kiwi', 'mango', 'melon', 'strawberry',
    'toyota', 'honda', 'ford', 'chevrolet', 'bmw', 'mercedes', 'audi', 'volkswagen', 'nissan', 'jeep',
    'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'kangaroo', 'panda', 'koala', 'penguin',
    'table', 'chair', 'sofa', 'bed', 'desk', 'wardrobe', 'lamp', 'mirror', 'clock', 'rug',
    'planet', 'star', 'galaxy', 'asteroid', 'comet', 'nebula', 'universe', 'cosmos', 'orbit', 'blackhole'
];

const wordElement = document.querySelector('.word');
const userInput = document.querySelector('.userInput');
const timeElement = document.querySelector('.time');
const scoreElement = document.querySelector('.currentScore');
const startBtn = document.querySelector('.startBtn');
const restartBtn = document.querySelector('.restartBtn');
const stopBtn = document.querySelector('.stopBtn');
const backgroundMusic = document.querySelector('#backgroundMusic');
const scoreboardContainer = document.querySelector('.scoreboard');
const clearScoresBtn = document.querySelector('.clearScoresBtn');
const MAX_SCORES = 9;

let time = 99;
let score = 0;
let isPlaying = false;
let wordIndex;
let timerInterval;
let totalAttempts = 0;
let correctAttempts = 0;
let totalIncorrect = 0;
let tInc=0;

function init() {
    showWord();
    timerInterval = setInterval(updateTime, 1000);
    userInput.addEventListener('input', startMatch);
    
    userInput.addEventListener('keydown', function(event) {
        if (event.key === ' ') {
            event.preventDefault(); // Prevent default space behavior (scrolling down)
            startMatch(event);
        }
    });
}

const playMusicBtn = document.querySelector('.playMusicBtn');
playMusicBtn.addEventListener('click', function() {
    backgroundMusic.play();
});

const stopMusicBtn = document.querySelector('.stopMusicBtn');
stopMusicBtn.addEventListener('click', function() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
});

function startGame() {
    if (!isPlaying) {
        isPlaying = true;
        startBtn.style.display = 'none';
        restartBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        time = 100;
        score = 0;
        scoreElement.textContent = score;
        showWord();
        userInput.style.display = 'block';
        userInput.value = '';
        userInput.disabled = false;
        userInput.focus();
        scoreElement.style.display = 'inline';
        init();
        document.addEventListener('keydown', startMatch); // Add event listener when game starts
    }
}

function restartGame() {
    score = 0;
    scoreElement.textContent = score;
    time = 100;
    timeElement.textContent = time;
    userInput.value = '';
    showWord();
    isPlaying = false;
    clearInterval(timerInterval);
    startBtn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    wordElement.textContent = '';
    correctAttempts = 0; // Reset correctAttempts
    totalAttempts = 0; // Reset totalAttempts
    totalIncorrect = 0; // Reset totalIncorrect
    tInc=0;
}

function stopGame() {
    isPlaying = false;
    clearInterval(timerInterval);
    stopBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    restartBtn.style.display = 'inline-block';
    wordElement.textContent = 'Game Stopped';
    userInput.disabled = true;

    // Save score to localStorage
    saveScore(score);
    // Display scoreboard
    displayScoreboard();
}

function updateTime() {
    time--;
    timeElement.textContent = time;

    if (time <= 10) {
        timeElement.style.color = '#ff0000';
    } else {
        timeElement.style.color = '';
    }

    if (time === 0) {
        clearInterval(timerInterval);
        timeElement.textContent = 'Time Up!';
        stopGame();
    }
}

function showWord() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * words.length);
    } while (newIndex === wordIndex);

    wordIndex = newIndex;
    wordElement.textContent = words[wordIndex];
}

function startMatch(event) {
    if (event.type === 'input' || event.key === ' ') {
        if (event.key === ' ') {
            event.preventDefault(); // Prevent default space behavior (scrolling down)
            if (!isPlaying) return; // Don't start the game if it's not already playing
            if (matchWords()) {
                score++;
                correctAttempts++; // Increment correctAttempts when the word is typed correctly
            } else {
                totalIncorrect++; // Increment totalIncorrect when the word is typed incorrectly
               
            }
            totalAttempts++; // Increment totalAttempts on every spacebar press
            scoreElement.textContent = score;
            showWord();
            userInput.value = '';
        } else if (event.type === 'input' && userInput.value.toLowerCase() === wordElement.textContent.toLowerCase()) {
            totalAttempts++; // Increment totalAttempts on correct input
        }
    }
}

function matchWords() {
    if (userInput.value.toLowerCase() === wordElement.textContent.toLowerCase()) {
        return true;
    } else {
        return false;
    }
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
stopBtn.addEventListener('click', stopGame);
document.addEventListener('keydown', startMatch);

clearScoresBtn.addEventListener('click', clearScores);

function clearScores() {
    localStorage.removeItem('wordHustleScores');
    displayScoreboard(); // Clear the displayed scoreboard as well
}

function saveScore(newScore) {
    let scores = JSON.parse(localStorage.getItem('wordHustleScores')) || [];
    const percentage = ((correctAttempts / totalAttempts) * 100).toFixed(1) + '%'; // Calculate percentage

    scores.push({ score: `${newScore}`, percentage, attempts: totalAttempts, correct: correctAttempts, incorrect: totalIncorrect });
    scores.sort((a, b) => {
        let scoreA, scoreB;
        if (typeof a.score === 'string') {
            scoreA = parseInt(a.score.split(' ')[0]);
        } else {
            scoreA = parseInt(a.score);
        }
        if (typeof b.score === 'string') {
            scoreB = parseInt(b.score.split(' ')[0]);
        } else {
            scoreB = parseInt(b.score);
        }
        return scoreB - scoreA;
    }); // Sorting scores in descending order
    scores.splice(MAX_SCORES); // only maximum scores are stored and displayed
    localStorage.setItem('wordHustleScores', JSON.stringify(scores));
    displayScoreboard(); // Call the displayScoreboard function after saving the score
}
function displayScoreboard() {
    scoreboardContainer.innerHTML = '';
    let scores = JSON.parse(localStorage.getItem('wordHustleScores')) || [];

    const showClearButton = scores.length > MAX_SCORES;

    scores.slice(0, MAX_SCORES).forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `#${index + 1}     ${score.score} words    ${score.percentage}`;
        scoreboardContainer.appendChild(li);
    });

    clearScoresBtn.style.display = showClearButton ? 'inline-block' : 'none';

    if (scores.length > 0) {
        scoreboardContainer.style.display = 'block';
    } else {
        scoreboardContainer.style.display = 'none';
    }
}