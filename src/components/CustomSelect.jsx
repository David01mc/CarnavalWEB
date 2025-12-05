import React, { useState, useRef, useEffect } from 'react';
import '../styles/components/customSelect.css';

const CustomSelect = ({ options, value, onChange, placeholder, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="custom-select-container" ref={dropdownRef}>
            <div
                className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="select-value">
                    {icon && <i className={`fas ${icon} select-icon`}></i>}
                    <span>{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <i className={`fas fa-chevron-down arrow ${isOpen ? 'open' : ''}`}></i>
            </div>

            {isOpen && (
                <div className="custom-select-options">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`custom-option ${value === option.value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.icon && <i className={`fas ${option.icon} option-icon`} style={{ color: option.color }}></i>}
                            {option.label}
                            {value === option.value && <i className="fas fa-check check-icon"></i>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
