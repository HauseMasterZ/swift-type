"use strict";
const levels = [
    {
        threshold: 0,
        imgSrc: 'svg/sloth.svg',
        title: 'Snail-paced Typist 🐌',
        speed: Math.random() * (10 - 5) + 5,
        stars: '⭐',
        backgroundColor: '#C69061'
    },
    {
        threshold: 20,
        imgSrc: 'svg/sea_turtle.svg',
        title: 'Turtle-paced Typist 🐢',
        speed: Math.random() * (50 - 10) + 10,
        stars: '⭐',
        backgroundColor: 'rgb(151, 54, 193)'
    },
    {
        threshold: 40,
        imgSrc: 'svg/horse.svg',
        title: 'Horse-speed Typist 🐎',
        speed: Math.random() * (90 - 50) + 50,
        stars: '⭐⭐',
        backgroundColor: '#BFAA87'
    },
    {
        threshold: 60,
        imgSrc: 'svg/lion.svg',
        title: 'Lion-fingered Typist 🦁',
        speed: Math.random() * (120 - 90) + 90,
        stars: '⭐⭐',
        backgroundColor: '#DD8547'
    },
    {
        threshold: 80,
        imgSrc: 'svg/cheetah.svg',
        title: 'Cheetah-swift Typist 🐆',
        speed: Math.random() * (180 - 120) + 120,
        stars: '⭐⭐⭐',
        backgroundColor: '#DC864B'
    },
    {
        threshold: 100,
        imgSrc: 'svg/eagle.svg',
        title: 'Eagle-eyed Typist 🦅',
        speed: Math.random() * (300 - 180) + 180,
        stars: '⭐⭐⭐⭐',
        backgroundColor: '#AB7D5A'
    },
    {
        threshold: 120,
        imgSrc: 'svg/falcon.svg',
        title: 'Falcon-keyed Typist 🦅',
        speed: Math.random() * (400 - 300) + 300,
        stars: '⭐⭐⭐⭐',
        backgroundColor: 'Lightblue'
    },
    {
        threshold: 140,
        imgSrc: 'svg/hausemaster.svg',
        title: 'Supersonic Typist 🚀 AKA HauseMaster',
        speed: Math.random() * (1000 - 300) + 300,
        stars: '⭐⭐⭐⭐⭐',
        backgroundColor: 'Red'
    },
    {
        threshold: 160,
        imgSrc: 'svg/flash.svg',
        title: 'Lightning-Fast Typist ⚡️',
        speed: 300000,
        stars: '⭐⭐⭐⭐⭐',
        backgroundColor: 'Yellow'
    }
];
let currentQuote = "";
let totalTyped = 0;
let totalErrors = 0;
let startTime = 0;
let endTime = 0;
let timerInterval = null;
let words = [];
let errorQuote = "";
let typedValue = "";
let speedInterval;
let currentWordIndex = 0;
const quoteLengthRadios = document.getElementsByName("quoteLength");
const quoteDisplay = document.getElementById("quote");
const body = document.querySelector("body");
const modeToggle = document.querySelector(".dark-light");
const radioContainer = document.querySelector(".radio-container");
const inputBox = document.getElementById("inputBox");
const timerDisplay = document.getElementById("timerDisplay");
const wpmDisplay = document.getElementById("wpmDisplay");
const grossWPMDisplay = document.getElementById("grossWPMDisplay");
const netWPMDisplay = document.getElementById("netWPMDisplay");
const accuracyDisplay = document.getElementById("accuracyDisplay");
const errorsDisplay = document.getElementById("errorsDisplay");
const customTextModal = document.getElementById("customTextModal");
const capslockWarning = document.getElementById("capslockWarning");
const categoryDisplay = document.getElementById("categoryDisplay");
const resultImg = document.getElementById('resultImg');
const refreshButton = document.getElementById("refreshButton");

// js code to toggle dark and light mode
modeToggle.addEventListener("click", () => {
    modeToggle.classList.toggle("active");
    body.classList.toggle("dark");
    body.classList.contains("dark") ? body.style.backgroundColor = '#18191A' : body.style.backgroundColor = '#E4E9F7';
});

