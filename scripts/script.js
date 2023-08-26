"use strict";
const levels = [
    {
        threshold: 0,
        imgSrc: 'svg/sloth.svg',
        title: 'Sloth-paced Typist 🐌🦥',
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
let fetchInProgress = false;
let cursorTimeout;
let letterElements = [];
let words = [];
let latestWord = "";
let lastWordIndex;
let speedInterval;
let lastLetterRect;
let currentWordIndex = 0;
const punctuationPattern = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
const quoteLengthRadios = document.getElementsByName("quoteLength");
const quoteDisplay = document.getElementById("quote");
const body = document.querySelector("body");
const modeToggle = document.querySelector(".dark-light");
const cursorSpan = document.querySelector('.cursor');
const customTextInput = document.getElementById("customTextInput");
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
    inputBox.focus();
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

function splitQuote(quote) {
    quoteDisplay.innerHTML = '';
    const words = quote.split(' ');
    const wordElements = words.map(word => {
        const wordElement = document.createElement('div');
        wordElement.classList.add('word');
        for (const letter of word) {
            const letterElement = document.createElement('letter');
            letterElement.textContent = letter;
            wordElement.appendChild(letterElement);
        }
        return wordElement;
    });
    for (const wordElement of wordElements) {
        quoteDisplay.appendChild(wordElement);
    }
    lastWordIndex = wordElements.length - 1;
}

function refreshQuote() {
    if (customTextInput.value.trim() !== "") {
        inputBox.value = "";
        currentQuote = customTextInput.value;
        splitQuote(currentQuote);
        words = document.querySelectorAll('.word');
        letterElements = [];
        for (let index = 0; index < words.length; index++) {
            letterElements.push(words[index].querySelectorAll('letter'));
        }
        const firstLetterRect = letterElements[0][0].getClientRects();
        cursorSpan.style.left = `${firstLetterRect[0].left}px`;
        cursorSpan.style.top = `${firstLetterRect[0].top}px`;
        inputBox.disabled = false;
        inputBox.focus();
        totalTyped = 0;
        totalErrors = 0;
        endTime = 0;
        startTime = 0;
        currentWordIndex = 0;
        wpmDisplay.textContent = "Current WPM: 0";
        grossWPMDisplay.textContent = "Gross WPM: 0";
        netWPMDisplay.textContent = "Net WPM: 0";
        accuracyDisplay.textContent = "Accuracy: 100%";
        errorsDisplay.textContent = "Errors: 0";
    } else {
        if (fetchInProgress) {
            return;
        }
        fetchInProgress = true;
        fetchRandomQuote();
    }
    latestWord = "";
    timerDisplay.textContent = "Time: 0s";
    resultImg.setAttribute('src', '');
    resultImg.classList.remove('slide-in');
    resultImg.classList.add('hidden');
    body.classList.contains("dark") ? body.style.backgroundColor = '#18191A' : body.style.backgroundColor = '#E4E9F7';
    categoryDisplay.textContent = "";
    clearInterval(timerInterval);
    clearInterval(speedInterval);
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
            splitQuote(currentQuote);
            words = document.querySelectorAll('.word');
            letterElements = [];
            for (let index = 0; index < words.length; index++) {
                letterElements.push(words[index].querySelectorAll('letter'));
            }
            cursorSpan.classList.remove('hidden');
            cursorSpan.classList.add('active');
            const firstLetterRect = words[0].querySelector('letter').getClientRects();
            cursorSpan.style.left = `${firstLetterRect[0].left}px`;
            cursorSpan.style.top = `${firstLetterRect[0].top}px`;
            inputBox.value = "";
            inputBox.disabled = false;
            inputBox.focus();
            totalTyped = 0;
            totalErrors = 0;
            endTime = 0;
            timerInterval = null; // Reset the timer interval
            currentWordIndex = 0;
            wpmDisplay.textContent = "Current WPM: 0";
            grossWPMDisplay.textContent = "Gross WPM: 0";
            netWPMDisplay.textContent = "Net WPM: 0";
            accuracyDisplay.textContent = "Accuracy: 100%";
            errorsDisplay.textContent = "Errors: 0";
            startTime = 0; // Reset the start time
            fetchInProgress = false;
        })
        .catch(error => {
            console.log("Error fetching quote:", error);
        });
}

