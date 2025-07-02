document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const setupScreen = document.getElementById('setup-screen');
    const gameSetupForm = document.getElementById('game-setup');
    const gameScreen = document.getElementById('game-screen');
    const categorySelect = document.getElementById('category');
    const startGameBtn = document.getElementById('start-game');
    const loadingScreen = document.getElementById('loading-screen');
    const musicToggle = document.getElementById('music-toggle');

    // Variables del juego
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let correctAnswers = 0;
    let timer;
    let timeLeft;
    let answerSelected = false;
    let startTime;
    let totalTime = 0;
    let gameSettings = {};

    const backgroundMusic = new Audio('assets/TV_GAME.ogg');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5; // Volumen fijo al 50%
    let isMusicPlaying = false;

    musicToggle.addEventListener('click', () => {
        isMusicPlaying = !isMusicPlaying;
        
        if (isMusicPlaying) {
            backgroundMusic.play();
            musicToggle.textContent = '🔊';
        } else {
            backgroundMusic.pause();
            musicToggle.textContent = '🔇';
        }
    });
});