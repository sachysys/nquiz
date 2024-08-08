// Quiz state
let quizzes = [];
let selectedQuiz = null;
let currentQuestion = 0;
let score = 0;
let userAnswers = [];
let startTime;

// DOM elements
const quizSelection = document.getElementById('quiz-selection');
const quizList = document.getElementById('quiz-list');
const quizContainer = document.getElementById('quiz-container');
const quizTitle = document.getElementById('quiz-title');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const resultContainer = document.getElementById('result-container');

// Fetch available quizzes
async function fetchQuizzes() {
    try {
        const response = await fetch('quizzes.json');
        quizzes = await response.json();
        displayQuizList();
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        quizList.innerHTML = '<li>Error loading quizzes. Please try again later.</li>';
    }
}

// Display list of available quizzes
function displayQuizList() {
    quizList.innerHTML = '';
    quizzes.forEach((quiz, index) => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.textContent = quiz.title;
        button.addEventListener('click', () => selectQuiz(index));
        li.appendChild(button);
        quizList.appendChild(li);
    });
    quizSelection.style.display = 'block';
}

// Select a quiz and start it
async function selectQuiz(index) {
    selectedQuiz = quizzes[index];
    try {
        const response = await fetch(selectedQuiz.file);
        selectedQuiz.questions = await response.json();
        startQuiz();
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        alert('Error loading quiz questions. Please try again.');
    }
}

// Start the selected quiz
function startQuiz() {
    quizSelection.style.display = 'none';
    quizContainer.style.display = 'block';
    quizTitle.textContent = selectedQuiz.title;
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    startTime = new Date();
    showQuestion();
}

// Show current question
function showQuestion() {
    const question = selectedQuiz.questions[currentQuestion];
    questionText.textContent = question.question;
    
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(button);
    });
    
    nextBtn.disabled = true;
}

// Handle option selection
function selectOption(index) {
    userAnswers[currentQuestion] = index;
    nextBtn.disabled = false;
    
    const options = optionsContainer.children;
    for (let i = 0; i < options.length; i++) {
        options[i].classList.remove('selected');
    }
    options[index].classList.add('selected');
}

// Move to next question or show results
function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < selectedQuiz.questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// Calculate and display results
function showResults() {
    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds

    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';

    score = userAnswers.filter((answer, index) => answer === selectedQuiz.questions[index].correctAnswer).length;

    document.getElementById('total-questions').textContent = `Total Questions: ${selectedQuiz.questions.length}`;
    document.getElementById('correct-answers').textContent = `Correct Answers: ${score}`;
    document.getElementById('accuracy').textContent = `Accuracy: ${((score / selectedQuiz.questions.length) * 100).toFixed(2)}%`;
    document.getElementById('time-taken').textContent = `Time Taken: ${timeTaken} seconds`;

    const breakdownList = document.getElementById('question-breakdown');
    breakdownList.innerHTML = '';
    selectedQuiz.questions.forEach((question, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <p><strong>Q${index + 1}:</strong> ${question.question}</p>
            <p>Your Answer: ${question.options[userAnswers[index]]}</p>
            <p>Correct Answer: ${question.options[question.correctAnswer]}</p>
        `;
        breakdownList.appendChild(listItem);
    });
}

// Event listeners
nextBtn.addEventListener('click', nextQuestion);

// Start the application
fetchQuizzes();