function createRipple(event) {
    const button = event.currentTarget;
    button.classList.remove("shrink-animation");
    void button.offsetWidth;
    button.classList.add("shrink-animation");
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    console.log(event.clientX, rect.left, event.clientY, rect.top);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add("ripple");
    button.appendChild(ripple);
    ripple.addEventListener("animationend", () => {
        button.removeChild(ripple);
        ripple.remove();
    });
}

function refreshQuote(event) {
    timerDisplay.textContent = "Time: 0s";
    if (document.getElementById("customTextInput").value !== "") {
        inputBox.value = "";
        currentQuote = document.getElementById("customTextInput").value;
        quoteDisplay.textContent = currentQuote;
        errorQuote = words.slice();
        inputBox.disabled = false;
        inputBox.focus();
        totalTyped = 0;
        totalErrors = 0;
        endTime = 0;
        currentWordIndex = 0;
        wpmDisplay.textContent = "Current WPM: 0";
        grossWPMDisplay.textContent = "Gross WPM: 0";
        netWPMDisplay.textContent = "Net WPM: 0";
        accuracyDisplay.textContent = "Accuracy: 100%";
        errorsDisplay.textContent = "Errors: 0";
    } else {
        fetchRandomQuote();
    }
    resultImg.setAttribute('src', '');
    resultImg.classList.add('hidden');
    body.classList.contains("dark") ? body.style.backgroundColor = '#18191A' : body.style.backgroundColor = '#E4E9F7';
    categoryDisplay.textContent = "";
    clearInterval(speedInterval);
    clearInterval(timerInterval);
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
    if (event['key'] === 'CapsLock' || event['key'] === 'Shift' || event['key'] == 'Enter' || event['code'] == 'Space') {
        return;
    }
    typedValue = inputBox.value.trim();
    totalTyped = typedValue.length;
    const typedWords = typedValue.split(' ');
    const latestWord = typedWords[typedWords.length - 1];
    const currentWord = words[typedWords.length - 1];

    if (event['key'] === 'Backspace') {
        const nextWordExists = words[typedWords.length];
        if (nextWordExists) {
            errorQuote[typedWords.length] = `<span class="correct">${nextWordExists}</span>`;
        }
    }
    try {
        let markedWord = '';
        for (let index = 0; index < latestWord.length; index++) {
            if (latestWord[index] === currentWord[index]) {
                markedWord += `<span class="success">${latestWord[index]}</span>`
            } else {
                markedWord += `<span class="error">${currentWord[index] ? currentWord[index] : latestWord[index]}</span>`
            }
        }
        errorQuote[typedWords.length - 1] = markedWord + currentWord.slice(latestWord.length);
        if ((currentWord[latestWord.length - 1] === latestWord[latestWord.length - 1] && currentWord[latestWord.length - 1]) || event['key'] === 'Backspace') {
            if (event['key'] !== 'Backspace') {
                wpmDisplay.classList.remove('flash-out-green');
                void wpmDisplay.offsetWidth; // Trigger a reflow to restart the animation
                wpmDisplay.classList.add('flash-out-green');
            }
        } else {
            totalErrors++;
            errorsDisplay.classList.remove('flash-out-red');
            accuracyDisplay.classList.remove('flash-out-red');
            void accuracyDisplay.offsetWidth; // Trigger a reflow to restart the animation
            void errorsDisplay.offsetWidth; // Trigger a reflow to restart the animation
            errorsDisplay.classList.add('flash-out-red');
            accuracyDisplay.classList.add('flash-out-red');
        }
    } catch (e) {
        endTest();
        refreshButton.focus();
        return;
    }
    if (startTime === 0) {
        startTimer();
    }
    quoteDisplay.innerHTML = errorQuote.join(' ');
    currentWordIndex = typedWords.length - 1;
    accuracyDisplay.textContent = `Accuracy: ${calculateAccuracy(totalTyped, totalErrors)}%`;
    errorsDisplay.textContent = `Errors: ${totalErrors}`;
    const isEndOfQuote = typedWords.length >= words.length && typedValue.endsWith('.');
    if (typedValue === currentQuote || isEndOfQuote) {
        endTest();
        refreshButton.focus();
        return;
    }
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
    const duration = 3000; // Total duration for the animation in milliseconds
    const startTime = Date.now();
    const easingFactor = 5;
    function easeOutExpo(t) {
        return 1 - Math.pow(2, -easingFactor * t);
    }
    function updateDisplay() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const progress = elapsedTime / duration;
        const easedProgress = easeOutExpo(progress);
        const currentValue = Math.round(easedProgress * number);
        if (currentValue >= number) {
            clearInterval(speedInterval);
            return;
        }
        categoryDisplay.textContent = `${prefix} ${currentValue}km/h ${stars}`;
    }
    speedInterval = setInterval(updateDisplay, 1000 / number);
}

