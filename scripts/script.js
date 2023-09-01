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
        backgroundColor: 'rgb(72, 59, 197)'
    },
    {
        threshold: 140,
        imgSrc: 'svg/hausemaster.svg',
        title: 'Supersonic Typist 🚀 AKA HauseMaster',
        speed: Math.random() * (1000 - 300) + 300,
        stars: '⭐⭐⭐⭐⭐',
        backgroundColor: '#D21404'
    },
    {
        threshold: 160,
        imgSrc: 'svg/flash.svg',
        title: 'Lightning-Fast Typist ⚡️',
        speed: 300000,
        stars: '⭐⭐⭐⭐⭐',
        backgroundColor: 'rgb(230, 230, 0)'
    }
];
for (const level of levels) {
    const img = new Image();
    img.src = level.imgSrc;
    level.imgSrc = img;
}
console.log(levels)
let currentQuote = "";
let totalTyped = 0;
let totalErrors = 0;
let startTime = 0;
let endTime = 0;
let timerInterval = null;
let fetchInProgress = false;
let isSmoothCursorEnabled = false;
let cursorTimeout;
let letterElements = [];
let letterElementLength;
let letterElement;
let typedWords = [];
let words = [];
let letterRects = [];
let lastLetterRect;
let firstLetterRect;
let latestWord = "";
let lastWordIndex;
let speedInterval;
let currentWordIndex = 0;
const punctuationPattern = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
const quoteLengthRadios = document.getElementsByName("quoteLength");
const quoteDisplay = document.getElementById("quote");
const smoothCursor = document.getElementById("smoothCursor");
const body = document.querySelector("body");
const modeToggle = document.querySelector(".dark-light");
const cursorSpan = document.querySelector('.cursor');
const customTextInput = document.getElementById("customTextInput");
const radioContainer = document.querySelector(".radio-container");
const inputBox = document.getElementById("inputBox");
const loadingSpinner = document.querySelector(".spinner-border");
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
    const split_words = quote.split(' ');
    const wordElements = split_words.map(word => {
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
    letterElements = [];
    letterRects = [];
    typedWords = [];
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
    if (customTextInput.value.trim() !== "") {
        currentQuote = customTextInput.value;
        splitQuote(currentQuote);
        words = document.querySelectorAll('.word');
        for (let index = 0; index < words.length; index++) {
            letterElements.push(words[index].querySelectorAll('letter'));
            let lettersRects = [];
            words[index].querySelectorAll('letter').forEach(letter => {
                lettersRects.push(letter.getClientRects());
            });
            letterRects.push(lettersRects);
        }
        firstLetterRect = letterRects[0][0];
        cursorSpan.style.left = `${firstLetterRect[0].left}px`;
        cursorSpan.style.top = `${firstLetterRect[0].top}px`;
        inputBox.value = "";
        inputBox.disabled = false;
        inputBox.focus();
    } else {
        if (fetchInProgress) {
            return;
        }
        fetchInProgress = true;
        loadingSpinner.style.display = "block";
        fetchRandomQuote();
    }
    currentQuote.split(' ').forEach(word => {
        typedWords.push('');
    });
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
            cursorSpan.style.display = 'block';
            currentQuote = data[0]['content'];
            loadingSpinner.style.display = "none";
            inputBox.value = "";
            inputBox.disabled = false;
            inputBox.focus();
            customTextModal.style.display === "block" ? customTextInput.focus() : inputBox.focus();
            splitQuote(currentQuote);
            words = document.querySelectorAll('.word');
            for (let index = 0; index < words.length; index++) {
                letterElements.push(words[index].querySelectorAll('letter'));
                let lettersRects = [];
                words[index].querySelectorAll('letter').forEach(letter => {
                    lettersRects.push(letter.getClientRects());
                });
                letterRects.push(lettersRects);
            }
            cursorSpan.classList.remove('hidden');
            clearTimeout(cursorTimeout);
            cursorSpan.classList.add('active');
            cursorTimeout = setTimeout(() => {
                cursorSpan.classList.remove('active');
            }, 1000);
            firstLetterRect = letterRects[0][0];
            cursorSpan.style.left = `${firstLetterRect[0].left}px`;
            cursorSpan.style.top = `${firstLetterRect[0].top}px`;
            fetchInProgress = false;

        })
        .catch(error => {
            console.log("Error fetching quote:", error);
        });
}

