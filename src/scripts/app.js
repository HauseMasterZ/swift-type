"use strict";
import { onEnd } from "./flying-focus.js";
// import axios from "axios";

const levels = [
    {
        threshold: 0,
        imgSrc: ['https://raw.githubusercontent.com/HauseMasterZ/swift-type/main/static/images/sloth.svg', '../../static/images/sloth.svg'],
        title: 'Sloth-paced Typist 🐌🦥',
        speed: Math.random() * (10 - 5) + 5,
        stars: '⭐',
        backgroundColor: '#C69061'
    },
    {
        threshold: 20,
        imgSrc: ['https://raw.githubusercontent.com/HauseMasterZ/swift-type/main/static/images/sea_turtle.svg', '../../static/images/sea_turtle.svg'],
        title: 'Turtle-paced Typist 🐢',
        speed: Math.random() * (50 - 10) + 10,
        stars: '⭐',
        backgroundColor: 'rgb(151, 54, 193)'
    },
    {
        threshold: 40,
        imgSrc: ['https://raw.githubusercontent.com/HauseMasterZ/swift-type/main/static/images/horse.svg', '../../static/images/horse.svg'],
        title: 'Horse-speed Typist 🐎',
        speed: Math.random() * (90 - 50) + 50,
        stars: '⭐⭐',
        backgroundColor: '#BFAA87'
    },
    {
        threshold: 60,
        imgSrc: ['https://raw.githubusercontent.com/HauseMasterZ/swift-type/main/static/images/lion.svg', '../../static/images/lion.svg'],
        title: 'Lion-fingered Typist 🦁',
        speed: Math.random() * (120 - 90) + 90,
        stars: '⭐⭐',
        backgroundColor: '#DD8547'
    },
    {
        threshold: 80,
        imgSrc: ['https://raw.githubusercontent.com/HauseMasterZ/swift-type/main/static/images/cheetah.svg', '../../static/images/cheetah.svg'],
        title: 'Cheetah-swift Typist 🐆',
        speed: Math.random() * (180 - 120) + 120,
        stars: '⭐⭐⭐',
        backgroundColor: '#DC864B'
    },
    {
        threshold: 100,
        imgSrc: ['https://raw.githubusercontent.com/HauseMasterZ/swift-type/main/static/images/eagle.svg', '../../static/images/eagle.svg'],
        title: 'Eagle-eyed Typist 🕊️',
        speed: Math.random() * (300 - 180) + 180,
        stars: '⭐⭐⭐⭐',
        backgroundColor: '#AB7D5A'
    },
    {
        threshold: 120,
        imgSrc: ['https://raw.githubusercontent.com/HauseMasterZ/swift-type/main/static/images/falcon.svg', '../../static/images/falcon.svg'],
        title: 'Falcon-keyed Typist 🦅',
        speed: Math.random() * (400 - 300) + 300,
        stars: '⭐⭐⭐⭐',
        backgroundColor: 'rgb(72, 59, 197)'
    },
    {
        threshold: 140,
        imgSrc: ['https://raw.githubusercontent.com/HauseMasterZ/swift-type/main/static/images/hausemaster.svg', '../../static/images/hausemaster.svg'],
        title: 'Supersonic Typist 🚀 AKA HauseMaster',
        speed: Math.random() * (1000 - 300) + 300,
        stars: '⭐⭐⭐⭐⭐',
        backgroundColor: '#D21404'
    },
    {
        threshold: 160,
        imgSrc: ['https://raw.githubusercontent.com/HauseMasterZ/swift-type/main/static/images/flash.svg', '../../static/images/flash.svg'],
        title: 'Lightning-Fast Typist ⚡️',
        speed: 300000,
        stars: '⭐⭐⭐⭐⭐',
        backgroundColor: 'rgb(230, 230, 0)'
    }
];

async function loadImages() {
    for (const level of levels) {
        const img = new Image();
        img.src = level.imgSrc[0];
        try {
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => {
                    img.src = level.imgSrc[1];
                    img.onload = resolve;
                    img.onerror = reject;
                    console.warn(`Failed to load image from CDN. Using local image instead.`);
                };
            });
            level.imgSrc = img;
        } catch (error) {
            console.error(`Failed to load image for level ${level.title}: ${error}`);
        }
    }
}

