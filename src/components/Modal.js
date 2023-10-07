import React, { useState } from 'react';
const Modal = ({ isOpen, onClose, onApply }) => {
    const [inputValue, setInputValue] = useState('');

    const handleApply = () => {
        onApply(inputValue);
        setInputValue('');
        onClose();
    };

    const handleCancel = () => {
        setInputValue('');
        onClose();
    };
    if (!isOpen) return null;

    return (
        <div className="stats">
            <div className="stat">
                <div id="customTextModal" className="modal">
                    <div className="modal-content">
                        <label>
                            <h2>Enter Custom Text</h2>
                            <input type="text" id="customTextInput" placeholder="Enter Custom Text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                        </label>
                        <button className="button" onClick={handleApply}>Apply</button>
                        <button className="button" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Modal;