function checkInput(event) {
    letterElement = letterElements[currentWordIndex];
    letterElementLength = letterElement.length;
    if (startTime === 0) {
        startTimer();
    }
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
        } else {
            inputBox.value = '';
        }
        typedWords[currentWordIndex] = latestWord;
        currentWordIndex++;
        letterElement = letterElements[currentWordIndex];
        firstLetterRect = letterRects[currentWordIndex][0];
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
            latestWord = typedWords[currentWordIndex];
            letterElement = letterElements[currentWordIndex];
            letterElementLength = letterElement.length;
            if (latestWord) {
                lastLetterRect = latestWord.length > letterElementLength ? letterRects[currentWordIndex][letterElementLength - 1] : letterRects[currentWordIndex][Math.max(latestWord.length - 1, 0)];
                cursorSpan.style.left = `${lastLetterRect[0].right}px`;
                cursorSpan.style.top = `${lastLetterRect[0].top}px`;
            }
            else {
                lastLetterRect = letterRects[currentWordIndex][0];
                cursorSpan.style.left = `${lastLetterRect[0].left}px`;
                cursorSpan.style.top = `${lastLetterRect[0].top}px`;
            }
        } else {
            latestWord = latestWord.slice(0, -1);
            updateWord(latestWord, latestWord.length - 1, true);
            // updateWord(latestWord, latestWord.length, true);
        }
        words[currentWordIndex].classList.remove('error');
        return;
    }
    else if (event.inputType === 'deleteWordBackward') {
        if (latestWord === '') {
            currentWordIndex = Math.max(currentWordIndex - 1, 0);
            letterElement = letterElements[currentWordIndex];
            letterElementLength = letterElement.length;
            if (letterElement[letterElementLength - 1].textContent.match(punctuationPattern) && typedWords[currentWordIndex].match(punctuationPattern)) {
                latestWord = typedWords[currentWordIndex].slice(0, -1);
                letterElement[letterElementLength - 1].classList.remove('correct');
                letterElement[letterElementLength - 1].classList.remove('incorrect');
                lastLetterRect = letterRects[currentWordIndex][letterElementLength - 2];
                cursorSpan.style.left = `${lastLetterRect[0].right}px`;
                cursorSpan.style.top = `${lastLetterRect[0].top}px`;
                totalTyped -= 2;
                words[currentWordIndex].classList.remove('error');
                return;
            }
        } else if (latestWord.match(punctuationPattern)) {
            letterElement[letterElementLength - 1].classList.remove('correct');
            letterElement[letterElementLength - 1].classList.remove('incorrect');
            latestWord = latestWord.slice(0, -1);
            lastLetterRect = letterRects[currentWordIndex][latestWord.length - 1];
            cursorSpan.style.left = `${lastLetterRect[0].right}px`;
            cursorSpan.style.top = `${lastLetterRect[0].top}px`;
            totalTyped--;
            return;
        }
        for (let i = 0; i < letterElementLength; i++) {
            letterElement[i].classList.remove('correct');
            letterElement[i].classList.remove('incorrect');
            if (i < latestWord.length) {
                totalTyped--;
            }
        }
        latestWord = '';
        firstLetterRect = letterRects[currentWordIndex][0];
        cursorSpan.style.left = `${firstLetterRect[0].left}px`;
        cursorSpan.style.top = `${firstLetterRect[0].top}px`;
        words[currentWordIndex].classList.remove('error');
        return;
    }
    latestWord += event.data;
    totalTyped++;
    updateWord(latestWord, latestWord.length - 1);
    accuracyDisplay.textContent = `Accuracy: ${calculateAccuracy(totalTyped, totalErrors)}%`;
    errorsDisplay.textContent = `Errors: ${totalErrors}`;
    if (currentWordIndex === lastWordIndex) {
        if (latestWord.length >= letterElementLength) {
            endTest();
            refreshButton.focus();
            return;
        }
    }
}