let currentQuote = "";
let totalTyped = 0;
let totalErrors = 0;
let startTime = 0;
let timerInterval = null;
let timerActive = false;
let fetchInProgress = false;
let isQuotableAPI = true;
let isMobile = false;
let isHighlightingEnabled = false;
let cursorTimeout;
let errorTimeout;
let letterElements = [];
let letterElementLength;
let letterElement;
let typedWords = [];
let errorWordCnt = 0;
let words = [];
let fallbackQuotes = [];
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
const body = document.querySelector("body");
const cursorSpan = document.querySelector('.cursor');
const customTextInput = document.getElementById("customTextInput");
const inputBox = document.getElementById("inputBox");
const container = document.querySelector(".container");
const loadingSpinner = document.querySelector(".spinner-border");
const timerDisplay = document.getElementById("timerDisplay");
const wpmDisplay = document.getElementById("wpmDisplay");
const grossWPMDisplay = document.getElementById("grossWPMDisplay");
const netWPMDisplay = document.getElementById("netWPMDisplay");
const refreshButton = document.getElementById("refreshButton");
const customButton = document.getElementById('customButton');
const clearButton = document.getElementById('clearButton');
const applyButton = document.querySelector('#customTextModal .button:first-of-type');
const cancelButton = document.querySelector('#customTextModal .button:last-of-type');
const accuracyDisplay = document.getElementById("accuracyDisplay");
const errorsDisplay = document.getElementById("errorsDisplay");
const customTextModal = document.getElementById("customTextModal");
const categoryDisplay = document.getElementById("categoryDisplay");
const resultImg = document.getElementById('resultImg');
const darkLightToggleElement = document.querySelector(".dark-light");
const smoothCursorElement = document.getElementById("smoothCursor");
const fontSelectElement = document.getElementById('font-select');
const highlightedWordsElement = document.getElementById("highlighted-words");
const quotableApiUrl = `https://api.quotable.io/quotes/random/`;
const fallbackUrl = `https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/quotes/english.json`;

/**
 * Creates a ripple effect on a button element when clicked.
 * @param {MouseEvent} event - The click event.
 */
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

/**
 * Splits a quote into individual words and letters, and displays them on the page.
 * @param {string} quote - The quote to split and display.
 */
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

/**
 * Fetches data from a URL with retries in case of failure.
 * @param {string} url - The URL to fetch data from.
 * @param {HTMLElement} fontSelect - The font select element to modify.
 * @returns {Promise<any>} - A promise that resolves with the fetched data.
 */
