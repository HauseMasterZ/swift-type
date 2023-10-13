import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import thresholds from '../static/data/thresholds.json';
import { Link } from 'react-router-dom';
import Modal from './Modal.js';
import Header from './Header';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../static/styles/styles.scss'
import { onEnd } from '../static/scripts/flying-focus.js';

function Home() {
   const [startTime, setStartTime] = useState(0);
   const [levels, setLevels] = useState([]);
   const [currentWordIndex, setCurrentWordIndex] = useState(0);
   const [typedWords, setTypedWords] = useState([]);
   const [clearButton, setClearButton] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const modalInputRef = useRef(null);
   const [lastLetterRect, setLastLetterRect] = useState(null);
   const [latestWord, setLatestWord] = useState("");
   const [lastWordIndex, setLastWordIndex] = useState(null);
   const [totalTyped, setTotalTyped] = useState(0);
   const [totalErrors, setTotalErrors] = useState(0);
   const [customText, setCustomText] = useState('');
   const [isMobile, setIsMobile] = useState(false);
   const [backspaceFlag, setBackspaceFlag] = useState(false);
   const [quoteLength, setQuoteLength] = useState('random');
   const [isCapsLockOn, setIsCapsLockOn] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [isCursorHidden, setIsCursorHidden] = useState(true);
   const [isInputDisabled, setIsInputDisabled] = useState(false);
   const [wpm, setWpm] = useState(0);
   const [grossWpm, setGrossWpm] = useState(0);
   const [netWpm, setNetWpm] = useState(0);
   const [cursorStyle, setCursorStyle] = useState({});
   const [resultImgSrc, setResultImgSrc] = useState('');
   const [isSmoothCursorOn, setIsSmoothCursorOn] = useState(true);
   const [selectedFont, setSelectedFont] = useState('Open Sans');
   const resultImgParentRef = useRef(null);
   const [displayRunning, setDisplayRunning] = useState(false);
   const [prefix, setPrefix] = useState('')
   const [number, setNumber] = useState(0)
   const [stars, setStars] = useState('')
   const highlightedWordsElementRef = useRef(null);
   const [seconds, setSeconds] = useState(0);
   const [isTimerRunning, setIsTimerRunning] = useState(false);
   const cursorRef = useRef(null);
   const [isDropDownMenuOpen, setIsDropDownMenuOpen] = useState(false);
   const dropdownMenuRef = useRef(null);
   const [quoteDivs, setQuoteDivs] = useState([]);
   const wpmDisplayRef = useRef(null);
   const refreshButtonRef = useRef(null);
   const [isHighlightingEnabled, setIsHighlightingEnabled] = useState(false);
   const [accuracy, setAccuracy] = useState(0);
   const [category, setCategory] = useState('');
   const categoryDisplayRef = useRef(null);
   const netWpmDisplayRef = useRef(null);
   const grossWpmDisplayRef = useRef(null);
   const inputBoxRef = useRef(null);
   const [user, setUser] = useState(null);
   const [username, setUsername] = useState('');
   const [totalRacesTaken, setTotalRacesTaken] = useState(0);
   const navigate = useNavigate();
   const [totalAvgAccuracy, setTotalAvgAccuracy] = useState(0);
   const [email, setEmail] = useState('');
   const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
   const [totalAverageWpm, setTotalAverageWpm] = useState(0);
   const errorsDisplayRef = useRef(null);
   const accuracyDisplayRef = useRef(null);
   const [words, setWordRefs] = useState([]);
   const [letterElements, setLetterRefs] = useState([]);
   const [letterRects, setLetterRects] = useState([]);
   const [quote, setQuote] = useState(null);
   const quoteRef = useRef(null);
   const quotableApiUrl = `https://api.quotable.io/quotes/random/`;
   const punctuationPattern = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;

   const fetchWithRetries = async (url) => {
      let data = null;
      let retries = 0;
      while (!data && retries < 3) {
         try {
            // const response = await Promise.race([
            //     fetch(url),
            //     new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            // ]);
            // if (!response.ok) {
            //     throw new Error('Network response was not OK');
            // }
            // data = await response.json();
            const response = await axios.get(url, { timeout: 5000 });
            if (!response.status === 200) {
               throw new Error('Network response was not OK');
            }
            data = response.data;
         } catch (error) {
            console.warn(`Failed to fetch quote ${error} (retry ${retries} of 3). Please wait...`);

            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
         }
      }
      return data;
   };

   const [isQuoteRenderReady, setIsQuoteRenderReady] = useState(false);

   const fetchRandomQuote = async () => {
      setIsLoading(true);
      setIsCursorHidden(true);
      setIsQuoteRenderReady(false);
      let minLength = 0;
      let maxLength = 0;
      if (quoteLength === 'small') {
         minLength = 1;
         maxLength = 100;
      } else if (quoteLength === 'medium') {
         minLength = 100;
         maxLength = 250;
      } else if (quoteLength === 'large') {
         minLength = 250;
         maxLength = 99999;
      }
      const url = minLength > 0 ? `${quotableApiUrl}?minLength=${minLength}&maxLength=${maxLength}` : quotableApiUrl;
      const response = await fetchWithRetries(url);
      const data = await response[0].content;
      setIsQuoteRenderReady(true);
      setIsLoading(false);
      setIsCursorHidden(false);
      setQuote(data);
      if (inputBoxRef.current) {
         inputBoxRef.current.focus();
      }
   }

   useEffect(() => {
      if (!isQuoteRenderReady) return;
      renderQuote();
   }, [isQuoteRenderReady]);

   // const renderQuote = () => {
   //    const words = quote.split(' ');
   //    return (
   //       words.map((word, wordIndex) => {
   //          return (
   //             <div key={wordIndex} className="word">
   //                {word.split('').map((letter, letterIndex) => {
   //                   return (
   //                      <div key={letterIndex} className="letter">
   //                         {letter}
   //                      </div>
   //                   );
   //                })}
   //             </div>
   //          );
   //       })
   //    );
   // };

   const renderQuote = () => {
      const words = quote.split(" ");
      const divs = words.map((word, wordIndex) => {
         return (
            <div key={wordIndex} className="word">
               {word.split("").map((letter, letterIndex) => {
                  return (
                     <div key={letterIndex} className="letter">
                        {letter}
                     </div>
                  );
               })}
            </div>
         );
      });
      setQuoteDivs(divs);
   };

   const handleQuoteLengthChange = (event) => {
      setQuoteLength(event.target.value);
   };

   function flashErrorDisplays() {
      errorsDisplayRef.current.classList.remove('flash-out-red');
      accuracyDisplayRef.current.classList.remove('flash-out-red');
      void accuracyDisplayRef.current.offsetWidth; // Trigger a reflow to restart the animation
      void errorsDisplayRef.current.offsetWidth; // Trigger a reflow to restart the animation
      errorsDisplayRef.current.classList.add('flash-out-red');
      accuracyDisplayRef.current.classList.add('flash-out-red');
   }

   function checkInput(event) {
      event = event.nativeEvent;
      if (!isTimerRunning) {
         setStartTime(new Date().getTime());
         setIsTimerRunning(true);
         isSmoothCursorOn ? cursorRef.current.style.transition = 'left 0.1s linear, top 0.25s ease-out' : cursorRef.current.style.transition = 'top 0.25s ease-out';
      }
      const letterElement = letterElements[currentWordIndex];
      const letterElementLength = letterElement.length;
      if (event.data === ' ') {
         if (latestWord.length < letterElementLength || latestWord !== words[currentWordIndex].textContent) {
            flashErrorDisplays();
            setTotalErrors((prevTotalErrors) => prevTotalErrors + 1);
            words[currentWordIndex].classList.add('underline-text');
         } else if (!isMobile) {
            inputBoxRef.current.value = '';
         }
         if (currentWordIndex === lastWordIndex) {
            const endTime = new Date().getTime();
            refreshButtonRef.current.focus();
            endTest(endTime);
            return;
         }
         setTypedWords((prevTypedWords) => {
            const newTypedWords = [...prevTypedWords];
            newTypedWords[currentWordIndex] = latestWord;
            return newTypedWords;
         });
         if (isHighlightingEnabled) {
            highlightWord();
         }

         setLatestWord('');
         setTotalTyped((prevTotalTyped) => prevTotalTyped + 1);
         setCurrentWordIndex((prevCurrentWordIndex) => prevCurrentWordIndex + 1);
      } else if (event.inputType === 'deleteContentBackward') {
         setBackspaceFlag(true);
         setTotalTyped((prevTotalTyped) => prevTotalTyped - 1);
         if (latestWord === '' && (words[currentWordIndex - 1].classList.contains('underline-text') || isMobile)) { // or inputBox.value.trim() !== ''
            if (isHighlightingEnabled) {
               highlightWord(true);
            }
            setLatestWord(typedWords[currentWordIndex - 1]);
            words[currentWordIndex - 1].classList.remove('underline-text');
            setCurrentWordIndex((prevCurrentWordIndex) => Math.max(prevCurrentWordIndex - 1, 0));
            return;
         }
         setLatestWord((prevLatestWord) => prevLatestWord.slice(0, -1));
      } else if (event.inputType === 'deleteWordBackward') {
         let letterElementLength = letterElements[currentWordIndex].length;
         let letterElement = letterElements[currentWordIndex];
         if (latestWord === '' && (words[currentWordIndex - 1].classList.contains('underline-text') || isMobile)) { // or inputBox.value.trim() !== ''
            words[currentWordIndex - 1].classList.remove('underline-text');
            setCurrentWordIndex((prevCurrentWordIndex) => Math.max(prevCurrentWordIndex - 1, 0));
            if (isHighlightingEnabled) {
               highlightWord(true);
            }
            letterElement = letterElements[currentWordIndex - 1];
            letterElementLength = letterElement.length;

            if (letterElement[letterElementLength - 1].textContent.match(punctuationPattern) && typedWords[currentWordIndex - 1].match(punctuationPattern)) {
               const lastWord = inputBoxRef.current.value.trim().split(' ').pop();
               setTotalTyped((prevTotalTyped) => prevTotalTyped - latestWord.length + lastWord.length);
               setLatestWord(lastWord);
               const latestWordLength = lastWord.length;
               let index = letterElementLength - 1;
               while (index >= latestWordLength) {
                  letterElement[index].classList.remove('correct');
                  letterElement[index].classList.remove('incorrect');
                  index--;
               }
               return;
            }
         } else if (latestWord.match(punctuationPattern)) {
            const lastWord = inputBoxRef.current.value.trim().split(' ').pop();
            setTotalTyped((prevTotalTyped) => prevTotalTyped - latestWord.length + lastWord.length);
            setLatestWord(lastWord);
            const latestWordLength = lastWord.length;
            let index = letterElementLength - 1;
            while (index >= latestWordLength) {
               letterElement[index].classList.remove('correct');
               letterElement[index].classList.remove('incorrect');
               index--;
            }
            if (latestWordLength >= letterElementLength) {
               lastLetterRect = letterRects[currentWordIndex - 1][letterElementLength - 1];
               // updateWord(latestWord, latestWordLength - 1, true);
            } else {
               lastLetterRect = letterRects[currentWordIndex - 1][latestWordLength - 1];
            }
            return;
         }
         for (let i = 0; i < letterElementLength; i++) {
            letterElement[i].classList.remove('correct');
            letterElement[i].classList.remove('incorrect');
            if (i < latestWord.length) {
               setTotalTyped((prevTotalTyped) => prevTotalTyped - 1);
            }
         }
         setCursorStyle((prevCursorStyle) => ({
            left: `${letterRects[currentWordIndex][0].left}px`,
            top: `${letterRects[currentWordIndex][0].top}px`,
         }));
         setLatestWord('');

         // setCurrentWordIndex((prevCurrentWordIndex) => Math.max(prevCurrentWordIndex - 1, 0));

      } else {
         setLatestWord((prevLatestWord) => prevLatestWord + event.data);
         setTotalTyped((prevTotalTyped) => prevTotalTyped + 1);
      }
   }

   const handleSmoothCursorChange = () => {
      !isSmoothCursorOn ? cursorRef.current.style.transition = 'left 0.1s linear, top 0.25s ease-out' : cursorRef.current.style.transition = 'top 0.25s ease-out';
      setIsSmoothCursorOn(!isSmoothCursorOn);
      inputBoxRef.current.focus();
   };

   const handleHighlightingChange = () => {
      setIsHighlightingEnabled(!isHighlightingEnabled);
   };

   const handleFontChange = event => {
      setSelectedFont(event.target.value);
   };

   const lastLetterRectRef = useRef(null);
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

      if (latestWord === '' && backspaceFlag) {
         setCursorStyle((prevCursorStyle) => ({
            left: `${lastLetterRect.left}px`,
            top: `${lastLetterRect.top}px`,
         }));
      } else {
         if (lastLetterRect !== letterRects[currentWordIndex][Math.max(latestWord.length - 1, 0)]) {
            setLastLetterRect(latestWord.length > letterElementLength - 1 ? letterRects[currentWordIndex][letterElementLength - 1] : letterRects[currentWordIndex][Math.max(latestWord.length - 1, 0)]);
         } else {
            setLastLetterRect(latestWord.length > letterElementLength - 1 ? letterRects[currentWordIndex][letterElementLength - 1] : letterRects[currentWordIndex][Math.max(latestWord.length - 1, 0)]);
            lastLetterRectRef.current = letterRects[currentWordIndex][Math.max(latestWord.length - 1, 0)];
         }
         if (latestWord.length === 1) {
            if (!lastLetterRect) {
               setBackspaceFlag(false);
               return;
            }
            setCursorStyle((prevCursorStyle) => ({
               left: `${lastLetterRect.right}px`,
               top: `${lastLetterRect.top}px`,
            }));
         }
      }
      setBackspaceFlag(false);
   }

   const endTest = (endTime) => {
      setIsTimerRunning(false);
      setTypedWords((prevTypedWords) => [...prevTypedWords, latestWord]);
      setIsInputDisabled(true);
      const netWPM = calculateNetWPM(endTime);
      setWpm(calculateWPM(endTime));
      setGrossWpm(calculateGrossWPM(endTime));
      setNetWpm(calculateNetWPM(endTime));
      const accuracy = calculateAccuracy(totalTyped, totalErrors);
      setAccuracy(accuracy);
      let level = levels[0];
      for (let i = 0; i < levels.length; i++) {
         if (netWPM >= levels[i].threshold) {
            level = levels[i];
         } else {
            break;
         }
      }
      setResultImgSrc(level.imgSrc);
      document.body.style.backgroundColor = level.backgroundColor;
      resultImgParentRef.current.classList.remove('hidden');
      resultImgParentRef.current.classList.add('slide-in');
      setPrefix(level.title);
      const randomNumber = new Function(`return ${level.speed}`)();
      setNumber(Math.round(randomNumber));
      setStars(level.stars);
      setDisplayRunning(true);
      netWpmDisplayRef.current.classList.add('highlight');
      grossWpmDisplayRef.current.classList.add('highlight');
      categoryDisplayRef.current.classList.add('highlight-category');
      if (customText !== '' || !user) return;

      const userRef = doc(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME, user.uid);
      const increment = totalRacesTaken + 1;
      const newAccuracy = calculateLocalAccuracy(accuracy, totalRacesTaken, totalAvgAccuracy);
      const newWpm = calculateLocalWpm(netWPM, totalRacesTaken, totalAverageWpm);
      updateDoc(userRef, {
         [process.env.REACT_APP_TOTAL_RACES_TAKEN_KEY]: increment,
         [process.env.REACT_APP_TOTAL_AVG_ACCURACY_KEY]: newAccuracy,
         [process.env.REACT_APP_TOTAL_AVG_WPM_KEY]: newWpm
      })
         .catch((error) => {
            console.error('Error updating database values:', error);
         });
      setTotalRacesTaken(increment);
      setTotalAverageWpm(newWpm);
      setTotalAvgAccuracy(newAccuracy);
   }

   const calculateLocalAccuracy = (newAccuracy, totalRacesTaken, totalAvgAccuracy) => {
      // Calculate the new average accuracy
      const newTotalAccuracy = (totalAvgAccuracy * totalRacesTaken) + newAccuracy;
      const newAvgAccuracy = newTotalAccuracy / (totalRacesTaken + 1);
      return newAvgAccuracy;
   };

   const calculateLocalWpm = (newWpm, totalRacesTaken, totalAvgWpm) => {
      // Calculate the new average WPM
      const newTotalWpm = (totalAvgWpm * totalRacesTaken) + newWpm;
      const newAvgWpm = newTotalWpm / (totalRacesTaken + 1);
      return newAvgWpm;
   };

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

   const handleRefreshButtonClick = (event) => {
      if (event !== undefined) {
         createRipple(event);
      }
      setSeconds(0);
      setIsTimerRunning(false);
      setCurrentWordIndex(0);
      setTypedWords([]);
      setLatestWord('');
      setResultImgSrc('');
      resultImgParentRef.current.classList.add('hidden');
      resultImgParentRef.current.classList.remove('slide-in');
      netWpmDisplayRef.current.classList.remove('highlight');
      grossWpmDisplayRef.current.classList.remove('highlight');
      categoryDisplayRef.current.classList.remove('highlight-category');
      setLastWordIndex(null);
      setTotalTyped(0);
      setTotalErrors(0);
      setWordRefs([]);
      setLetterRefs([]);
      setLetterRects([]);
      setCategory('');
      setDisplayRunning(false);
      setIsInputDisabled(false);
      inputBoxRef.current.value = '';
      setWpm(0);
      setGrossWpm(0);
      setNetWpm(0);
      setClearButton(false);
      setAccuracy(0);
      fetchRandomQuote();
      onEnd();
      document.body.classList.contains("dark") ? document.body.style.backgroundColor = '#18191A' : document.body.style.backgroundColor = '#E4E9F7';

      for (let i = 0; i < words.length; i++) {
         words[i].classList.remove('underline-text');
         const letterElements = words[i].querySelectorAll('.letter');
         for (let j = 0; j < letterElements.length; j++) {
            letterElements[j].classList.remove('correct');
            letterElements[j].classList.remove('incorrect');
         }
      }
   };

   function repeatTest() {
      setSeconds(0);
      setCurrentWordIndex(0);
      setTypedWords([]);
      setLatestWord('');
      setResultImgSrc('');
      resultImgParentRef.current.classList.add('hidden');
      resultImgParentRef.current.classList.remove('slide-in');
      netWpmDisplayRef.current.classList.remove('highlight');
      grossWpmDisplayRef.current.classList.remove('highlight');
      categoryDisplayRef.current.classList.remove('highlight-category');
      setLastWordIndex(null);
      setTotalTyped(0);
      setTotalErrors(0);
      setCategory('');
      setDisplayRunning(false);
      setIsInputDisabled(false);
      inputBoxRef.current.value = '';
      setWpm(0);
      setGrossWpm(0);
      setNetWpm(0);
      setAccuracy(0);
      document.body.classList.contains("dark") ? document.body.style.backgroundColor = '#18191A' : document.body.style.backgroundColor = '#E4E9F7';
      setCursorStyle({ left: `${letterRects[0][0].left}px`, top: `${letterRects[0][0].top}px` });
      for (let i = 0; i < words.length; i++) {
         words[i].classList.remove('underline-text');
         const letterElements = words[i].querySelectorAll('.letter');
         for (let j = 0; j < letterElements.length; j++) {
            letterElements[j].classList.remove('correct');
            letterElements[j].classList.remove('incorrect');
         }
      }
      inputBoxRef.current.focus();
   }
   function calculateWPM(endTime) {
      const minutes = (endTime - startTime) / 60000;
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
      const minutes = (endTime - startTime) / 60000;
      const netWPM = Math.round(netTyped / minutes);
      return netWPM;
   }

   function calculateNetWPM(endTime) {
      let errorWordCnt = 0;
      words.forEach((word, index) => {
         if (word.classList.contains("underline-text")) {
            errorWordCnt++;
         }
      });
      setTotalErrors(Math.max(errorWordCnt, totalErrors));
      const netTyped = currentWordIndex - errorWordCnt + 1;
      const minutes = (endTime - startTime) / 60000;
      const netWPM = Math.round(netTyped / minutes);
      return Math.max(netWPM, 0);
   }

   function calculateAccuracy(totalTyped, totalErrors) {
      const accuracy = Math.round((totalTyped - totalErrors) / totalTyped * 100);
      return Math.max(accuracy, 0);
   }

   // async function loadImages() {
   //    for (const level of levels) {
   //       const img = new Image();
   //       img.src = level.imgSrc[0];
   //       try {
   //          await new Promise((resolve, reject) => {
   //             img.onload = resolve;
   //             img.onerror = () => {
   //                img.src = level.imgSrc[1];
   //                img.onload = resolve;
   //                img.onerror = reject;
   //                console.warn(`Failed to load image from CDN. Using local image instead.`);
   //             };
   //          });
   //          level.imgSrc = img;
   //       } catch (error) {
   //          console.error(`Failed to load image for level ${level.title}: ${error}`);
   //       }
   //    }
   // }

   const loadImages = () => {
      // Check if images are cached

      if (localStorage.getItem('cachedImages') !== 'true') {
         // Cache the images in localStorage
         levels.forEach((image) => {
            if (!Array.isArray(image.imgSrc)) return;
            const img = new Image();
            img.src = image.imgSrc[0][0];
            const src = img.src;
            try {
               img.onload = () => {
                  localStorage.setItem(src.split('/').pop(), img.src);
               };
               img.onerror = () => {
                  img.src = image.imgSrc[1][1];
                  img.onload = () => {
                     localStorage.setItem(src.split('/').pop(), img.src);
                  };
               };
               image.imgSrc = localStorage.getItem(src.split('/').pop());
            } catch (error) {
               console.error(`Failed to load image for level ${image.title}: ${error}`);
            }
            // img.onload = () => {
            //    localStorage.setItem(image, img.src);
            // };
         });
         localStorage.setItem('cachedImages', "true");
      }
   };

   function handleLogoutClick() {
      auth.signOut().then(() => {
         // Sign-out successful.
         setUser(null);
         navigate('/');
      }).catch((error) => {
         // An error happened.
         console.log(error);
      });
   }

   function highlightWord(reverse = false) {
      if (reverse && currentWordIndex > 0) {
         words[currentWordIndex + 1].classList.remove('active-word');
         words[currentWordIndex + 2].classList.remove('subactive-word');
         words[currentWordIndex + 1].classList.add('subactive-word');
         words[currentWordIndex + 2].classList.add('inactive-word');
      } else if (!reverse) {
         words[currentWordIndex + 1].classList.remove('subactive-word');
         words[currentWordIndex + 1].classList.add('active-word');
         if (currentWordIndex < lastWordIndex - 1) {
            words[currentWordIndex + 2].classList.remove('inactive-word');
            words[currentWordIndex + 2].classList.add('subactive-word');
         }
      }
   }

   function handleKeyDown(event) {
      setIsCapsLockOn(event.getModifierState && event.getModifierState("CapsLock"));
   }

   const [windowDimensions, setWindowDimensions] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
   });

   const closeModal = () => {
      setIsModalOpen(false);
   };

   const handleApply = (inputValue) => {
      if (inputValue.trim() === '') return;
      setCustomText(inputValue);
      setClearButton(true);
   };

   const openModal = () => {
      setIsModalOpen(true);
   };

   function updateCursorPosition() {
      const newLetterRects = [];

      const quoteDiv = document.getElementById('quote');
      const wordElements = Array.from(quoteDiv.children);

      wordElements.forEach((word) => {
         const letterElements = Array.from(word.children);
         const lettersRects = [];

         letterElements.forEach((letter) => {
            lettersRects.push(letter.getClientRects());
         });

         newLetterRects.push(lettersRects);
      });
      if (newLetterRects[currentWordIndex] === undefined) return;
      setLetterRects(newLetterRects);
      const letterRect = newLetterRects[currentWordIndex][0][0];

      setCursorStyle({
         left: `${latestWord ? letterRect.right : letterRect.left}px`,
         top: `${letterRect.top}px`,
      });
   }

   const handleClearButtonClick = () => {
      setCustomText('');
      setClearButton(false);
      handleRefreshButtonClick();
      onEnd();
      inputBoxRef.current.focus();
   };

   useEffect(() => {
      if (modalInputRef.current === null && isModalOpen) return;
      if (isModalOpen) {
         modalInputRef.current.focus();
      } else {
         inputBoxRef.current.focus();
         onEnd();
      }
   }, [isModalOpen]);

   useEffect(() => {
      if (customText === '') return;
      setQuote(customText);
      setWordRefs([]);
      setLetterRefs([]);
      setLetterRects([]);
      setIsLoading(false);
      inputBoxRef.current.focus();
      setIsCursorHidden(false);
      repeatTest();
   }, [customText]);

   useEffect(() => {
      if (levels.length === 0) return;
      loadImages();
   }, [levels]);

   // useEffect(() => {
   //     const handleBodyClick = (event) => {
   //         if (!dropdownMenuRef.current.contains(event.target)) {
   //             setisDropdownMenuOpen(false);
   //         }
   //     };
   //     document.body.addEventListener('click', handleBodyClick);
   //     return () => {
   //         document.body.removeEventListener('click', handleBodyClick);
   //     };
   // }, []);

   useEffect(() => {
      if (quoteRef.current) {
         const quoteDiv = document.getElementById('quote');
         if (quoteDiv) {
            const children = Array.from(quoteDiv.children);
            setLastWordIndex(children.length - 1);
            setWordRefs(children);
         }
         const wordElements = quoteRef.current.querySelectorAll('.word');
         wordElements.forEach((wordElement) => {
            setTypedWords((prevTypedWords) => [...prevTypedWords, '']);
            const letters = wordElement.querySelectorAll('.letter');
            let newLetterRefs = [];
            let newLetterRects = [];
            letters.forEach((letterElement) => {
               const rect = letterElement.getBoundingClientRect();
               newLetterRefs.push(letterElement);
               newLetterRects.push(rect);
            });
            letterElements.push(newLetterRefs);
            // setLetterRefs(newLetterRefs);
            letterRects.push(newLetterRects);
            // setLetterRects(newLetterRects);
         });
         if (letterRects[0]) {
            setCursorStyle({ top: letterRects[0][0].top, left: letterRects[0][0].left });
         }

      }
   }, [quoteDivs]);


   useEffect(() => {
      let interval;

      if (isTimerRunning) {
         interval = setInterval(() => {
            setSeconds((prevSeconds) => prevSeconds + 0.5);
         }, 500);
      }

      return () => {
         clearInterval(interval);
      };
   }, [isTimerRunning]);

   useEffect(() => {
      if (!lastLetterRect) return;
      setCursorStyle((prevCursorStyle) => ({
         left: `${lastLetterRect.right}px`,
         top: `${lastLetterRect.top}px`,
      }));
   }, [lastLetterRect, lastLetterRectRef.current]);


   useEffect(() => {
      if (!displayRunning) return;
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

         setCategory(`${prefix} ${currentValue}kph ${stars}`);
      }

      const speedInterval = setInterval(updateDisplay, 1000 / number);

      return () => {
         clearInterval(speedInterval);
      };
   }, [displayRunning]);

   useEffect(() => {
      handleRefreshButtonClick();
   }, [quoteLength]);

   useEffect(() => {
      if (words.length === 0) return;
      for (let i = currentWordIndex; i <= lastWordIndex; i++) {
         isHighlightingEnabled ? words[i].classList.add('inactive-word') : words[i].classList.remove('inactive-word', 'active-word', 'subactive-word');
      }
      if (isHighlightingEnabled && currentWordIndex < lastWordIndex) {
         words[currentWordIndex].classList.remove('inactive-word');
         words[currentWordIndex + 1].classList.remove('inactive-word');
         words[currentWordIndex].classList.add('active-word');
         words[currentWordIndex + 1].classList.add('subactive-word');
      }
      inputBoxRef.current.focus();
   }, [isHighlightingEnabled]);

   useEffect(() => {
      document.body.style.fontFamily = selectedFont;
      inputBoxRef.current.focus();
      updateCursorPosition();

   }, [selectedFont]);

   useEffect(() => {
      if (letterRects[currentWordIndex] === undefined || backspaceFlag) return;
      if (latestWord === '') {
         setCursorStyle((prevCursorStyle) => ({
            left: `${letterRects[currentWordIndex][0].left}px`,
            top: `${letterRects[currentWordIndex][0].top}px`,
         }));
      } else {
         updateWord(latestWord, latestWord.length - 1, backspaceFlag);
      }
   }, [currentWordIndex]);

   useEffect(() => {
      if (latestWord === '' && !backspaceFlag) return;
      updateWord(latestWord, latestWord.length - 1, backspaceFlag);
      if (currentWordIndex === lastWordIndex) {
         if (latestWord.length >= letterElements[currentWordIndex].length) {
            const endTime = new Date().getTime();
            const currentWord = words[currentWordIndex].textContent;
            latestWord.trim()
            if (latestWord.length < currentWord.length || latestWord !== currentWord) {
               setTotalErrors((prevTotalErrors) => prevTotalErrors + 1);
               flashErrorDisplays();
               words[currentWordIndex].classList.add('underline-text');
            }
            refreshButtonRef.current.focus();
            endTest(endTime);
            return;
         }
      }
   }, [latestWord]);

   useEffect(() => {
      // Set up an observer to listen for authentication state changes
      localStorage.setItem('cachedImages', "false");

      const unsubscribe = auth.onAuthStateChanged((user) => {
         if (user) {
            // User is signed in.
            setUser(user);
            setEmail(user.email);

            // Fetch additional user information from your database
            const userRef = doc(db, process.env.REACT_APP_FIREBASE_COLLECTION_NAME, user.uid);
            getDoc(userRef).then((doc) => {
               if (doc.exists()) {
                  const data = doc.data();
                  setUsername(data[process.env.REACT_APP_USERNAME_KEY]);
                  setProfilePhotoUrl(data[process.env.REACT_APP_PROFILE_PHOTO_URL_KEY]);
                  setTotalRacesTaken(data[process.env.REACT_APP_TOTAL_RACES_TAKEN_KEY]);
                  setTotalAvgAccuracy(data[process.env.REACT_APP_TOTAL_AVG_ACCURACY_KEY]);
                  setTotalAverageWpm(data[process.env.REACT_APP_TOTAL_AVG_WPM_KEY]);
               } else {
                  console.log('No such document!');
               }
            }).catch((error) => {
               console.log('Error getting document:', error);
            });
         } else {
            // User is signed out.
            setUser(null);
            setUsername('');
            setEmail('');
            setProfilePhotoUrl('');
            setTotalRacesTaken(0);
            setTotalAvgAccuracy(0);
         }
      });

      function handleResize() {
         setWindowDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
         });
         updateCursorPosition();
      }
      const userAgent = navigator.userAgent.toLowerCase();
      setIsMobile(userAgent.includes("mobile"));
      window.addEventListener('resize', handleResize);
      setLevels(thresholds.thresholds);
      document.body.addEventListener('keydown', handleKeyDown);
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button) => {
         button.addEventListener('click', createRipple);
      });

      fetchRandomQuote();
      return () => {
         buttons.forEach((button) => {
            button.removeEventListener('click', createRipple);
            window.removeEventListener('resize', handleResize);
            document.body.removeEventListener('keydown', handleKeyDown);
         });
         unsubscribe();
      };
   }, []);

   return (
      <div className={`App`}>
         <div className="container">
            <Header />
            <div className="hamburger-menu">
               <div className="hamburger-icon" onClick={(e) => (setIsDropDownMenuOpen(!isDropDownMenuOpen))}>
                  <span></span>
                  <span></span>
                  <span></span>
               </div>
               {isDropDownMenuOpen ? (<div className="dropdown-menu show" ref={dropdownMenuRef}>

                  {user ? (
                     <>
                        <Link href="#" to="/profile">
                           <img src={profilePhotoUrl} alt="picture" className='dropdown-avatar' />
                           {username}
                        </Link>
                        <Link href="#" to="/settings" >Account Settings</Link>
                        <Link href="#" onClick={handleLogoutClick}>Logout</Link>
                     </>
                  ) : (
                     <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Signup</Link>

                     </>
                  )}
               </div>) : null}

            </div>
            {isLoading ? <div className="spinner-border" style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', display: 'block' }} role="status"></div> : ''}
            <p className="instruction">Type the following text:</p>
            {isCursorHidden ? '' : <span className={`cursor`} ref={cursorRef} style={cursorStyle}></span>}
            <div id="quote" ref={quoteRef}>
               {quoteDivs}
            </div>
            <input type="text" id="inputBox" disabled={isInputDisabled} onInput={checkInput} ref={inputBoxRef} autoFocus />
            <div>
               <button className="button" ref={refreshButtonRef} id="refreshButton" onClick={handleRefreshButtonClick}>Refresh</button>
               <button className="button" id="repeatButton" onClick={repeatTest}>Repeat</button>
               <button className="button" id="customButton" onClick={openModal}>Custom Text</button>
               {clearButton ? <button className="button" id="clearButton" onClick={handleClearButtonClick}>Clear Text</button> : ''}
            </div>
            <br />
            <div id="timerDisplay">Time: {seconds.toFixed(1)}s</div>
            <div className="stats">
               <div className="stat">
                  <div ref={wpmDisplayRef} id="wpmDisplay">Current WPM: {wpm}</div>
               </div>
               <div className="stat">
                  <div ref={accuracyDisplayRef} id="accuracyDisplay">Accuracy: {accuracy}%</div>
               </div>
               <div className="stat">
                  <div ref={errorsDisplayRef} id="errorsDisplay">Errors: {totalErrors}</div>
               </div>
            </div>
            <div className="stats">
               <div className="stat">
                  <div id="grossWPMDisplay" ref={grossWpmDisplayRef} >Gross WPM: {grossWpm}</div>
               </div>
               <div className="stat">
                  <div id="netWPMDisplay" ref={netWpmDisplayRef} >Net WPM: {netWpm}</div>
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
                  <div id="smoothCursor" onClick={handleSmoothCursorChange}>
                     Smooth Caret:{' '}
                     <span className={isSmoothCursorOn ? 'correct' : 'incorrect'} onClick={handleSmoothCursorChange}>
                        {isSmoothCursorOn ? 'ON' : 'OFF'}
                     </span>
                  </div>
               </div>
               <div className="stat">
                  <div id="highlighted-words" ref={highlightedWordsElementRef} onClick={handleHighlightingChange} >
                     Highlighting:{' '}
                     <span className={isHighlightingEnabled ? 'correct' : 'incorrect'} onClick={handleHighlightingChange}>
                        {isHighlightingEnabled ? 'ON' : 'OFF'}
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
                  <div id="categoryDisplay" ref={categoryDisplayRef}>{category}</div>
                  {isCapsLockOn ? <div id="capslockWarning">Caps Lock is ON</div> : null}
               </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} onApply={handleApply} modalInputRef={modalInputRef} />

            <div className="stats">
               <div className="stat">
                  <div id="resultImgParent">
                     <img id="resultImg" className="hidden" src={resultImgSrc} alt="Result Speed Image" srcSet="" ref={resultImgParentRef} />
                  </div>
               </div>
            </div>

         </div>
         {/* <script async src="scripts/script.js"></script> */}
      </div >
   );
}

export default Home;