function endTest() {
    inputBox.disabled = true;
    endTime = new Date().getTime();
    const netWPM = calculateNetWPM(endTime);
    const wpm = calculateWPM(endTime);
    const accuracy = calculateAccuracy(totalTyped, totalErrors);
    grossWPMDisplay.textContent = `Gross WPM: ${wpm}`;
    netWPMDisplay.textContent = `Net WPM: ${netWPM}`;
    accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
    errorsDisplay.textContent = `Errors: ${totalErrors}`;
    clearInterval(timerInterval);
    let level = levels[0];
    for (let i = 0; i < levels.length; i++) {
        if (netWPM >= levels[i].threshold) {
            level = levels[i];
        } else {
            break;
        }
    }
    resultImg.setAttribute('src', level.imgSrc);
    displaySpeed(level.title, level.speed, level.stars);
    document.body.style.backgroundColor = level.backgroundColor;
    resultImg.classList.remove('hidden');
    resultImg.classList.add('slide-in');
}

function calculateWPM(endTime) {
    const minutes = (endTime - startTime) / 60000; // in minutes
    const wpm = Math.round((currentWordIndex + 1) / minutes);
    return wpm;
}

function calculateNetWPM(endTime) {
    let errorWordCnt = 0;
    typedValue.split(' ').forEach((word, index) => {
        if (word !== words[index]) {
            errorWordCnt++;
        }
    });
    totalErrors = Math.max(errorWordCnt, totalErrors);
    const netTyped = currentWordIndex - errorWordCnt + 1;
    const minutes = (endTime - startTime) / 60000; // in minutes
    const netWPM = Math.round(netTyped / minutes);
    return Math.max(netWPM, 0);
}

function calculateAccuracy(totalTyped, totalErrors) {
    const accuracy = Math.round((totalTyped - totalErrors) / totalTyped * 100);
    return Math.max(accuracy, 0);
}

function checkCapslock(event) {
    const capslockOn = event.getModifierState && event.getModifierState("CapsLock");
    capslockWarning.style.display = capslockOn ? "block" : "none";
}

function openCustomTextModal() {
    customTextModal.style.display = "block";
    document.getElementById("customTextInput").focus();
}

radioContainer.addEventListener("change", (event) => {
    if (event.target.matches("input[type='radio']")) {
        refreshQuote();
    }
});

window.addEventListener("click", (event) => {
    if (event.target === customTextModal) {
        closeCustomTextModal();
    }
});

function closeCustomTextModal() {
    customTextModal.style.display = "none";
    if (document.getElementById("customTextInput").value) {
        refreshQuote();
    }
}

function applyCustomText() {
    currentQuote = document.getElementById("customTextInput").value;
    if (!currentQuote) {
        return;
    }
    quoteDisplay.textContent = currentQuote;
    words = currentQuote.split(' ');
    errorQuote = currentQuote.split(' ');
    closeCustomTextModal();
}

window.onload = () => {
    fetchRandomQuote();
    inputBox.addEventListener("keyup", checkInput);
    inputBox.addEventListener("keydown", checkCapslock);
    refreshButton.addEventListener("click", createRipple);
    document.getElementById("customButton").addEventListener("click", createRipple);
    modeToggle.click();
}