const fetchWithRetries = async (url, fontSelect) => {
    let data = null;
    let retries = 0;
    while (!data && retries < 3) {
        try {
            const response = await Promise.race([
                fetch(url),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            data = await response.json();
            // const response = await axios.get(url, { timeout: 5000 });
            // if (!response.status === 200) {
            //     throw new Error('Network response was not OK');
            // }
            // data = response.data;
            fontSelect ? fontSelect.setAttribute("size", "4") : null;
        } catch (error) {
            console.warn(`Failed to fetch quote ${error} (retry ${retries} of 3). Please wait...`);

            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
        }
    }
    return data;
};

/**
 * Refreshes the quote displayed on the screen. If a custom quote is entered, it splits the quote into words and letters, 
 * sets up the cursor, and enables input. If no custom quote is entered, it fetches a random quote from the API and displays it.
 * Resets all relevant variables and displays to their initial state.
 * @async
 * @function
 * @returns {Promise<void>}
 */
const refreshQuote = async () => {
    if (fetchInProgress) {
        return;
    }
    timerActive = false;
    letterElements = [];
    letterRects = [];
    typedWords = [];
    totalTyped = 0;
    errorWordCnt = 0;
    totalErrors = 0;
    startTime = 0;
    currentWordIndex = 0;
    wpmDisplay.textContent = "Current WPM: 0";
    grossWPMDisplay.textContent = "Gross WPM: 0";
    netWPMDisplay.textContent = "Net WPM: 0";
    accuracyDisplay.textContent = "Accuracy: 100%";
    errorsDisplay.textContent = "Errors: 0";
    timerDisplay.textContent = "Time: 0s";
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
        isHighlightingEnabled ? handleHighlightedWordsClick(true) : null;
        inputBox.value = "";
        inputBox.disabled = false;
        inputBox.focus();
        cursorSpan.style.display = 'block';
    } else {
        fetchInProgress = true;
        loadingSpinner.style.display = "block";
        await fetchRandomQuote();
    }

    currentQuote.split(' ').forEach(word => {
        typedWords.push('');
    });

    latestWord = "";
    resultImg.src = '';
    resultImg.classList.add('hidden');
    grossWPMDisplay.classList.remove('highlight');
    netWPMDisplay.classList.remove('highlight');
    resultImg.classList.remove('slide-in');
    categoryDisplay.classList.remove('highlight-category');
    errorsDisplay.style.color = 'var(--text-color)';
    accuracyDisplay.style.color = 'var(--text-color)';
    categoryDisplay.textContent = "";

    body.classList.contains("dark") ? body.style.backgroundColor = '#18191A' : body.style.backgroundColor = '#E4E9F7';
    clearInterval(timerInterval);
    clearInterval(speedInterval);
    onEnd();
}

/**
 * Fetches a random quote from either the Quotable API or a fallback URL.
 * @async
 * @param {HTMLElement} fontSelect - The font select element.
 */
const fetchRandomQuote = async (fontSelect = null) => {
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
        maxLength = 99999;
    }

    let data = null;
    if (isQuotableAPI) {
        const url = minLength > 0 ? `${quotableApiUrl}?minLength=${minLength}&maxLength=${maxLength}` : quotableApiUrl;

        const response = await fetchWithRetries(url, fontSelect);

        if (response) {
            data = response;
        } else {
            console.error("Failed to fetch quote from Quotable API. Using fallback URL...");
            isQuotableAPI = false;
        }
    }

    if (!data && fallbackQuotes.length === 0) {
        data = await fetchWithRetries(fallbackUrl, fontSelect);
        fallbackQuotes = data.quotes;
    }

    if (!data && fallbackQuotes.length === 0) {
        alert("Failed to fetch quote from fallback URL. Please try again later.");
        loadingSpinner.style.display = "none";
        fetchInProgress = false;
        return;
    }

    if (fallbackQuotes.length > 0) {
        if (minLength > 0) {
            const filteredQuotes = fallbackQuotes.filter(quote => quote['length'] >= minLength && quote['length'] <= maxLength);
            if (filteredQuotes.length > 0) {
                currentQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)]['text'];
            } else {
                currentQuote = data['quotes'][Math.floor(Math.random() * data['quotes'].length)]['text'];
            }
        } else {
            currentQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]['text'];
        }
    } else {
        currentQuote = data[0]['content'];
    }

    cursorSpan.style.display = 'block';
    loadingSpinner.style.display = "none";
    inputBox.value = "";
    inputBox.disabled = false;
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
    isHighlightingEnabled ? handleHighlightedWordsClick(true) : null;
    cursorSpan.classList.remove('hidden');
    activateCursor();
    firstLetterRect = letterRects[0][0];
    cursorSpan.style.left = `${firstLetterRect[0].left}px`;
    cursorSpan.style.top = `${firstLetterRect[0].top}px`;
    fetchInProgress = false;
    fontSelect ? fontSelect.setAttribute("size", "1") : null;
    customTextModal.style.display === "block" ? customTextInput.focus() : inputBox.focus();
};

/**
 * This function checks the user input and updates the UI accordingly.
 * @param {Event} event - The input event triggered by the user.
 */
