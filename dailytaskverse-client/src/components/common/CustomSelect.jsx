import { useState, useRef, useEffect, useCallback } from 'react';
import { MdCheck, MdUnfoldMore } from 'react-icons/md';
import './CustomSelect.css';

export default function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find(o => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isOpen]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex];
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const toggle = () => {
    setIsOpen(prev => {
      if (!prev) {
        const idx = options.findIndex(o => o.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return !prev;
    });
  };

  const selectOption = useCallback((opt) => {
    onChange(opt.value);
    setIsOpen(false);
  }, [onChange]);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        toggle();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          selectOption(options[focusedIndex]);
        }
        break;
      case 'Escape':
      case 'Tab':
        setIsOpen(false);
        break;
      default: {
        // Type-ahead: jump to first option starting with typed character
        const char = e.key.toLowerCase();
        if (char.length === 1) {
          const idx = options.findIndex(o => o.label.toLowerCase().startsWith(char));
          if (idx >= 0) setFocusedIndex(idx);
        }
      }
    }
  };

  return (
    <div className="custom-select" ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'open' : ''} ${value ? 'has-value' : ''}`}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-value">{displayLabel}</span>
        <MdUnfoldMore className="custom-select-arrow" />
      </button>

      {isOpen && (
        <ul
          className="custom-select-dropdown"
          ref={listRef}
          role="listbox"
          aria-activedescendant={focusedIndex >= 0 ? `option-${focusedIndex}` : undefined}
        >
          {options.map((opt, i) => (
            <li
              key={opt.value}
              id={`option-${i}`}
              role="option"
              aria-selected={opt.value === value}
              className={`custom-select-option ${opt.value === value ? 'selected' : ''} ${i === focusedIndex ? 'focused' : ''}`}
              onClick={() => selectOption(opt)}
              onMouseEnter={() => setFocusedIndex(i)}
            >
              <span className="option-label">{opt.label}</span>
              {opt.value === value && <MdCheck className="option-check" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
