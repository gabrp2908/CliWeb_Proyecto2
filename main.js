document.addEventListener('DOMContentLoaded', () => {
    // Variables globales del juego
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
    let isMusicPlaying = false;

    // Elementos del DOM
    const setupScreen = document.getElementById('setup-screen');
    const gameSetupForm = document.getElementById('game-setup');
    const gameScreen = document.getElementById('game-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const resultsScreen = document.getElementById('results-screen');
    const categorySelect = document.getElementById('category');
    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');

    // Música de fondo
    const backgroundMusic = new Audio('assets/TV_GAME.ogg');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;

    // Categorías disponibles
    const categories = [
        { id: 9, name: "Conocimiento general" },
        { id: 11, name: "Cine" },
        { id: 12, name: "Música" },
        { id: 15, name: "Videojuegos" },
        { id: 17, name: "Ciencia y Naturaleza" },
        { id: 18, name: "Computadoras" },
        { id: 21, name: "Deportes" },
        { id: 22, name: "Geografía" },
        { id: 31, name: "Anime y Manga" },
        { id: 32, name: "Animación" }
    ];

    // Funciones
    function populateCategories() {
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    function toggleMusic() {
        isMusicPlaying = !isMusicPlaying;
        
        if (isMusicPlaying) {
            backgroundMusic.play();
            musicIcon.src = "assets/music-on.png";
        } else {
            backgroundMusic.pause();
            musicIcon.src = "assets/music-off.png";
        }
    }

    function handleGameSetup() {
        const playerName = document.getElementById('player-name').value.trim();
        const questionCount = parseInt(document.getElementById('question-count').value);
        const difficulty = document.getElementById('difficulty').value;
        const category = document.getElementById('category').value;
        
        if (playerName.length < 2 || playerName.length > 20) {
            alert('El nombre debe tener entre 2 y 20 caracteres');
            return;
        }
        
        if (questionCount < 5 || questionCount > 20) {
            alert('El número de preguntas debe estar entre 5 y 20');
            return;
        }
        
        gameSettings = {
            playerName,
            questionCount,
            difficulty: difficulty || undefined,
            category: category || undefined
        };
        
        startNewGame(gameSettings);
    }

    async function startNewGame(settings) {
        setupScreen.classList.add('hidden');
        loadingScreen.classList.remove('hidden');
        
        try {
            questions = await fetchQuestions(settings);
            currentQuestionIndex = 0;
            score = 0;
            correctAnswers = 0;
            totalTime = 0;
            
            showQuestion();
            
            loadingScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
        } catch (error) {
            console.error('Error al iniciar el juego:', error);
            alert('Error al cargar las preguntas. Inténtalo de nuevo.');
            loadingScreen.classList.add('hidden');
            setupScreen.classList.remove('hidden');
        }
    }

    async function fetchQuestions(settings) {
        let apiUrl = `https://opentdb.com/api.php?amount=${settings.questionCount}`;
        
        if (settings.difficulty) {
            apiUrl += `&difficulty=${settings.difficulty}`;
        }
        
        if (settings.category) {
            apiUrl += `&category=${settings.category}`;
        }
        
        apiUrl += '&encode=url3986';
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.response_code === 0) {
            return data.results.map(question => ({
                ...question,
                question: decodeURIComponent(question.question),
                correct_answer: decodeURIComponent(question.correct_answer),
                incorrect_answers: question.incorrect_answers.map(ans => decodeURIComponent(ans))
            }));
        } else {
            throw new Error('No se pudieron obtener las preguntas');
        }
    }

    function showQuestion() {
        const question = questions[currentQuestionIndex];
        answerSelected = false;
        startTime = new Date().getTime();

       const gameHeader = document.querySelector('.game-header');
        if (gameHeader) {
            gameHeader.innerHTML = `
                <div class="player-row">
                    <span class="player-info" id="player-name-display">${gameSettings.playerName}</span>
                    <span class="score-info" id="score">Puntuacion: ${score}</span>
                </div>
                <div class="question-progress-row">
                    <span class="progress">Pregunta <span id="current-question">${currentQuestionIndex + 1}</span> de <span id="total-questions">${questions.length}</span></span>
                </div>
                <div class="timer-container">
                    <div class="timer-bar">
                        <div class="timer-progress" id="timer-progress"></div>
                    </div>
                    <span id="time-left">20</span>s
                </div>
            `;
        }

        document.getElementById('question-text').textContent = question.question;

        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';

        const allAnswers = [...question.incorrect_answers, question.correct_answer];
        shuffleArray(allAnswers);

        allAnswers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.className = 'answer-btn';
            answerButton.textContent = answer;
            answerButton.addEventListener('click', () => selectAnswer(answer));
            answersContainer.appendChild(answerButton);
        });

        startTimer();
    }

    function startTimer() {
        clearInterval(timer);
        timeLeft = 20;
        updateTimerDisplay();
        
        timer = setInterval(() => {
            if (!answerSelected) {
                timeLeft--;
                updateTimerDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    timeUp();
                }
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const timerProgress = document.getElementById('timer-progress');
        const timeLeftDisplay = document.getElementById('time-left');
        
        const percentage = (timeLeft / 20) * 100;
        timerProgress.style.width = `${percentage}%`;
        
        if (timeLeft <= 5) {
            timerProgress.style.backgroundColor = '#ff5555';
        } else {
            timerProgress.style.backgroundColor = '#4CAF50';
        }
        
        timeLeftDisplay.textContent = timeLeft;
    }

    function timeUp() {
        answerSelected = true;
        const question = questions[currentQuestionIndex];
        
        // Solo resaltar la correcta cuando se acaba el tiempo
        document.querySelectorAll('.answer-btn').forEach(button => {
            if (button.textContent === question.correct_answer) {
                button.classList.add('correct');
            }
        });
        
        setTimeout(() => {
            nextQuestion();
        }, 1500);
    }

   function selectAnswer(selectedAnswer) {
        if (answerSelected) return;
        
        answerSelected = true;
        clearInterval(timer);
        
        const endTime = new Date().getTime();
        const timeSpent = (endTime - startTime) / 1000;
        totalTime += timeSpent;
        
        const question = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correct_answer;
        
        // Resaltar todas las respuestas relevantes
        document.querySelectorAll('.answer-btn').forEach(button => {
            if (button.textContent === question.correct_answer) {
                button.classList.add('correct');
            } else if (button.textContent === selectedAnswer && !isCorrect) {
                button.classList.add('incorrect');
            }
        });
        
        if (isCorrect) {
            score += 10;
            correctAnswers++;
            document.getElementById('score').textContent = `Puntuacion: ${score}`;
        }
        
        setTimeout(() => {
            nextQuestion();
        }, 1500);
    }

    function nextQuestion() {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        gameScreen.classList.add('hidden');
        
        const percentage = Math.round((correctAnswers / questions.length) * 100);
        const avgTime = (totalTime / questions.length).toFixed(1);
        
        document.getElementById('result-player-name').textContent = gameSettings.playerName;
        document.getElementById('result-score').textContent = score;
        document.getElementById('result-correct').textContent = correctAnswers;
        document.getElementById('result-total').textContent = questions.length;
        document.getElementById('result-percentage').textContent = percentage;
        document.getElementById('result-avg-time').textContent = avgTime;
        
        resultsScreen.classList.remove('hidden');
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function setupEventListeners() {
        gameSetupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleGameSetup();
        });

        musicToggle.addEventListener('click', toggleMusic);

        document.getElementById('play-again').addEventListener('click', () => {
            resultsScreen.classList.add('hidden'); // Oculta la pantalla de resultados
            startNewGame(gameSettings);
        });

        document.getElementById('change-settings').addEventListener('click', () => {
            resultsScreen.classList.add('hidden');
            setupScreen.classList.remove('hidden');
        });

        document.getElementById('quit-game').addEventListener('click', () => {
            resultsScreen.classList.add('hidden');
            setupScreen.classList.remove('hidden');
        });
    }

    // Inicialización
    populateCategories();
    setupEventListeners();
});