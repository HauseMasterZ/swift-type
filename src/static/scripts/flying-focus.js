const DURATION = 500;
// const win = window;
const doc = document;
const docElem = doc.documentElement;
let ringElem = null;
let movingId = 0;
let prevFocused = null;
let keyDownTime = 0;
const body = doc.body;
docElem.addEventListener('keydown', function (event) {
    // Show animation only upon Tab or Arrow keys press.
    // var key = event.key;
    // if (key !== 'Tab' && key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
    //     return;
    // }
    keyDownTime = Date.now();
}, false);

docElem.addEventListener('focus', (event) => {
    const target = event.target;
    if (target.id === 'flying-focus') {
        return;
    }

    const isFirstFocus = !ringElem;
    if (isFirstFocus) {
        initialize();
    }

    const offset = offsetOf(target);
    ringElem.style.left = `${offset.left}px`;
    ringElem.style.top = `${offset.top}px`;
    ringElem.style.width = `${target.offsetWidth}px`;
    ringElem.style.height = `${target.offsetHeight}px`;

    if (isFirstFocus || !isJustPressed()) {
        return;
    }

    onEnd();
    target.classList.add('flying-focus_target');
    ringElem.classList.add('flying-focus_visible');
    prevFocused = target;

}, true);

docElem.addEventListener('blur', () => {
    onEnd();
}, false);

function initialize() {
    ringElem = doc.createElement('div');
    ringElem.id = 'flying-focus';
    ringElem.style.transitionDuration = `${DURATION / 1000}s`;
    body.appendChild(ringElem);
}

function onEnd() {
    movingId = 0;
    if (prevFocused) {
        ringElem.classList.remove('flying-focus_visible');
        prevFocused.classList.remove('flying-focus_target');
        prevFocused = null;
    }
}

function isJustPressed() {
    return Date.now() - keyDownTime < 42;
}

function offsetOf(elem) {
    const rect = elem.getBoundingClientRect();
    const clientLeft = docElem.clientLeft || body.clientLeft;
    const clientTop = docElem.clientTop || body.clientTop;
    const scrollLeft = docElem.scrollLeft || body.scrollLeft;
    const scrollTop = docElem.scrollTop || body.scrollTop;
    const left = rect.left + scrollLeft - clientLeft;
    const top = rect.top + scrollTop - clientTop;
    return {
        top: top || 0,
        left: left || 0,
    };
}

export { onEnd };