function checkInput(event) {
    let letterElement = letterElements[currentWordIndex];
    if (event.data === ' ') {
        if (currentWordIndex === lastWordIndex) {
            endTest();
            refreshButton.focus();
            return;
        }
        totalTyped++;
        if (latestWord.length < words[currentWordIndex].textContent.length || latestWord !== words[currentWordIndex].textContent) {
            totalErrors++;
            flashErrorDisplays();
            words[currentWordIndex].classList.add('error');
        }
        currentWordIndex++;
        letterElement = letterElements[currentWordIndex];
        const firstLetterRect = letterElement[0].getClientRects();
        cursorSpan.style.left = `${firstLetterRect[0].left}px`;
        cursorSpan.style.top = `${firstLetterRect[0].top}px`;
        latestWord = '';
        accuracyDisplay.textContent = `Accuracy: ${calculateAccuracy(totalTyped, totalErrors)}%`;
        errorsDisplay.textContent = `Errors: ${totalErrors}`;
        return;
    }
    else if (event.inputType === 'deleteContentBackward') {
        totalTyped--;
        if (!latestWord) {
            currentWordIndex = Math.max(currentWordIndex - 1, 0);
            latestWord = inputBox.value.trim().split(' ')[currentWordIndex];
            letterElement = letterElements[currentWordIndex];
            try {
                lastLetterRect = latestWord.length > letterElement.length ? lastLetterRect = letterElement[letterElement.length - 1].getClientRects() : lastLetterRect = letterElement[latestWord.length - 1].getClientRects();
                cursorSpan.style.left = `${lastLetterRect[0].right}px`;
                cursorSpan.style.top = `${lastLetterRect[0].top}px`;
            }
            catch (e) {
                lastLetterRect = letterElement[0].getClientRects();
                cursorSpan.style.left = `${lastLetterRect[0].left}px`;
                cursorSpan.style.top = `${lastLetterRect[0].top}px`;
            }
        } else {
            latestWord = latestWord.slice(0, -1);
            updateWord(latestWord, latestWord.length, true);
            updateWord(latestWord, latestWord.length - 1, true);
        }
        words[currentWordIndex].classList.remove('error');
        return;
    }
    else if (event.inputType === 'deleteWordBackward') {
        if (latestWord === '') {
            currentWordIndex = Math.max(currentWordIndex - 1, 0);
            letterElement = letterElements[currentWordIndex];
            if (letterElement[letterElement.length - 1].textContent.match(punctuationPattern)) {
                latestWord = inputBox.value.trim().split(' ')[currentWordIndex];
                letterElement[letterElement.length - 1].classList.remove('correct');
                letterElement[letterElement.length - 1].classList.remove('incorrect');
                lastLetterRect = letterElement[latestWord.length - 1].getClientRects();
                cursorSpan.style.left = `${lastLetterRect[0].right}px`;
                cursorSpan.style.top = `${lastLetterRect[0].top}px`;
                totalTyped -= 2;
                return;
            }
        } else if (latestWord.match(punctuationPattern)) {
            latestWord = inputBox.value.trim().split(' ')[currentWordIndex];
            letterElement[letterElement.length - 1].classList.remove('correct');
            letterElement[letterElement.length - 1].classList.remove('incorrect');
            lastLetterRect = letterElement[latestWord.length - 1].getClientRects();
            cursorSpan.style.left = `${lastLetterRect[0].right}px`;
            cursorSpan.style.top = `${lastLetterRect[0].top}px`;
            totalTyped--;
            return;
        }
        letterElement.forEach(letter => {
            letter.classList.remove('correct');
            letter.classList.remove('incorrect');
            totalTyped--;
        });
        latestWord = '';
        const firstLetterRect = letterElement[0].getClientRects();
        cursorSpan.style.left = `${firstLetterRect[0].left}px`;
        cursorSpan.style.top = `${firstLetterRect[0].top}px`;
        words[currentWordIndex].classList.remove('error');
        return;
    }
    if (startTime === 0) {
        startTimer();
    }
    latestWord += event.data;
    totalTyped++;
    updateWord(latestWord, latestWord.length - 1);
    accuracyDisplay.textContent = `Accuracy: ${calculateAccuracy(totalTyped, totalErrors)}%`;
    errorsDisplay.textContent = `Errors: ${totalErrors}`;
    if (currentWordIndex === lastWordIndex) {
        if (latestWord.length >= words[currentWordIndex].textContent.length) {
            endTest();
            refreshButton.focus();
            return;
        }
    }
}

