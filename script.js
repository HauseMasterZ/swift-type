let currentQuote = "";
let totalTyped = 0;
let totalErrors = 0;
let startTime = 0;
let endTime = 0;
let timerInterval = null;
let words = currentQuote.split(' ');
let errorQuote = "";
let typedValue = "";
let interval;
let endOfWord = false;
let currentWordIndex = 0;
const quoteLengthRadios = document.getElementsByName("quoteLength");
const quoteDisplay = document.getElementById("quote");
const inputBox = document.getElementById("inputBox");
const timerDisplay = document.getElementById("timerDisplay");
const wpmDisplay = document.getElementById("wpmDisplay");
const grossWPMDisplay = document.getElementById("grossWPMDisplay");
const netWPMDisplay = document.getElementById("netWPMDisplay");
const accuracyDisplay = document.getElementById("accuracyDisplay");
const errorsDisplay = document.getElementById("errorsDisplay");
const capslockWarning = document.getElementById("capslockWarning");
const categoryDisplay = document.getElementById("categoryDisplay");
const resultImg = document.getElementById('resultImg');
const refreshButton = document.getElementById("refreshButton");
function initialize() {
    fetchRandomQuote();
    inputBox.addEventListener("keyup", checkInput);
    inputBox.addEventListener("keydown", checkCapslock);
}

function refreshQuote() {
    timerDisplay.textContent = "Time: 0s";
    if (document.getElementById("customTextInput").value !== "") {
        currentQuote = document.getElementById("customTextInput").value;
        quoteDisplay.textContent = currentQuote;
        words = currentQuote.split(' ');
        inputBox.value = "";
        inputBox.disabled = false;
        inputBox.focus();
        totalTyped = 0;
        totalErrors = 0;
        errorQuote = words.slice();
        endTime = 0;
        timerInterval = null; // Reset the timer interval
        currentWordIndex = 0;
        wpmDisplay.textContent = "Current WPM: 0";
        grossWPMDisplay.textContent = "Gross WPM: 0";
        netWPMDisplay.textContent = "Net WPM: 0";
        accuracyDisplay.textContent = "Accuracy: 100%";
        errorsDisplay.textContent = "Errors: 0";
        categoryDisplay.textContent = "";
    } else {
        clearInterval(interval);
        resultImg.setAttribute('src', '');
        resultImg.classList.add('hidden');
        document.body.style.backgroundColor = '#fff';
        clearInterval(timerInterval);
        categoryDisplay.textContent = "";
        fetchRandomQuote();
    }
}


function fetchRandomQuote() {
    let minLength = 0;
    let maxLength = 0;
    if (quoteLengthRadios[1].checked) {
      minLength = 1;
      maxLength = 100;
    } else if (quoteLengthRadios[2].checked) {
      minLength = 100;
      maxLength = 250;
    } else if (quoteLengthRadios[3].checked) {
      minLength = 250;
        maxLength = 430;
    }
    const url = minLength > 0 ? `https://api.quotable.io/quotes/random/?minLength=${minLength}&maxLength=${maxLength}` : "https://api.quotable.io/quotes/random";
    fetch(url)
        .then(response => response.json())
        .then(data => {
            currentQuote = data[0]['content'];
            quoteDisplay.textContent = currentQuote;
            words = currentQuote.split(' ');
            inputBox.value = "";
            inputBox.disabled = false;
            inputBox.focus();
            totalTyped = 0;
            totalErrors = 0;
            errorQuote = words.slice();
            endTime = 0;
            timerInterval = null; // Reset the timer interval
            currentWordIndex = 0;
            wpmDisplay.textContent = "Current WPM: 0";
            grossWPMDisplay.textContent = "Gross WPM: 0";
            netWPMDisplay.textContent = "Net WPM: 0";
            accuracyDisplay.textContent = "Accuracy: 100%";
            errorsDisplay.textContent = "Errors: 0";
        })
        .catch(error => {
            console.log("Error fetching quote:", error);
        });
    startTime = 0; // Reset the start time
}


function checkInput(event) {
    typedValue = inputBox.value;
    endOfWord = typedValue.endsWith(' ');
    typedValue = typedValue.trim();
    totalTyped = typedValue.length;
    const typedWords = typedValue.split(' ');
    if (event['key'] === 'Backspace') {
        const nextWordExists = words[typedWords.length];
        if (nextWordExists) {
            errorQuote[typedWords.length] = `<span class="correct">${nextWordExists}</span>`;
        }
        return;
    }
    const latestWord = typedWords[typedWords.length - 1];
    const currentWord = words[typedWords.length - 1];
    const isEndOfQuote = typedWords.length >= words.length && typedValue.endsWith('.');
    if (typedValue === currentQuote || isEndOfQuote) {
        endTest();
        refreshButton.focus();
        return;
    }
    if (startTime === 0) {
        startTimer();
    }
    try {
        const isCorrect = latestWord === currentWord.slice(0, latestWord.length);
        if (isCorrect && !(endOfWord && latestWord.length < currentWord.length)) {
            errorQuote[typedWords.length - 1] = `<span class="correct">${currentWord}</span>`;
        } else {
            errorQuote[typedWords.length - 1] = `<span class="error">${currentWord}</span>`;
        }
        totalErrors = isCorrect ? totalErrors : totalErrors + 1;
    } catch (e) {
        endTest();
        refreshButton.focus();
        return;
    }

    quoteDisplay.innerHTML = errorQuote.join(' ');
    currentWordIndex = typedValue.trim().split(' ').length - 1;
    accuracyDisplay.textContent = `Accuracy: ${calculateAccuracy(totalTyped, totalErrors)}%`;
    errorsDisplay.textContent = `Errors: ${totalErrors}`;
}