function checkInput(event) {
    activateCursor();
    if (startTime === 0) {
        startTimer();
    }
    letterElement = letterElements[currentWordIndex];
    letterElementLength = letterElement.length;
    if (event.data === ' ') {
        if (latestWord.length < letterElementLength || latestWord !== words[currentWordIndex].textContent) {
            flashErrorDisplays();
            words[currentWordIndex].classList.add('error');
        } else if (!isMobile) {
            inputBox.value = '';
        }
        if (currentWordIndex === lastWordIndex) {
            const endTime = new Date().getTime();
            refreshButton.focus();
            endTest(endTime);
            return;
        }
        totalTyped++;
        typedWords[currentWordIndex] = latestWord;
        currentWordIndex++;
        isHighlightingEnabled ? highlightWord() : null;
        letterElement = letterElements[currentWordIndex];
        firstLetterRect = letterRects[currentWordIndex][0];
        cursorSpan.style.left = `${firstLetterRect[0].left}px`;
        cursorSpan.style.top = `${firstLetterRect[0].top}px`;
        latestWord = '';
        return;
    }
    else if (event.inputType === 'deleteContentBackward') {
        totalTyped--;
        if (!latestWord && words[currentWordIndex - 1].classList.contains('error')) { // or inputBox.value.trim() !== ''
            currentWordIndex = Math.max(currentWordIndex - 1, 0);
            isHighlightingEnabled ? highlightWord(true) : null;
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
            isHighlightingEnabled ? highlightWord(true) : null;
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
            const lastWord = inputBox.value.trim().split(' ').pop();
            totalTyped -= latestWord.length - lastWord.length;
            latestWord = lastWord;
            const latestWordLength = latestWord.length;
            let index = letterElementLength - 1;
            while (index >= latestWordLength) {
                letterElement[index].classList.remove('correct');
                letterElement[index].classList.remove('incorrect');
                index--;
            }
            if (latestWordLength >= letterElementLength) {
                lastLetterRect = letterRects[currentWordIndex][letterElementLength - 1];
                updateWord(latestWord, latestWordLength - 1, true);
            } else {
                lastLetterRect = letterRects[currentWordIndex][latestWordLength - 1];
            }
            cursorSpan.style.left = `${lastLetterRect[0].right}px`;
            cursorSpan.style.top = `${lastLetterRect[0].top}px`;
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
            const endTime = new Date().getTime();
            const currentWord = words[currentWordIndex].textContent;
            latestWord.trim()
            if (latestWord.length < currentWord.length || latestWord !== currentWord) {
                totalErrors++;
                flashErrorDisplays();
                words[currentWordIndex].classList.add('error');
            }
            refreshButton.focus();
            endTest(endTime);
            return;
        }
    }
}

/**
 * Updates the letter elements based on the latest word typed by the user.
 * @param {string} latestWord - The latest word typed by the user.
 * @param {number} i - The index of the letter being typed.
 * @param {boolean} [backspaceFlag=false] - A flag indicating whether the backspace key was pressed.
 */
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
    timerActive = true;
    timerInterval = setInterval(updateTimer, 200);
}

function updateTimer() {
    if (!timerActive) {
        clearInterval(timerInterval);
        return;
    }
    const currentTime = new Date().getTime();
    const elapsedTime = ((currentTime - startTime) / 1000).toFixed(1);
    timerDisplay.textContent = `Time: ${elapsedTime}s`;
    wpmDisplay.textContent = `Current WPM: ${calculateWPM(currentTime)}`;
}

function displaySpeed(prefix, number, stars) {
    const duration = 3000; // Total duration for the animation in milliseconds
    const startTime = Date.now();
    const easingFactor = 3; // Lower values correspond to slower animation
    function easeOutExpo(t) {
        return 1 - Math.pow(2, -easingFactor * t);
    }
    function updateDisplay() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const progress = elapsedTime / duration;
        const easedProgress = easeOutExpo(progress);
        const currentValue = Math.round(easedProgress * number);
        if (currentValue > number) {
            clearInterval(speedInterval);
            return;
        }
        categoryDisplay.textContent = `${prefix} ${currentValue}km/h ${stars}`;
    }

    speedInterval = setInterval(updateDisplay, 1000 / number);
}

function mapIntegerToColor(intValue, maxValue) {
    intValue = Math.min(Math.max(intValue, 0), maxValue);
    const percentage = (intValue / maxValue);
    const red = 255;
    const green = Math.min(255 * (1 - percentage), 150);
    const blue = Math.min(255 * (1 - percentage), 50);
    const color = `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`;
    return color;
}

/**
 * Ends the typing test and displays the results.
 * @param {number} endTime - The time the typing test ended.
 */
