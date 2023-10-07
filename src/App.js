import React, { useState, useEffect, useRef } from 'react';
import "./styles.scss";
// import QuoteDisplay from './quoteDisplay.js';
// import { checkInput, refreshQuote, openCustomTextModal, clearCustomText, applyCustomText, closeCustomTextModal, checkCapslock, createRipple } from './functions.js';
function App() {

   // let cursorTimeout;
   // let errorTimeout;
   // let letterElementLength;
   // let letterElement;
   // let levels = [];
   // let currentWordIndex = 0;
   // let typedWords = [];
   // let errorWordCnt = 0;
   // let words = [];
   // let fallbackQuotes = [];
   // let lastLetterRect;
   // let firstLetterRect;
   // let latestWord = "";
   // let lastWordIndex;
   // let currentQuote = "";
   // let totalTyped = 0;
   // let totalErrors = 0;
   // let startTime = 0;
   // let isMobile = false;

   const [cursorTimeout, setCursorTimeout] = useState(null);
   const [errorTimeout, setErrorTimeout] = useState(null);
   const [levels, setLevels] = useState([]);
   const [currentWordIndex, setCurrentWordIndex] = useState(0);
   const [typedWords, setTypedWords] = useState([]);
   const [errorWordCnt, setErrorWordCnt] = useState(0);
   const [fallbackQuotes, setFallbackQuotes] = useState([]);
   const [lastLetterRect, setLastLetterRect] = useState(null);
   const [firstLetterRect, setFirstLetterRect] = useState(null);
   const [latestWord, setLatestWord] = useState("");
   const [lastWordIndex, setLastWordIndex] = useState(null);
   const [currentQuote, setCurrentQuote] = useState("");
   const [totalTyped, setTotalTyped] = useState(0);
   const [totalErrors, setTotalErrors] = useState(0);
   const [startTime, setStartTime] = useState(0);
   const [isMobile, setIsMobile] = useState(false);
   const [backspaceFlag, setBackspaceFlag] = useState(false);

   const [isDarkMode, setIsDarkMode] = useState(false);
   const [quoteLength, setQuoteLength] = useState('random');
   const [inputValue, setInputValue] = useState('');
   const [isCapsLockOn, setIsCapsLockOn] = useState(false);
   const [isCustomTextModalOpen, setIsCustomTextModalOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
   const [isCursorHidden, setIsCursorHidden] = useState(true);
   const [timer, setTimer] = useState(0);
   const [isInputDisabled, setIsInputDisabled] = useState(false);
   const [wpm, setWpm] = useState(0);
   const [grossWpm, setGrossWpm] = useState(0);
   const [netWpm, setNetWpm] = useState(0);
   // Create state for word class names
   const [cursorStyle, setCursorStyle] = useState({});

   const [isSmoothCursorOn, setIsSmoothCursorOn] = useState(true);
   const [isHighlightingOn, setIsHighlightingOn] = useState(false);
   const [selectedFont, setSelectedFont] = useState('Open Sans');

   const handleSmoothCursorChange = () => {
      setIsSmoothCursorOn(!isSmoothCursorOn);
   };

   const handleHighlightingChange = () => {
      setIsHighlightingOn(!isHighlightingOn);
   };

   const handleFontChange = event => {
      setSelectedFont(event.target.value);
   };
   const wpmDisplayRef = useRef(null);
   const refreshButtonRef = useRef(null);
   const [isHighlightingEnabled, setIsHighlightingEnabled] = useState(false);
   const [inputBoxValue, setInputBoxValue] = useState('');
   const [accuracy, setAccuracy] = useState(0);
   const [errors, setErrors] = useState(0);
   const [category, setCategory] = useState('');
   // const cursorSpanRef = useRef(null);
   const inputBoxRef = useRef(null);
   const quotableApiUrl = `https://api.quotable.io/quotes/random/`;
   const punctuationPattern = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
   const [words, setWordRefs] = useState([]);
   const [letterElements, setLetterRefs] = useState([]);
   const [letterRects, setLetterRects] = useState([]);
   const handleModeToggle = () => {
      setIsDarkMode(!isDarkMode);
      // inputBoxRef.current.focus();
   };
   const [quote, setQuote] = useState('');
   const quoteRef = useRef(null);

   const fetchRandomQuote = () => {
      fetch('https://api.quotable.io/random?minLength=250&maxLength=1000')
         .then(response => response.json())
         .then(data => {
            setWordRefs([]);
            setLetterRefs([]);
            setLetterRects([]);
            setQuote(data.content);
         });
   }

   useEffect(() => {
      fetchRandomQuote();
   }, []);

   const renderQuote = () => {
      const words = quote.split(' ');
      return (
         words.map((word, wordIndex) => {
            return (
               <div key={wordIndex} className="word">
                  {word.split('').map((letter, letterIndex) => {
                     return (
                        <div key={letterIndex} className="letter">
                           {letter}
                        </div>
                     );
                  })}
               </div>
            );
         })

      );
   };

   useEffect(() => {
      if (quoteRef.current) {
         const quoteDiv = document.getElementById('quote'); // Replace 'myDiv' with the actual ID
         if (quoteDiv) {
            const children = Array.from(quoteDiv.children);
            setWordRefs(children);
         }
         const wordElements = quoteRef.current.querySelectorAll('.word');
         wordElements.forEach((wordElement) => {
            const letters = wordElement.querySelectorAll('.letter');
            let newLetterRefs = [];
            let newLetterRects = [];
            letters.forEach((letterElement) => {
               const rect = letterElement.getBoundingClientRect();
               newLetterRefs.push(letterElement);
               newLetterRects.push(rect);
            });
            letterElements.push(newLetterRefs);
            letterRects.push(newLetterRects);
         });
         if (letterRects[0]) {
            setCursorStyle({ top: letterRects[0][0].top, left: letterRects[0][0].left });
         }
         setIsCursorHidden(false);
      }
   }, [quote]);

   // async function fetchRandomQuote() {
   //   let minLength = 0;
   //   let maxLength = 0;
   //   if (quoteLength === 'small') {
   //     minLength = 1;
   //     maxLength = 100;
   //   } else if (quoteLength === 'medium') {
   //     minLength = 100;
   //     maxLength = 250;
   //   } else if (quoteLength === 'large') {
   //     minLength = 250;
   //     maxLength = 430;
   //   }
   //   const url = minLength > 0 ? `https://api.quotable.io/quotes/random/?minLength=${minLength}&maxLength=${maxLength}` : "https://api.quotable.io/quotes/random";
   //   try {
   //     const response = await fetch(url);
   //     let data = await response.json();
   //     data = data[0].content;
   //     setCurrentQuote(data);
   //     await setAsyncLetterClassNames()
   //   }
   //   catch (error) {
   //     console.log("Error fetching quote:", error);
   //   };
   // }

   const startTimer = () => {
      setStartTime(Date.now());
      const timerDisplay = document.getElementById('timerDisplay');
      const timerInterval = setInterval(() => {
         const elapsedTime = Date.now() - startTime;
         setTimer(Math.floor(elapsedTime / 1000));
         if (timerDisplay) {
            timerDisplay.textContent = `${Math.floor(elapsedTime / 1000)}s`;
         }
      }, 1000);
   };

   const handleQuoteLengthChange = (event) => {
      setQuoteLength(event.target.value);
      // console.log(event)
   };

   const errorsDisplayRef = useRef(null);
   const accuracyDisplayRef = useRef(null);
   function flashErrorDisplays() {
      errorsDisplayRef.current.classList.remove('flash-out-red');
      accuracyDisplayRef.current.classList.remove('flash-out-red');
      void accuracyDisplayRef.current.offsetWidth; // Trigger a reflow to restart the animation
      void errorsDisplayRef.current.offsetWidth; // Trigger a reflow to restart the animation
      errorsDisplayRef.current.classList.add('flash-out-red');
      accuracyDisplayRef.current.classList.add('flash-out-red');
   }

   function highlightWord(reverse = false) {
      if (reverse && currentWordIndex > 0) {
         words.current[currentWordIndex + 1].classList.remove('active-word');
         words.current[currentWordIndex + 2].classList.remove('subactive-word');
         words.current[currentWordIndex + 1].classList.add('subactive-word');
         words.current[currentWordIndex + 2].classList.add('inactive-word');
      } else if (!reverse) {
         words.current[currentWordIndex].classList.remove('subactive-word');
         words.current[currentWordIndex].classList.add('active-word');
         if (currentWordIndex < lastWordIndex) {
            words.current[currentWordIndex + 1].classList.remove('inactive-word');
            words.current[currentWordIndex + 1].classList.add('subactive-word');
         }
      }
   }

   // function checkInput(event) {
   //    // activateCursor();
   //    event = event.nativeEvent;
   //    // if (startTime === 0) {
   //    //    startTimer();
   //    // }
   //    const letterElement = letterRefs[currentWordIndex];
   //    let letterElementLength = letterElement.length;
   //    if (event.data === ' ') {
   //       if (latestWord.length < letterElementLength || latestWord !== wordRefs[currentWordIndex].textContent) {
   //          flashErrorDisplays();
   //          wordRefs[currentWordIndex].classList.add('underline-text');
   //       } else if (!isMobile || true) {
   //          setInputBoxValue('');
   //          inputBoxRef.current.value = '';
   //       }
   //       if (currentWordIndex === lastWordIndex) {
   //          const endTime = new Date().getTime();
   //          refreshButtonRef.current.focus();
   //          endTest(endTime);
   //          return;
   //       }
   //       setTotalTyped(totalTyped + 1);
   //       setTypedWords((prevTypedWords) => {
   //          const newTypedWords = [...prevTypedWords];
   //          newTypedWords[currentWordIndex] = latestWord;
   //          return newTypedWords;
   //       });
   //       setCurrentWordIndex((prevCurrentWordIndex) => prevCurrentWordIndex + 1);
   //       if (isHighlightingEnabled) {
   //          highlightWord();
   //       }
   //       letterElementLength = letterRefs[currentWordIndex].length;
   //       const firstLetterRect = letterRects[currentWordIndex + 1][0];
   //       setCursorStyle({
   //          top: `${firstLetterRect.top}px`,
   //          left: `${firstLetterRect.left}px`,
   //       });
   //       setLatestWord('');
   //       return;
   //    } else if (event.inputType === 'deleteContentBackward') {
   //       setTotalTyped((prevTotalTyped) => prevTotalTyped - 1);
   //       if (latestWord === '' && (wordRefs[currentWordIndex - 1].classList.contains('underline-text') || isMobile)) {
   //          setCurrentWordIndex((prevCurrentWordIndex) => Math.max(prevCurrentWordIndex - 1, 0));
   //          if (isHighlightingEnabled) {
   //             highlightWord(true);
   //          }
   //          setLatestWord(typedWords[currentWordIndex]);
   //          letterElementLength = letterRefs[currentWordIndex - 1].length;
   //          setLastLetterRect(latestWord.length > letterElementLength ? letterRects[currentWordIndex][letterElementLength - 1] : letterRects[currentWordIndex][Math.max(latestWord.length - 1, 0)]);
   //          const lastLetterRect = letterRects[currentWordIndex][letterElementLength - 1];
   //          setCursorStyle({
   //             top: `${lastLetterRect.top}px`,
   //             left: `${lastLetterRect.right}px`,
   //          });
   //       } else {
   //          console.log('error')
   //          setLatestWord((prevLatestWord) => prevLatestWord.slice(0, -1));
   //          updateWord(latestWord.slice(0, -1), latestWord.length - 2, true);
   //       }
   //       wordRefs[currentWordIndex].classList.remove('underline-text');
   //       return;
   //    } else if (event.inputType === 'deleteWordBackward') {
   //       if (latestWord === '' && (wordRefs[currentWordIndex - 1].classList.contains('underline-text') || isMobile)) {
   //          setCurrentWordIndex((prevCurrentWordIndex) => Math.max(prevCurrentWordIndex - 1, 0));
   //          if (isHighlightingEnabled) {
   //             highlightWord(true);
   //          }
   //          letterElementLength = letterRefs[currentWordIndex].length;
   //          if (letterElement[letterElementLength - 1].textContent.match(punctuationPattern) && typedWords[currentWordIndex].match(punctuationPattern)) {
   //             setLatestWord(typedWords[currentWordIndex].slice(0, -1));
   //             letterElement[letterElementLength - 1].classList.remove('correct');
   //             letterElement[letterElementLength - 1].classList.remove('incorrect');
   //             setLastLetterRect(letterRects[currentWordIndex][letterElementLength - 2]);
   //             setCursorStyle({
   //                top: `${lastLetterRect.top}px`,
   //                left: `${lastLetterRect.right}px`,
   //             });
   //             setTotalTyped((prevTotalTyped) => prevTotalTyped - 2);
   //             wordRefs[currentWordIndex].classList.remove('underline-text');
   //             return;
   //          }
   //       } else if (latestWord.match(punctuationPattern)) {
   //          const lastWord = inputBoxValue.trim().split(' ').pop();
   //          setTotalTyped((prevTotalTyped) => prevTotalTyped - latestWord.length + lastWord.length);
   //          setLatestWord(lastWord);
   //          const latestWordLength = latestWord.length;
   //          let index = letterElementLength - 1;
   //          while (index >= latestWordLength) {
   //             letterElement[index].classList.remove('correct');
   //             letterElement[index].classList.remove('incorrect');
   //             index--;
   //          }
   //          if (latestWordLength >= letterElementLength) {
   //             setLastLetterRect(letterRects[currentWordIndex][letterElementLength - 1]);
   //             updateWord(latestWord, latestWordLength - 1, true);
   //          } else {
   //             setLastLetterRect(letterRects[currentWordIndex][latestWordLength - 1]);
   //          }
   //          setCursorStyle({
   //             top: `${lastLetterRect.top}px`,
   //             left: `${lastLetterRect.right}px`,
   //          });
   //          return;
   //       }
   //       for (let i = 0; i < letterElementLength; i++) {
   //          letterElement[i].classList.remove('correct');
   //          letterElement[i].classList.remove('incorrect');
   //          if (i < latestWord.length) {
   //             setTotalTyped((prevTotalTyped) => prevTotalTyped - 1);
   //          }
   //       }
   //       setLatestWord('');
   //       const firstLetterRect = letterRects[currentWordIndex][0];
   //       // setLastLetterRect(latestWord.length > letterElementLength - 1 ? letterRects[currentWordIndex][letterElementLength - 1] : letterRects[currentWordIndex][Math.max(latestWord.length - 1, 0)]);
   //       setCursorStyle({
   //          top: `${firstLetterRect.top}px`,
   //          left: `${firstLetterRect.left}px`,
   //       });
   //       wordRefs[currentWordIndex].classList.remove('underline-text');
   //       return;
   //    }
   //    setLatestWord((prevLatestWord) => prevLatestWord + event.data);
   //    setInputBoxValue((prevInputBoxValue) => prevInputBoxValue + event.data);
   //    setTotalTyped((prevTotalTyped) => prevTotalTyped + 1);
   //    updateWord(latestWord + event.data, latestWord.length);
   //    setAccuracy(calculateAccuracy(totalTyped, totalErrors));
   //    setErrors(totalErrors);
   //    if (currentWordIndex === lastWordIndex) {
   //       if (latestWord.length >= letterElementLength) {
   //          const endTime = new Date().getTime();
   //          const currentWord = wordRefs[currentWordIndex].textContent;
   //          latestWord.trim();
   //          if (latestWord.length < currentWord.length || latestWord !== currentWord) {
   //             setTotalErrors((prevTotalErrors) => prevTotalErrors + 1);
   //             flashErrorDisplays();
   //             wordRefs[currentWordIndex].classList.add('underline-text');
   //          }
   //          refreshButtonRef.current.focus();
   //          endTest(endTime);
   //          return;
   //       }
   //    }
   // }

   function checkInput(event) {
      event = event.nativeEvent;
      if (startTime === 0) {
         startTimer();
      }
      const letterElement = letterElements[currentWordIndex];
      const letterElementLength = letterElement.length;
      if (event.data === ' ') {
         if (latestWord.length < letterElementLength || latestWord !== words[currentWordIndex].textContent) {
            flashErrorDisplays();
            words[currentWordIndex].classList.add('underline-text');
         } else if (!isMobile) {
            inputBoxRef.current.value = '';
         }
         setTypedWords((prevTypedWords) => [...prevTypedWords, latestWord]);
         setLatestWord('');
         setCurrentWordIndex((prevCurrentWordIndex) => prevCurrentWordIndex + 1);
      } else if (event.inputType === 'deleteContentBackward') {
         setBackspaceFlag(true);
         if (latestWord === '' && (words[currentWordIndex - 1].classList.contains('underline-text') || isMobile)) { // or inputBox.value.trim() !== ''
            setLatestWord(typedWords[currentWordIndex - 1]);
            words[currentWordIndex - 1].classList.remove('underline-text');
            setCurrentWordIndex((prevCurrentWordIndex) => Math.max(prevCurrentWordIndex - 1, 0));
            return;
         }
         setLatestWord((prevLatestWord) => prevLatestWord.slice(0, -1));
      } else if (event.inputType === 'deleteWordBackward') {
         if (latestWord === '' && (words[currentWordIndex - 1].classList.contains('underline-text') || isMobile)) { // or inputBox.value.trim() !== ''
            setLatestWord(typedWords[currentWordIndex - 1]);
            setCurrentWordIndex((prevCurrentWordIndex) => Math.max(prevCurrentWordIndex - 1, 0));
            return;
         }
         setLatestWord((prevLatestWord) => prevLatestWord.slice(0, -1));
      } else {
         setLatestWord((prevLatestWord) => prevLatestWord + event.data);
      }
   }
   useEffect(() => {
      if (letterRects[currentWordIndex] === undefined) return;
      if (latestWord === '') {
         setCursorStyle((prevCursorStyle) => ({
            left: `${letterRects[currentWordIndex][0].left}px`,
            top: `${letterRects[currentWordIndex][0].top}px`,
         }));
      } else {
         updateWord(latestWord, latestWord.length - 1, true);
      }
   }, [currentWordIndex]);

   useEffect(() => {
      if (latestWord === '' && !backspaceFlag) return;
      updateWord(latestWord, latestWord.length - 1, backspaceFlag);
   }, [latestWord]);

   function updateWord(latestWord, i, backspaceFlag = false) {
      const letterElement = letterElements[currentWordIndex];
      const letterElementLength = letterElement.length;
      if (letterElement[i] === undefined && !backspaceFlag) {
         letterElement[letterElementLength - 1].classList.remove('correct');
         letterElement[letterElementLength - 1].classList.add('incorrect');
         setTotalErrors((prevTotalErrors) => prevTotalErrors + 1);
         flashErrorDisplays();
      } else if (backspaceFlag) {
         if (i === letterElement.length - 1) {
            if (letterElement[i].textContent === latestWord[i]) {
               letterElement[i].classList.add('correct');
               letterElement[i].classList.remove('incorrect');
            } else {
               letterElement[i].classList.remove('correct');
               letterElement[i].classList.add('incorrect');
            }
         } else if (i < letterElement.length) {
            letterElement[i + 1].classList.remove('correct');
            letterElement[i + 1].classList.remove('incorrect');
         }
      } else if (latestWord[i] === letterElement[i].textContent) {
         letterElement[i].classList.remove('incorrect');
         letterElement[i].classList.add('correct');
         if (!backspaceFlag) {
            wpmDisplayRef.current.classList.remove('flash-out-green');
            void wpmDisplayRef.current.offsetWidth;
            wpmDisplayRef.current.classList.add('flash-out-green');
         }
      } else {
         letterElement[i].classList.remove('correct');
         letterElement[i].classList.add('incorrect');
         if (!backspaceFlag) {
            setTotalErrors((prevTotalErrors) => prevTotalErrors + 1);
            flashErrorDisplays();
         }
      }
      setBackspaceFlag(false);
      if (latestWord === '' && backspaceFlag) {
         setCursorStyle((prevCursorStyle) => ({
            left: `${lastLetterRect.left}px`,
            top: `${lastLetterRect.top}px`,
         }));
      } else {
         setLastLetterRect(latestWord.length > letterElementLength - 1 ? letterRects[currentWordIndex][letterElementLength - 1] : letterRects[currentWordIndex][Math.max(latestWord.length - 1, 0)]);
         if (latestWord.length === 1) {
            if (!lastLetterRect) return;
            setCursorStyle((prevCursorStyle) => ({
               left: `${lastLetterRect.right}px`,
               top: `${lastLetterRect.top}px`,
            }));
         }
      }
   }

   useEffect(() => {
      if (!lastLetterRect) return;
      setCursorStyle((prevCursorStyle) => ({
         left: `${lastLetterRect.right}px`,
         top: `${lastLetterRect.top}px`,
      }));
   }, [lastLetterRect]);

   const endTest = (endTime) => {
      const minutes = timer / 60;
      const grossWpm = Math.round(totalTyped / 5 / minutes);
      const netWpm = Math.round(grossWpm - totalErrors / minutes);
      const accuracy = calculateAccuracy(totalTyped, totalErrors);
      setWpm(grossWpm);
      setGrossWpm(grossWpm);
      setNetWpm(netWpm);
      setAccuracy(accuracy);
      setErrors(totalErrors);
      setIsInputDisabled(true);
      // inputBoxRef.current.blur();
      // refreshButtonRef.current.focus();
      // if (isHighlightingEnabled) {
      //    highlightWord();
      // }
   }


   const handleCustomTextModalOpen = () => {
      setIsCustomTextModalOpen(true);
   };

   const handleCustomTextModalClose = () => {
      setIsCustomTextModalOpen(false);
   };

   const handleRefreshButtonClick = () => {
      setTimer(0);
      setCurrentWordIndex(0);
      inputBoxRef.current.value = '';
      setWpm(0);
      setGrossWpm(0);
      setNetWpm(0);
      setAccuracy(0);
      setErrors(0);
      fetchRandomQuote();
      inputBoxRef.current.focus();

      for (let i = 0; i < words.length; i++) {
         words[i].classList.remove('underline-text');
         const letterElements = words[i].querySelectorAll('.letter');
         for (let j = 0; j < letterElements.length; j++) {
            letterElements[j].classList.remove('correct');
            letterElements[j].classList.remove('incorrect');
         }
      }
   };

   // useEffect(() => {
   //    if (wordRefs.length > 0) {
   //       wordRefs[0].classList.add('underline-text');
   //    }
   // }, [wordRefs]);



   const handleClearButtonClick = () => {
      // setInputValue('');
      // inputBoxRef.current.focus();
   };

   const countErrors = (inputValue, quote) => {
      let errors = 0;
      for (let i = 0; i < inputValue.length; i++) {
         if (inputValue[i] !== quote[i]) {
            errors++;
         }
      }
      return errors;
   };

   const calculateAccuracy = (inputValue, quote) => {
      let correctChars = 0;
      for (let i = 0; i < inputValue.length; i++) {
         if (inputValue[i] === quote[i]) {
            correctChars++;
         }
      }
      return (correctChars / quote.length) * 100;
   };

   const calculateGrossWpm = (inputValue, timer) => {
      const words = inputValue.trim().split(/\s+/);
      const minutes = timer / 60;
      const wpm = words.length / minutes;
      return Math.round(wpm);
   };

   const calculateNetWpm = (grossWpm, errors) => {
      return Math.round(grossWpm - errors / 5);
   };

   return (
      // <div className="App">
      <div className={`App body ${isDarkMode ? 'dark' : ''}`}>
         <div className="container">
            <h1 id="title"><span>Swift</span> <span>Type</span> ~ HauseMaster</h1>
            <div className="hamburger-menu">
               <div className="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
               </div>
               <div className="dropdown-menu">
                  <a href="#">
                     Username
                  </a>
                  <a href="./login.html">Login/Signup</a>
                  <a href="#">Account Settings</a>
                  <a href="#">Public Profile View</a>
               </div>
            </div>
            <div className="dark-light" onClick={handleModeToggle}>
               <i className='bx bx-moon moon'></i>
               <i className='bx bx-sun sun'></i>
            </div>
            <div className="github">
               <a href="https://github.com/HauseMasterZ/swift-type" target="_blank">
                  <i className='bx bxl-github'></i>
               </a>
            </div>
            {isLoading ? <div className="spinner-border" style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', position: 'absolute' }} role="status"></div> : ''}
            <p className="instruction">Type the following text:</p>
            <span className={`cursor${isCursorHidden ? ' hidden' : ''}`} style={cursorStyle}></span>
            <div id="quote" ref={quoteRef}>
               {quote && renderQuote()}
            </div>
            <input type="text" id="inputBox" disabled={isInputDisabled} onInput={checkInput} ref={inputBoxRef} />
            <div>
               <button className="button" ref={refreshButtonRef} id="refreshButton" onClick={handleRefreshButtonClick}>Refresh</button>
               <button className="button" id="repeatButton">Repeat</button>
               <button className="button" id="customButton" onClick={handleCustomTextModalOpen}>Custom Text</button>
               <button className="button" id="clearButton" onClick={handleClearButtonClick}>Clear Text</button>
            </div>
            <br />
            <div id="timerDisplay"></div>
            <div className="stats">
               <div className="stat">
                  <div ref={wpmDisplayRef} id="wpmDisplay">Current WPM: {wpm}</div>
               </div>
               <div className="stat">
                  <div ref={accuracyDisplayRef} id="accuracyDisplay">Accuracy: {accuracy}%</div>
               </div>
               <div className="stat">
                  <div ref={errorsDisplayRef} id="errorsDisplay">Errors: {errors}</div>
               </div>
            </div>
            <div className="stats">
               <div className="stat">
                  <div id="grossWPMDisplay">Gross WPM: {grossWpm}</div>
               </div>
               <div className="stat">
                  <div id="netWPMDisplay">Net WPM: {netWpm}</div>
               </div>
            </div>
            <div className="stats">
               <div className="stat" id="quote-label">
                  <label>
                     Quote Length:
                  </label>
               </div>
               <div className="radio-container">
                  <label>
                     <input type="radio" name="quoteLength" value="random" checked={quoteLength === 'random'} onChange={handleQuoteLengthChange} />
                     Random
                  </label>
                  <label>
                     <input type="radio" name="quoteLength" value="small" checked={quoteLength === 'small'} onChange={handleQuoteLengthChange} />
                     Small
                  </label>
                  <label>
                     <input type="radio" name="quoteLength" value="medium" checked={quoteLength === 'medium'} onChange={handleQuoteLengthChange} />
                     Medium
                  </label>
                  <label>
                     <input type="radio" name="quoteLength" value="large" checked={quoteLength === 'large'} onChange={handleQuoteLengthChange} />
                     Large
                  </label>
               </div>
            </div>
            <div className="stats">
               <div className="stat">
                  <div id="smoothCursor">
                     Smooth Caret:{' '}
                     <span className={isSmoothCursorOn ? 'correct' : 'incorrect'} onClick={handleSmoothCursorChange}>
                        {isSmoothCursorOn ? 'ON' : 'OFF'}
                     </span>
                  </div>
               </div>
               <div className="stat">
                  <div id="highlighted-words">
                     Highlighting:{' '}
                     <span className={isHighlightingOn ? 'correct' : 'incorrect'} onClick={handleHighlightingChange}>
                        {isHighlightingOn ? 'ON' : 'OFF'}
                     </span>
                  </div>
               </div>
               <div className="stat">
                  <div id="font-family">
                     <label htmlFor="font-select" id="font-select-label">
                        Font family:
                     </label>
                     <select id="font-select" value={selectedFont} onChange={handleFontChange}>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Oswald">Oswald</option>
                        <option value="Play">Play</option>
                        <option value="Ubuntu">Ubuntu</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="stats">
               <div className="stat">
                  <div id="categoryDisplay">{category}</div>

                  {isCapsLockOn ? <div id="capslockWarning">Caps Lock is ON</div> : ''}

               </div>
            </div>
            <div className="stats">
               <div className="stat">

                  <div id="customTextModal" className="modal">
                     <div className="modal-content">
                        <label htmlFor="customTextInput">
                           <h2>Enter Custom Text</h2>

                           <input type="text" id="customTextInput"
                              placeholder='Enter Custom Text'
                              onKeyDown={(event) => {
                                 if (event.key === 'Enter') {
                                    // applyCustomText(event);
                                 }
                              }} />
                        </label>
                        <button className="button" onClick={(event) => handleCustomTextModalClose(event)}>Apply</button>
                        <button className="button" onClick={(event) => handleCustomTextModalClose(event)}>Cancel</button>
                     </div>
                  </div>
               </div>
            </div>
            <div className="stats">
               <div className="stat">
                  <div id="resultImgParent">
                     <img id="resultImg" className="hidden" src="" alt="Result Speed Image" srcSet="" />
                  </div>
               </div>
            </div>

         </div>
         {/* <script async src="scripts/script.js"></script> */}
      </div >
   );
}

export default App;
