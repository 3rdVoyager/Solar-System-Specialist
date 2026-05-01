// DOM references and state
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const emptyState = document.getElementById('empty-state');
const quizView = document.getElementById('quiz-view');
const submitBtn = document.getElementById('submitBtn');
const typeInput = document.getElementById('typeInput');
const modeToggle = document.getElementById('modeToggle');
const optionCount = document.getElementById('optionCount');
const themeToggle = document.getElementById('themeToggle');
const themeToggleText = document.getElementById('themeToggleText');

let quizData = [];
let uniqueAnswers = [];
let currentQuestion = null;
let isAnswerLocked = false;
let stats = getFreshStats();

// Load data.json and normalize fields to { answer, url }
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Data file not found');

        const raw = await response.json();
        quizData = raw.map(item => ({ answer: item.name || item.answer, url: item.image || item.url }));
        uniqueAnswers = [...new Set(quizData.map(item => item.answer))];

        console.log(`✅ Quiz loaded: ${quizData.length} images ready.`);
    } catch (err) {
        console.error('❌ Error loading quiz data:', err);
        alert('Make sure data.json is present and valid.');
    }
}

// Start button behavior (single listener)
startBtn.addEventListener('click', () => {
    if (!quizData || quizData.length === 0) {
        alert('No data loaded yet!');
        return;
    }
    emptyState.style.display = 'none';
    quizView.style.display = 'block';
    startBtn.innerText = 'Restart Quiz';
    resetStats();
    loadQuestion();
});

// Initial load
loadData();

resetBtn.addEventListener('click', () => {
    // Clear loaded data and reset UI to initial state
    quizData = [];
    uniqueAnswers = [];
    currentQuestion = null;
    isAnswerLocked = false;

    document.getElementById('current-img').removeAttribute('src');
    document.getElementById('feedback').innerText = '';
    document.getElementById('choice-area').innerHTML = '';
    typeInput.value = '';
    startBtn.innerText = 'Start Quiz';
    resetStats();

    quizView.style.display = 'none';
    emptyState.style.display = 'block';
});

// Event Listeners for Input
submitBtn.addEventListener('click', checkTypingAnswer);
typeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkTypingAnswer();
});

function loadQuestion() {
    const feedback = document.getElementById('feedback');
    const choiceArea = document.getElementById('choice-area');
    const typingArea = document.getElementById('typing-area');

    isAnswerLocked = false;
    feedback.innerText = "";
    feedback.className = "";
    typeInput.value = "";
    
    currentQuestion = quizData[Math.floor(Math.random() * quizData.length)];
    document.getElementById('current-img').src = currentQuestion.url;

    if (modeToggle.value === 'multiple') {
        choiceArea.style.display = 'grid';
        typingArea.style.display = 'none';
        generateButtons();
    } else {
        choiceArea.style.display = 'none';
        typingArea.style.display = 'flex';
        typeInput.focus();
    }
}

function generateButtons() {
    const container = document.getElementById('choice-area');
    container.innerHTML = '';

    let choices = new Set();
    choices.add(currentQuestion.answer);

    // Remove current answer from distractors to prevent duplicates
    const distractorsPool = uniqueAnswers.filter(a => 
        a.toLowerCase() !== currentQuestion.answer.toLowerCase()
    );
    
    // Shuffle pool and pick distractors
    const targetCount = parseInt(optionCount.value);
    const shuffledPool = distractorsPool.sort(() => 0.5 - Math.random());
    
    for(let i=0; i < shuffledPool.length && choices.size < targetCount; i++) {
        choices.add(shuffledPool[i]);
    }

    // Render shuffled buttons
    [...choices].sort(() => 0.5 - Math.random()).forEach(text => {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.onclick = () => validate(text);
        container.appendChild(btn);
    });
}

function validate(selected) {
    if (isAnswerLocked || !currentQuestion) return;

    const feedback = document.getElementById('feedback');
    stats.attempts += 1;

    if (selected.toLowerCase() === currentQuestion.answer.toLowerCase()) {
        stats.correct += 1;
        stats.answered += 1;
        stats.currentStreak += 1;
        stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
        isAnswerLocked = true;
        feedback.innerText = "CORRECT";
        feedback.className = "correct";
        updateStatsDisplay();
        setTimeout(loadQuestion, 1000);
    } else {
        stats.wrong += 1;
        stats.currentStreak = 0;
        feedback.innerText = "TRY AGAIN";
        feedback.className = "wrong";
        updateStatsDisplay();
    }
}

function checkTypingAnswer() {
    const input = typeInput.value.trim();
    if (input) validate(input);
}

function getFreshStats() {
    return {
        attempts: 0,
        correct: 0,
        wrong: 0,
        answered: 0,
        currentStreak: 0,
        bestStreak: 0
    };
}

function resetStats() {
    stats = getFreshStats();
    updateStatsDisplay();
}

function getReadinessIndex(accuracy) {
    if (stats.attempts === 0) return 0;

    const accuracyScore = accuracy * 0.65;
    const volumeScore = Math.min(stats.answered / 30, 1) * 0.15;
    const streakScore = Math.min(stats.currentStreak / 10, 1) * 0.12;
    const durabilityScore = Math.min(stats.bestStreak / 15, 1) * 0.08;

    return Math.round((accuracyScore + volumeScore + streakScore + durabilityScore) * 1000);
}

function getReadinessLabel(score) {
    if (stats.attempts === 0 && quizData.length > 0) return 'Answer a question to start tracking.';
    if (stats.attempts === 0) return 'Load a folder to start tracking.';
    if (score >= 850) return 'Tournament ready.';
    if (score >= 700) return 'Strong, but keep sharpening.';
    if (score >= 500) return 'Building momentum.';
    if (score >= 300) return 'Needs more reps.';
    return 'Warm-up phase.';
}

function updateStatsDisplay() {
    const accuracy = stats.attempts ? stats.correct / stats.attempts : 0;
    const index = getReadinessIndex(accuracy);

    const accuracyStat = document.getElementById('accuracyStat');
    const attemptsStat = document.getElementById('attemptsStat');
    const correctStat = document.getElementById('correctStat');
    const streakStat = document.getElementById('streakStat');
    const readinessScore = document.getElementById('readinessScore');
    const readinessFill = document.getElementById('readinessFill');
    const readinessLabel = document.getElementById('readinessLabel');

    if (accuracyStat) accuracyStat.innerText = `${Math.round(accuracy * 100)}%`;
    if (attemptsStat) attemptsStat.innerText = stats.attempts;
    if (correctStat) correctStat.innerText = stats.correct;
    if (streakStat) streakStat.innerText = stats.currentStreak;
    if (readinessScore) readinessScore.innerText = index;
    if (readinessFill) readinessFill.style.width = `${index / 10}%`;
    if (readinessLabel) readinessLabel.innerText = getReadinessLabel(index);
}

function setTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem('visualIdTheme', theme);

    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggleText.innerText = isDark ? 'Light Mode' : 'Dark Mode';
}

updateStatsDisplay();