function startTimer() {
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    timerDisplay.textContent = `Time: ${elapsedTime}s`;
    wpmDisplay.textContent = `Current WPM: ${calculateWPM(currentTime)}`;
}

function displaySpeed(prefix, number, stars) {
    let count = 0;
    interval = setInterval(() => {
        categoryDisplay.textContent = `${prefix} ${count}km/h ${stars}`;
        count++;
        if (count > number) {
            clearInterval(interval);
        }
    }, 1000 / number);
}

function endTest() {
    clearInterval(timerInterval);
    inputBox.disabled = true;
    endTime = new Date().getTime();
    const netWPM = calculateNetWPM(totalErrors, endTime);
    const wpm = calculateWPM(endTime);
    const accuracy = calculateAccuracy(totalTyped, totalErrors);
    grossWPMDisplay.textContent = `Gross WPM: ${wpm}`;
    netWPMDisplay.textContent = `Net WPM: ${netWPM}`;
    accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
    errorsDisplay.textContent = `Errors: ${totalErrors}`;
    if (netWPM < 50) {
        resultImg.setAttribute('src', 'svg/sloth.svg');
        displaySpeed('Sloth-paced Typist 🦥', (netWPM / 10) * 2, '⭐');
        document.body.style.backgroundColor = '#C69061';
    } else if (netWPM >= 50 && netWPM < 60) {
        resultImg.setAttribute('src', 'svg/sea_turtle.svg');
        displaySpeed('Turtle-paced Typist 🐢', Math.random() * (50 - 10) + 10, '⭐');
        document.body.style.backgroundColor = 'rgb(151, 54, 193)';
    } else if (netWPM >= 60 && netWPM < 70) {
        resultImg.setAttribute('src', 'svg/horse.svg');
        displaySpeed('Horse-speed Typist 🐎', Math.random() * (90 - 50) + 50, '⭐⭐');
        document.body.style.backgroundColor = '#BFAA87';
    } else if (netWPM >= 70 && netWPM < 80) {
        resultImg.setAttribute('src', 'svg/lion.svg');
        displaySpeed('Lion-fingered Typist 🦁', Math.random() * (120 - 90) + 90, '⭐⭐');
        document.body.style.backgroundColor = '#DD8547';
    } else if (netWPM >= 80 && netWPM < 90) {
        resultImg.setAttribute('src', 'svg/cheetah.svg');
        displaySpeed('Cheetah-swift Typist 🐆', Math.random() * (180 - 120) + 120, '⭐⭐⭐');
        document.body.style.backgroundColor = '#DC864B';
    } else if (netWPM >= 90 && netWPM < 100) {
        resultImg.setAttribute('src', 'svg/eagle.svg');
        displaySpeed('Eagle-eyed Typist 🦅', Math.random() * (300 - 180) + 180, '⭐⭐⭐⭐');
        document.body.style.backgroundColor = '#AB7D5A';
    } else if (netWPM >= 100 && netWPM < 140) {
        resultImg.setAttribute('src', 'svg/falcon.svg');
        displaySpeed('Falcon-keyed Typist 🦅', Math.random() * (400 - 300) + 300, '⭐⭐⭐⭐⭐');
        document.body.style.backgroundColor = 'lightblue';
    } else if (netWPM >= 140 && netWPM < 150) {
        resultImg.setAttribute('src', 'svg/hausemaster.svg');
        displaySpeed('Supersonic Typist 🚀 AKA HauseMaster', Math.random() * (1000 - 300) + 300, '⭐⭐⭐⭐⭐');
        document.body.style.backgroundColor = 'Red';
    } else {
        displaySpeed('Lightning-Fast Typist ⚡️', 300000, '⭐⭐⭐⭐⭐');
        document.body.style.backgroundColor = 'yellow';
        return;
    }
    resultImg.classList.remove('hidden');
    resultImg.classList.add('slide-in');
}

function calculateWPM(endTime) {
    const minutes = (endTime - startTime) / 60000; // in minutes
    const wpm = Math.round(currentWordIndex / minutes);
    return wpm;
}

function calculateNetWPM(totalErrors, endTime) {
    const errorWords = Math.floor(totalErrors / 5);
    const netTyped = currentWordIndex - errorWords;
    const minutes = (endTime - startTime) / 60000; // in minutes
    const netWPM = Math.round(netTyped / minutes);
    return netWPM;
}

function calculateAccuracy(totalTyped, totalErrors) {
    const accuracy = Math.round((totalTyped - totalErrors) / totalTyped * 100);
    return accuracy;
}

function checkCapslock(event) {
    const capslockOn = event.getModifierState && event.getModifierState("CapsLock");
    capslockWarning.style.display = capslockOn ? "block" : "none";
}

function openCustomTextModal() {
    const customTextModal = document.getElementById("customTextModal");
    customTextModal.style.display = "block";
}

function closeCustomTextModal() {
    const customTextModal = document.getElementById("customTextModal");
    customTextModal.style.display = "none";
    refreshQuote();
}

function applyCustomText() {
    const customTextInput = document.getElementById("customTextInput");
    const customText = customTextInput.value;
    if (customText) {
        currentQuote = customText;
        quoteDisplay.textContent = currentQuote;
        words = currentQuote.split(' ');
        errorQuote = currentQuote.split(' ');
    }
    closeCustomTextModal();
}

initialize();