import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

const DatePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select date", 
  disabled = false,
  className = "",
  format = "YYYY-MM-DD"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const containerRef = useRef(null);
  const calendarRef = useRef(null);
  const [position, setPosition] = useState({ left: 0, right: 'auto' });

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate calendar position
  useLayoutEffect(() => {
    if (isOpen && containerRef.current && calendarRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const calendarRect = calendarRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Reset position
      setPosition({ left: 0, right: 'auto' });

      // Check if calendar overflows to the right
      if (containerRect.left + calendarRect.width > viewportWidth) {
        setPosition({ 
          left: 'auto', 
          right: 0 
        });
      } else {
        setPosition({ 
          left: 0, 
          right: 'auto' 
        });
      }
    }
  }, [isOpen]);

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsOpen(false);
    if (onChange) {
      onChange(formatDate(date));
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date && 
           date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return selectedDate && 
           date &&
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`position-relative ${className}`} ref={containerRef}>
      <div className="input-group">
        <input
          type="text"
          className={`form-control ${disabled ? 'disabled' : ''}`}
          value={formatDate(selectedDate)}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div 
          ref={calendarRef}
          className="card position-absolute shadow-lg border"
          style={{ 
            top: '100%', 
            zIndex: 1050,
            minWidth: '280px',
            maxWidth: 'min(350px, 90vw)', // Prevent overflow on small screens
            ...position // Dynamic positioning
          }}
        >
          <div className="card-header bg-primary text-white p-2">
            <div className="d-flex justify-content-between align-items-center">
              <button
                className="btn btn-sm btn-outline-light border-0"
                onClick={handlePrevMonth}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
              <h6 className="mb-0">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h6>
              <button
                className="btn btn-sm btn-outline-light border-0"
                onClick={handleNextMonth}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div className="card-body p-2">
            <table className="table table-borderless mb-0">
              <thead>
                <tr>
                  {weekDays.map(day => (
                    <th key={day} className="text-center p-1" style={{ width: '14.28%' }}>
                      <small className="text-muted fw-bold">{day}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const days = getDaysInMonth(currentDate);
                  const weeks = [];
                  
                  for (let i = 0; i < days.length; i += 7) {
                    weeks.push(days.slice(i, i + 7));
                  }
                  
                  return weeks.map((week, weekIndex) => (
                    <tr key={weekIndex}>
                      {week.map((date, dayIndex) => (
                        <td key={dayIndex} className="text-center p-1">
                          {date ? (
                            <button
                              className={`btn border-0 d-flex align-items-center justify-content-center ${
                                isSelected(date) 
                                  ? 'btn-primary' 
                                  : isToday(date) 
                                    ? 'btn-outline-primary' 
                                    : 'btn-light'
                              }`}
                              onClick={() => handleDateClick(date)}
                              style={{ 
                                width: '32px',
                                height: '32px',
                                fontSize: '0.875rem',
                                minWidth: '32px',
                                padding: '0'
                              }}
                            >
                              {date.getDate()}
                            </button>
                          ) : (
                            <div style={{ width: '32px', height: '32px' }}></div>
                          )}
                        </td>
                      ))}
                      {/* Fill remaining cells if week is incomplete */}
                      {week.length < 7 && Array.from({ length: 7 - week.length }, (_, i) => (
                        <td key={`empty-${i}`} className="text-center p-1">
                          <div style={{ width: '32px', height: '32px' }}></div>
                        </td>
                      ))}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          <div className="card-footer p-2">
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSelectedDate(new Date());
                  setCurrentDate(new Date());
                  if (onChange) {
                    onChange(formatDate(new Date()));
                  }
                }}
              >
                Today
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSelectedDate(null);
                  setIsOpen(false);
                  if (onChange) {
                    onChange('');
                  }
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;