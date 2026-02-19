import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MdCheck, MdUnfoldMore } from 'react-icons/md';
import './CustomSelect.css';

export default function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find(o => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const renderOptionContent = (opt) => (
    <>
      {opt.dot && <span className="option-dot" style={{ background: opt.dot }} />}
      {opt.icon && <span className="option-icon">{opt.icon}</span>}
      <span className="option-label">{opt.label}</span>
    </>
  );

  // Calculate dropdown position relative to viewport
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = Math.min(options.length * 38 + 12, 220);
    const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [options.length]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        listRef.current && !listRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Recalculate position on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleReposition = () => updatePosition();
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen, updatePosition]);

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
        const char = e.key.toLowerCase();
        if (char.length === 1) {
          const idx = options.findIndex(o => o.label.toLowerCase().startsWith(char));
          if (idx >= 0) setFocusedIndex(idx);
        }
      }
    }
  };

  const dropdown = isOpen && createPortal(
    <ul
      className="custom-select-dropdown"
      ref={listRef}
      role="listbox"
      style={dropdownStyle}
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
          {renderOptionContent(opt)}
          {opt.value === value && <MdCheck className="option-check" />}
        </li>
      ))}
    </ul>,
    document.body
  );

  return (
    <div className="custom-select" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`custom-select-trigger ${isOpen ? 'open' : ''} ${value ? 'has-value' : ''}`}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select-value">
          {selectedOption?.dot && <span className="option-dot" style={{ background: selectedOption.dot }} />}
          {selectedOption?.icon && <span className="option-icon">{selectedOption.icon}</span>}
          {displayLabel}
        </span>
        <MdUnfoldMore className="custom-select-arrow" />
      </button>
      {dropdown}
    </div>
  );
}
