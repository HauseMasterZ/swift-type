import React, { useState } from "react";
import "../static/styles/styles.scss";

const Modal = ({ isOpen, onClose, onApply, modalInputRef }) => {
  const [inputValue, setInputValue] = useState("");

  const handleApply = () => {
    onApply(inputValue);
    setInputValue("");
    onClose();
  };

  const handleCancel = () => {
    setInputValue("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="stats" onClick={handleCancel}>
      <div className="stat">
        <div id="customTextModal" className="modal">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <label>
              <h2>Enter Custom Text</h2>
              <input
                type="text"
                id="customTextInput"
                ref={modalInputRef}
                placeholder="Enter Custom Text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApply();
                  }
                }}
              />
            </label>
            <button className="button" onClick={handleApply}>
              Apply
            </button>
            <button className="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