function endTest(endTime) {
    typedWords[currentWordIndex] = latestWord;
    clearInterval(timerInterval);

    const netWPM = calculateNetWPM(endTime);
    const rawWPM = calculateWPM(endTime);
    const grossWPM = calculateGrossWPM(endTime);
    const accuracy = calculateAccuracy(totalTyped, totalErrors);
    const errorColor = mapIntegerToColor(errorWordCnt, words.length);

    let level = levels[0];
    for (let i = 0; i < levels.length; i++) {
        if (netWPM >= levels[i].threshold) {
            level = levels[i];
        } else {
            break;
        }
    }
    resultImg.src = level.imgSrc.src;
    resultImg.classList.remove('hidden');
    resultImg.classList.add('slide-in');
    inputBox.disabled = true;
    grossWPMDisplay.textContent = `Gross WPM: ${grossWPM}`;
    netWPMDisplay.textContent = `Net WPM: ${netWPM}`;
    accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
    errorsDisplay.textContent = `Errors: ${totalErrors}`;
    wpmDisplay.textContent = `Raw WPM: ${rawWPM}`;
    grossWPMDisplay.classList.add('highlight');
    netWPMDisplay.classList.add('highlight');
    categoryDisplay.classList.add('highlight-category');
    body.style.backgroundColor = level.backgroundColor;
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => {
        errorsDisplay.style.color = errorColor;
        accuracyDisplay.style.color = errorColor;
    }, 1000);
    displaySpeed(level.title, level.speed, level.stars);
}

function calculateWPM(endTime) {
    const minutes = (endTime - startTime) / 60000; // in minutes
    const wpm = Math.round((currentWordIndex + 1) / minutes);
    return wpm;
}

function calculateGrossWPM(endTime) {
    let netTyped = 0;
    letterElements.forEach((letters, index) => {
        let errorCharCnt = 0;
        letters.forEach((letter, i) => {
            if (letter.classList.contains("incorrect") || !letter.classList.contains("correct")) {
                errorCharCnt++;
            }
        });
        netTyped += (letters.length - errorCharCnt) / letters.length;
    });

    const minutes = (endTime - startTime) / 60000; // in minutes
    const netWPM = Math.round(netTyped / minutes); // calculate net WPM
    return netWPM;
}