function updateWord(latestWord, i, backspaceFlag = false) {
    const letterElement = letterElements[currentWordIndex];
    const letterElementLength = letterElement.length;
    if (letterElement[i] === undefined && !backspaceFlag) {
        letterElement[letterElementLength - 1].classList.remove('correct');
        letterElement[letterElementLength - 1].classList.add('incorrect');
        totalErrors++;
        flashErrorDisplays();
    }
    else if (backspaceFlag) {
        if (i === letterElement.length - 1) {
            if (letterElement[i].textContent === latestWord[i]) {
                letterElement[i].classList.add('correct');
                letterElement[i].classList.remove('incorrect');
            }
            else {
                letterElement[i].classList.remove('correct');
                letterElement[i].classList.add('incorrect');
            }
        }
        else if (i < letterElement.length) {
            letterElement[i + 1].classList.remove('correct');
            letterElement[i + 1].classList.remove('incorrect');
        }
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
    lastLetterRect = latestWord.length > letterElementLength - 1 ? letterRects[currentWordIndex][letterElementLength - 1] : letterRects[currentWordIndex][Math.max(latestWord.length - 1, 0)];
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
    const easingFactor = 2.5;
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
    typedWords[currentWordIndex] = latestWord;
    inputBox.disabled = true;
    endTime = new Date().getTime();
    const netWPM = calculateNetWPM(endTime);
    const wpm = calculateWPM(endTime);
    const accuracy = calculateAccuracy(totalTyped, totalErrors);
    clearInterval(timerInterval);
    let level = levels[0];
    for (let i = 0; i < levels.length; i++) {
        if (netWPM >= levels[i].threshold) {
            level = levels[i];
        } else {
            break;
        }
    }
    resultImg.src = level.imgSrc.src;
    grossWPMDisplay.textContent = `Gross WPM: ${wpm}`;
    netWPMDisplay.textContent = `Net WPM: ${netWPM}`;
    accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
    errorsDisplay.textContent = `Errors: ${totalErrors}`;
    displaySpeed(level.title, level.speed, level.stars);
    body.style.backgroundColor = level.backgroundColor;
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
    typedWords.forEach((word, index) => {
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

function toggleSmoothCursor() {
    if (isSmoothCursorEnabled) {
        smoothCursor.innerHTML = `Smooth Cursor: <span class="incorrect">OFF</span>`;
        cursorSpan.style.transition = 'none';
    } else {
        smoothCursor.innerHTML = `Smooth Cursor: <span class="correct">ON</span>`;
        cursorSpan.style.transition = 'left 0.06s linear, top 0.25s ease-out';
    }
    isSmoothCursorEnabled = !isSmoothCursorEnabled;
    inputBox.focus();
}

function applyCustomText(event) {
    if (!customTextInput.value.trim()) {
        customTextInput.value = "";
        return;
    }
    closeCustomTextModal(event);
}

function updateCursorPosition() {
    letterRects = [];
    for (let index = 0; index < words.length; index++) {
        let lettersRects = [];
        words[index].querySelectorAll('letter').forEach(letter => {
            lettersRects.push(letter.getClientRects());
        });
        letterRects.push(lettersRects);
    }
    const letterRect = latestWord
        ? letterRects[currentWordIndex][latestWord.length - 1][0]
        : letterRects[currentWordIndex][0][0];

    cursorSpan.style.left = `${latestWord ? letterRect.right : letterRect.left}px`;
    cursorSpan.style.top = `${letterRect.top}px`;
}

window.addEventListener("click", (event) => {
    if (event.target === customTextModal) {
        closeCustomTextModal(event);
    }
});

smoothCursor.addEventListener('click', () => {
    toggleSmoothCursor();
});

radioContainer.addEventListener("change", (event) => {
    if (event.target.type === "radio") {
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
    setTimeout(() => {
        toggleSmoothCursor();
    }, 1500);
}

window.addEventListener('resize', updateCursorPosition);