function updateWord(latestWord, i, backspaceFlag = false) {
    const letterElement = letterElements[currentWordIndex];
    if (letterElement[i] === undefined) {
        if (!backspaceFlag) {
            letterElement[letterElement.length - 1].classList.remove('correct');
            letterElement[letterElement.length - 1].classList.add('incorrect');
            totalErrors++;
            flashErrorDisplays();
        }
    }
    else if (latestWord[i] === undefined) {
        letterElement[i].classList.remove('correct');
        letterElement[i].classList.remove('incorrect');
    }
    else if (latestWord[i] === letterElement[i].textContent) {
        letterElement[i].classList.remove('incorrect');
        letterElement[i].classList.add('correct');
        if (!backspaceFlag) {
            wpmDisplay.classList.remove('flash-out-green');
            void wpmDisplay.offsetWidth; // Trigger a reflow to restart the animation
            wpmDisplay.classList.add('flash-out-green');
        }
    }
    else {
        letterElement[i].classList.remove('correct');
        letterElement[i].classList.add('incorrect');
        if (!backspaceFlag) {
            totalErrors++;
            flashErrorDisplays();
        }
    }
    clearTimeout(cursorTimeout);
    cursorSpan.classList.add('active');
    cursorTimeout = setTimeout(() => {
        cursorSpan.classList.remove('active');
    }, 1000);
    lastLetterRect = latestWord.length > letterElement.length - 1 ? letterElement[letterElement.length - 1].getClientRects() : letterElement[Math.max(latestWord.length - 1, 0)].getClientRects();
    cursorSpan.style.left = latestWord.length === 0 ? `${lastLetterRect[0].left}px` : `${lastLetterRect[0].right}px`;
    cursorSpan.style.top = `${lastLetterRect[0].top}px`;
}

function flashErrorDisplays() {
    errorsDisplay.classList.remove('flash-out-red');
    accuracyDisplay.classList.remove('flash-out-red');
    void accuracyDisplay.offsetWidth; // Trigger a reflow to restart the animation
    void errorsDisplay.offsetWidth; // Trigger a reflow to restart the animation
    errorsDisplay.classList.add('flash-out-red');
    accuracyDisplay.classList.add('flash-out-red');
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
    const easingFactor = 3;
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
    clearInterval(timerInterval);
    grossWPMDisplay.textContent = `Gross WPM: ${wpm}`;
    netWPMDisplay.textContent = `Net WPM: ${netWPM}`;
    accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
    errorsDisplay.textContent = `Errors: ${totalErrors}`;
    let level = levels[0];
    for (let i = 0; i < levels.length; i++) {
        if (netWPM >= levels[i].threshold) {
            level = levels[i];
        } else {
            break;
        }
    }
    displaySpeed(level.title, level.speed, level.stars);
    body.style.backgroundColor = level.backgroundColor;
    resultImg.setAttribute('src', level.imgSrc);
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
    inputBox.value.split(' ').forEach((word, index) => {
        try {
            if (word !== words[index].textContent) {
                errorWordCnt++;
            }
        }
        catch (e) {
            return;
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
    customTextInput.focus();
}

function clearCustomText() {
    // Clear the custom text input box
    customTextInput.value = "";
    refreshQuote();
    document.getElementById("clearButton").style.display = "none";
}

function closeCustomTextModal(event) {
    customTextModal.style.display = "none";
    if (event['srcElement'].innerText === "Apply") {
        document.getElementById("clearButton").style.display = "inline-block";
        refreshQuote();
    } else {
        customTextInput.value = "";
    }
}

function applyCustomText(event) {
    if (!customTextInput.value.trim()) {
        customTextInput.value = "";
        return;
    }
    closeCustomTextModal(event);
}

window.addEventListener("click", (event) => {
    if (event.target === customTextModal) {
        closeCustomTextModal(event);
    }
});

radioContainer.addEventListener("change", (event) => {
    if (event.target.matches("input[type='radio']")) {
        refreshQuote();
    }
});

window.onload = () => {
    fetchRandomQuote();
    inputBox.addEventListener("input", checkInput);
    body.addEventListener("keydown", checkCapslock);
    refreshButton.addEventListener("click", createRipple);
    document.getElementById("customButton").addEventListener("click", createRipple);
    modeToggle.click();
}

window.addEventListener('resize', function () {
    const lastLetterRect = letterElements[currentWordIndex][Math.max(latestWord.length - 1, 0)].getClientRects();
    cursorSpan.style.left = `${lastLetterRect[0].right}px`;
    cursorSpan.style.top = `${lastLetterRect[0].top}px`;
});
