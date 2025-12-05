import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import '../styles/components/calendar2026.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function Calendar2026() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);
    const [months, setMonths] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/preliminares2026`);
            if (!response.ok) throw new Error('Error al cargar actuaciones');

            const data = await response.json();
            setEvents(data);

            // Group by date to easily find events
            const grouped = data.reduce((acc, curr) => {
                // Parse date: "11/01/2026"
                const parsedDate = parse(curr.fecha, 'dd/MM/yyyy', new Date());
                const dateKey = format(parsedDate, 'yyyy-MM-dd');

                if (!acc[dateKey]) acc[dateKey] = [];
                acc[dateKey].push(curr);
                return acc;
            }, {});

            // Determine date range to generate months
            // Assuming data contains at least one date.
            // If empty, default to Jan 2026
            const dates = data.map(d => parse(d.fecha, 'dd/MM/yyyy', new Date()));

            let startDate = new Date(2026, 0, 1); // Default Jan 1 2026
            let endDate = new Date(2026, 1, 28); // Default Feb 28 2026

            if (dates.length > 0) {
                const sortedDates = dates.sort((a, b) => a - b);
                startDate = startOfMonth(sortedDates[0]);
                endDate = endOfMonth(sortedDates[sortedDates.length - 1]);
            }

            // Generate months and days
            // We want to handle Jan, Feb, etc if they exist
            // Using a simple set to identification
            const uniqueMonths = [...new Set(dates.map(d => format(d, 'yyyy-MM')))].sort();

            // If we have dates, map them. Otherwise fallback
            const generatedMonths = uniqueMonths.map(monthStr => {
                const [year, month] = monthStr.split('-');
                const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                const daysInMonth = eachDayOfInterval({
                    start: startOfMonth(monthDate),
                    end: endOfMonth(monthDate)
                });

                // Calculate padding days for start of week (Monday start)
                // getDay returns 0 for Sunday. We want Mon=0, Sun=6
                let startDay = getDay(daysInMonth[0]); // 0=Sun, 1=Mon...
                // Adjust to Mon=0...Sun=6
                // Standard: Sun=0, Mon=1, Tue=2...
                // Target: Mon=1...Sun=7 for css grid or Mon=0 logic
                // Let's use simple empty slots array
                // If getDay is 1 (Mon) -> 0 padding
                // If getDay is 0 (Sun) -> 6 padding
                const paddingCount = startDay === 0 ? 6 : startDay - 1;
                const padding = Array(paddingCount).fill(null);

                return {
                    name: format(monthDate, 'MMMM yyyy', { locale: es }),
                    days: [...padding, ...daysInMonth],
                    eventMap: grouped
                };
            });

            setMonths(generatedMonths);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    if (loading) return <div className="loading">Cargando calendario...</div>;

    return (
        <div className="calendar-container">
            <header className="calendar-header">
                <motion.h1
                    className="calendar-title"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    Preliminares 2026
                </motion.h1>
            </header>

            {months.map((month, mIdx) => (
                <div key={mIdx} className="month-section">
                    <h2 className="month-title">{month.name}</h2>

                    <div className="weekdays-header">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="weekday-name">{day}</div>
                        ))}
                    </div>

                    <motion.div
                        className="calendar-grid"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {month.days.map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} className="calendar-day-empty"></div>;

                            const dateKey = format(date, 'yyyy-MM-dd');
                            const dayEvents = month.eventMap[dateKey] || [];
                            const dayNumber = format(date, 'd');
                            const hasEvents = dayEvents.length > 0;
                            const functionName = hasEvents ? (dayEvents[0]?.funcion.split('-')[0].trim()) : '';

                            return (
                                <motion.div
                                    key={dateKey}
                                    className={`calendar-day-card ${hasEvents ? 'has-events' : ''}`}
                                    variants={item}
                                    onClick={() => hasEvents && setSelectedDay({ date: format(date, 'dd/MM/yyyy'), events: dayEvents })}
                                    whileHover={hasEvents ? { y: -5, boxShadow: '0 8px 20px rgba(255,0,204,0.3)' } : {}}
                                >
                                    <div className={`date-badge ${hasEvents ? 'active' : ''}`}>
                                        <span className="date-number">{dayNumber}</span>
                                    </div>

                                    {hasEvents && (
                                        <div className="day-content">
                                            <div className="function-label">{functionName}</div>
                                            <div className="events-dots">
                                                {dayEvents.slice(0, 6).map((_, i) => (
                                                    <div key={i} className="event-dot" title={dayEvents[i].nombre}></div>
                                                ))}
                                                {dayEvents.length > 6 && <span className="more-dots">+</span>}
                                            </div>
                                            <div className="groups-count">
                                                {dayEvents.length} agrupaciones
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            ))}

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
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        >
                            <div className="day-details-header">
                                <div>
                                    <h2>{selectedDay.date}</h2>
                                    <span style={{ opacity: 0.7 }}>{selectedDay.events[0]?.funcion}</span>
                                </div>
                                <button className="close-modal-btn" onClick={() => setSelectedDay(null)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="day-performances">
                                {selectedDay.events.map((ev, i) => (
                                    <motion.div
                                        key={i}
                                        className="performance-card"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <span className={`perf-type ${ev.tipo.toLowerCase()}`}>{ev.tipo}</span>
                                                <h3 className="perf-name">{ev.nombre}</h3>
                                            </div>
                                            {(ev.cabeza_serie || ev.cabeza_serie === 'true') && (
                                                <i className="fas fa-crown" title="Cabeza de serie" style={{ color: '#ffd700' }}></i>
                                            )}
                                        </div>
                                        <div className="perf-meta">
                                            <div><i className="fas fa-map-marker-alt"></i> {ev.localidad}</div>
                                            {ev.letra && <div><i className="fas fa-pen-nib"></i> L: {ev.letra}</div>}
                                            {ev.musica && <div><i className="fas fa-music"></i> M: {ev.musica}</div>}
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
