import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import '../styles/components/calendar2026.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Defined range for the calendar
const CALENDAR_MONTHS = [
    new Date(2025, 11, 1), // Dec 2025
    new Date(2026, 0, 1),  // Jan 2026
    new Date(2026, 1, 1)   // Feb 2026
];

function Calendar2026() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);
    const [months, setMonths] = useState([]);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(1); // Default to Jan 2026 (Index 1)

    useEffect(() => {
        fetchEvents();
    }, []);

    // Align detail rows across all cards
    useEffect(() => {
        if (!selectedDay) return;

        // Wait for DOM to render
        const timer = setTimeout(() => {
            const cards = document.querySelectorAll('.performance-card-vertical');
            if (cards.length === 0) return;

            // Reset heights first
            document.querySelectorAll('.detail-item').forEach(item => {
                item.style.height = 'auto';
            });

            // Calculate max height for each row index (0-3)
            const maxHeights = [0, 0, 0, 0];

            cards.forEach(card => {
                const items = card.querySelectorAll('.detail-item');
                items.forEach((item, index) => {
                    const height = item.offsetHeight;
                    if (height > maxHeights[index]) {
                        maxHeights[index] = height;
                    }
                });
            });

            // Apply max heights to all cards
            cards.forEach(card => {
                const items = card.querySelectorAll('.detail-item');
                items.forEach((item, index) => {
                    item.style.height = `${maxHeights[index]}px`;
                });
            });
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedDay]);

    const fetchEvents = async () => {
        let grouped = {};

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/preliminares2026`);
            if (response.ok) {
                const data = await response.json();
                setEvents(data);

                // Group by date safely
                grouped = data.reduce((acc, curr) => {
                    if (!curr.fecha) return acc;
                    try {
                        const parsedDate = parse(curr.fecha, 'dd/MM/yyyy', new Date());
                        if (isNaN(parsedDate)) return acc;
                        const dateKey = format(parsedDate, 'yyyy-MM-dd');

                        if (!acc[dateKey]) acc[dateKey] = [];
                        acc[dateKey].push(curr);
                    } catch (e) {
                        console.warn('Skipping invalid date:', curr);
                    }
                    return acc;
                }, {});
            }
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        } finally {
            // Always generate months, even if grouped is empty
            try {
                const generatedMonths = CALENDAR_MONTHS.map(monthDate => {
                    const daysInMonth = eachDayOfInterval({
                        start: startOfMonth(monthDate),
                        end: endOfMonth(monthDate)
                    });

                    let startDay = getDay(daysInMonth[0]); // 0=Sun, 1=Mon...
                    // Adjust to Mon=0...Sun=6 logic for padding
                    const paddingCount = startDay === 0 ? 6 : startDay - 1;
                    const padding = Array(paddingCount).fill(null);

                    return {
                        name: format(monthDate, 'MMMM yyyy', { locale: es }),
                        days: [...padding, ...daysInMonth],
                        eventMap: grouped
                    };
                });

                setMonths(generatedMonths);
            } catch (genError) {
                console.error('Error generating calendar grid:', genError);
            }
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.03
            }
        }
    };

    const item = {
        hidden: { scale: 0.9, opacity: 0 },
        show: { scale: 1, opacity: 1 }
    };

    const nextMonth = () => {
        if (currentMonthIndex < months.length - 1) setCurrentMonthIndex(prev => prev + 1);
    };

    const prevMonth = () => {
        if (currentMonthIndex > 0) setCurrentMonthIndex(prev => prev - 1);
    };

    if (loading) return <div className="loading">Cargando calendario...</div>;

    const currentMonth = months[currentMonthIndex];

    return (
        <div className="calendar-container">
            <header className="calendar-header compact">
                <motion.h1
                    className="calendar-title"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    COAC 2026
                </motion.h1>
            </header>

            {currentMonth && (
                <div className="month-section">
                    <div className="month-navigation">
                        <button
                            className="nav-btn"
                            onClick={prevMonth}
                            disabled={currentMonthIndex === 0}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <h2 className="month-title">{currentMonth.name}</h2>
                        <button
                            className="nav-btn"
                            onClick={nextMonth}
                            disabled={currentMonthIndex === months.length - 1}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <div className="weekdays-header">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="weekday-name">{day}</div>
                        ))}
                    </div>

                    <motion.div
                        key={currentMonthIndex} // Force re-render animation on month change
                        className="calendar-grid"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {currentMonth.days.map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} className="calendar-day-empty"></div>;

                            const dateKey = format(date, 'yyyy-MM-dd');
                            const dayEvents = currentMonth.eventMap[dateKey] || [];
                            const dayNumber = format(date, 'd');
                            const hasEvents = dayEvents.length > 0;

                            // Find 'Cabeza de Serie'
                            const cabezaDeSerie = dayEvents.find(ev => ev.cabeza_serie === true || ev.cabeza_serie === 'true');

                            // Detect phase (all events on same day should have same phase)
                            const phase = dayEvents[0]?.fase || 'Preliminares';
                            const phaseClass = phase.toLowerCase().replace(/\s+/g, '-');

                            return (
                                <motion.div
                                    key={dateKey}
                                    className={`calendar-day-card ${hasEvents ? 'has-events' : ''} ${cabezaDeSerie ? 'is-highlight' : ''} phase-${phaseClass}`}
                                    variants={item}
                                    onClick={() => hasEvents && setSelectedDay({ date: format(date, 'dd/MM/yyyy'), events: dayEvents })}
                                    whileHover={hasEvents ? { scale: 1.05, zIndex: 10 } : {}}
                                >
                                    <div className="date-header">
                                        <span className={`date-number ${cabezaDeSerie ? 'gold-text' : ''}`}>{dayNumber}</span>
                                        {hasEvents && (
                                            <div className={`phase-badge phase-${phaseClass}`}>
                                                {phase}
                                            </div>
                                        )}
                                        {cabezaDeSerie && <i className="fas fa-crown gold-icon"></i>}
                                    </div>

                                    {cabezaDeSerie && (
                                        <div className="cabeza-serie-preview">
                                            <span className="cs-name">{cabezaDeSerie.nombre}</span>
                                            <span className="cs-type">{cabezaDeSerie.tipo}</span>
                                        </div>
                                    )}

                                    {!cabezaDeSerie && hasEvents && (
                                        <div className="day-summary">
                                            {dayEvents.length} Agrup.
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            )}

            <AnimatePresence>
                {selectedDay && (
                    <motion.div
                        className="day-details-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedDay(null)}
                    >
                        <motion.div
                            className="day-details-modal"
                            onClick={e => e.stopPropagation()}
                            layoutId={`day-${selectedDay.date}`}
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        >
                            <div className="day-details-header">
                                <div>
                                    <h2>{selectedDay.date}</h2>
                                    {selectedDay.events[0]?.fase && (
                                        <span className={`phase-badge-modal phase-${selectedDay.events[0].fase.toLowerCase().replace(/\\s+/g, '-')}`}>
                                            {selectedDay.events[0].fase}
                                        </span>
                                    )}
                                </div>
                                <button className="close-modal-btn" onClick={() => setSelectedDay(null)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="day-performances-horizontal">
                                {selectedDay.events.map((ev, i) => (
                                    <motion.div
                                        key={i}
                                        className={`performance-card-vertical ${ev.cabeza_serie === true || ev.cabeza_serie === 'true' ? 'highlight-col' : ''}`}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <div className="perf-header">
                                            {(ev.cabeza_serie === true || ev.cabeza_serie === 'true') && (
                                                <div className="crown-icon-center"><i className="fas fa-crown"></i></div>
                                            )}
                                            <span className={`perf-type ${ev.tipo.toLowerCase()}`}>{ev.tipo}</span>
                                            <h3 className="perf-name-vertical">{ev.nombre}</h3>
                                            {ev.año_anterior && ev.año_anterior.nombre && (
                                                <div className="perf-prev-year">
                                                    <i className="fas fa-history"></i> {ev.año_anterior.nombre}
                                                </div>
                                            )}
                                        </div>

                                        <div className="perf-details-vertical">
                                            <div className="detail-item">
                                                <i className="fas fa-map-marker-alt icon"></i>
                                                <span>{ev.localidad || '\u00A0'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <i className="fas fa-pen-nib icon"></i>
                                                <span>{ev.letra || '\u00A0'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <i className="fas fa-music icon"></i>
                                                <span>{ev.musica || '\u00A0'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <i className="fas fa-user-tie icon"></i>
                                                <span>{ev.direccion || '\u00A0'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Calendar2026;