function calculateNetWPM(endTime) {
    words.forEach((word, index) => {
        if (word.classList.contains("error")) {
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
    document.getElementById("capslockWarning").style.display = capslockOn ? "block" : "none";
}

function openCustomTextModal() {
    customTextModal.style.display = "block";
    customTextInput.focus();
}

function clearCustomText() {
    customTextInput.value = "";
    onEnd();
    refreshQuote();
    document.getElementById("clearButton").style.display = "none";
}

function applyCustomText(event) {
    customTextInput.value = customTextInput.value.trim();
    if (!customTextInput.value) {
        return;
    }
    closeCustomTextModal(event);
}

function closeCustomTextModal(event) {
    customTextModal.style.display = "none";
    if (event['srcElement'].innerText === "Apply") {
        document.getElementById("clearButton").style.display = "inline-block";
        customTextInput.value = customTextInput.value.trim();
        refreshQuote();
    }
    inputBox.focus();
    onEnd();
}

function activateCursor() {
    clearTimeout(cursorTimeout);
    cursorSpan.classList.add('active');
    cursorTimeout = setTimeout(() => {
        cursorSpan.classList.remove('active');
    }, 1000);
}

function highlightWord(reverse = false) {
    if (reverse && currentWordIndex > 0) {
        words[currentWordIndex + 1].classList.remove('active-word');
        words[currentWordIndex + 2].classList.remove('subactive-word');
        words[currentWordIndex + 1].classList.add('subactive-word');
        words[currentWordIndex + 2].classList.add('inactive-word');
    } else if (!reverse) {
        words[currentWordIndex].classList.remove('subactive-word');
        words[currentWordIndex].classList.add('active-word');
        if (currentWordIndex < lastWordIndex) {
            words[currentWordIndex + 1].classList.remove('inactive-word');
            words[currentWordIndex + 1].classList.add('subactive-word');
        }
    }
}

function handleHighlightedWordsClick(initialQuoteFetch = false) {
    initialQuoteFetch ? null : highlightedWordsElement.innerHTML = `Highlighting: <span class="${isHighlightingEnabled ? 'incorrect' : 'correct'}">${isHighlightingEnabled ? 'OFF' : 'ON'}</span>`;
    isHighlightingEnabled = !isHighlightingEnabled || initialQuoteFetch;

    for (let i = currentWordIndex; i <= lastWordIndex; i++) {
        isHighlightingEnabled ? words[i].classList.add('inactive-word') : words[i].classList.remove('inactive-word', 'active-word', 'subactive-word');
    }
    if (isHighlightingEnabled && currentWordIndex < lastWordIndex) {
        words[currentWordIndex].classList.remove('inactive-word');
        words[currentWordIndex + 1].classList.remove('inactive-word');
        words[currentWordIndex].classList.add('active-word');
        words[currentWordIndex + 1].classList.add('subactive-word');
    }
    inputBox.focus();
}

function handleSmoothCursorClick() {
    const isSmoothCursorEnabled = smoothCursorElement.innerText.includes("ON");
    smoothCursorElement.innerHTML = `Smooth Caret: <span class="${isSmoothCursorEnabled ? 'incorrect' : 'correct'}">${isSmoothCursorEnabled ? 'OFF' : 'ON'}</span>`;
    cursorSpan.style.transition = isSmoothCursorEnabled ? 'none' : 'left 0.1s linear, top 0.25s ease-out';
    inputBox.focus();
}

function handleDarkLightToggleClick() {
    darkLightToggleElement.classList.toggle("active");
    body.classList.toggle("dark");
    body.classList.contains("dark") ? body.style.backgroundColor = '#18191A' : body.style.backgroundColor = '#E4E9F7';
    inputBox.focus();
}

function handleFontSelectChange() {
    const font = fontSelectElement.value;
    body.style.fontFamily = font + ', sans-serif, Arial';
    updateCursorPosition();
    document.getElementById("font-select-label").classList.add('hidden');
    inputBox.disabled ? fontSelectElement.focus() : inputBox.focus();
}

function handleClick(event) {
    const { target } = event;
    if (target.parentNode === darkLightToggleElement) {
        handleDarkLightToggleClick();
    } else if (target === clearButton) {
        clearCustomText();
    } else if (target === applyButton) {
        applyCustomText(event);
    } else if (target === cancelButton) {
        closeCustomTextModal(event);
    } else if (target === refreshButton) {
        refreshQuote();
        createRipple({ currentTarget: event.target, clientX: event.clientX, clientY: event.clientY });
    } else if (target === customButton) {
        openCustomTextModal();
        createRipple({ currentTarget: event.target, clientX: event.clientX, clientY: event.clientY });
    } else if (target === highlightedWordsElement || target.parentNode === highlightedWordsElement) {
        handleHighlightedWordsClick();
    } else if (target === smoothCursorElement || target.parentNode === smoothCursorElement) {
        handleSmoothCursorClick();
    }
}

function handleChange(event) {
    if (event.target.type === "radio") {
        refreshQuote();
    } else if (event.target === fontSelectElement) {
        handleFontSelectChange();
    }
}

function updateCursorPosition() {
    letterRects = [];
    words.forEach((word) => {
        let lettersRects = [];
        word.querySelectorAll("letter").forEach((letter) => {
            lettersRects.push(letter.getClientRects());
        });
        letterRects.push(lettersRects);
    });
    const letterRect = latestWord
        ? letterRects[currentWordIndex][Math.min(latestWord.length - 1, letterElementLength - 1)][0]
        : letterRects[currentWordIndex][0][0];
    cursorSpan.style.left = `${latestWord ? letterRect.right : letterRect.left}px`;
    cursorSpan.style.top = `${letterRect.top}px`;
}

window.onload = async () => {
    if (!window.addEventListener) {
        return;
    }
    loadingSpinner.style.display = "block";
    await loadImages();
    await fetchRandomQuote(fontSelectElement);
    isMobile = /Mobi/.test(navigator.userAgent) ? true : false;
    inputBox.addEventListener("input", checkInput);
    body.addEventListener("keydown", checkCapslock);
    window.addEventListener('resize', updateCursorPosition);
    window.addEventListener("click", (event) => {
        if (event.target === customTextModal) {
            closeCustomTextModal(event);
        }
    });

    customTextInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            applyCustomText({ srcElement: { innerText: 'Apply' } });
        }
    });

    container.addEventListener("click", handleClick);
    container.addEventListener("change", handleChange);
    cursorSpan.style.transition = 'left 0.1s linear, top 0.25s ease-out';
};