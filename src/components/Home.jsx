import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import FeaturedAgrupacion from './FeaturedAgrupacion';
import cfgLogo from '../assets/cfg-logo.png';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

// Tipos de agrupaciones data
const TIPOS_AGRUPACIONES = [
  {
    id: 'comparsa',
    nombre: 'Comparsa',
    icono: 'fa-users',
    color: '#8B0000',
    descripcion: 'Agrupación de 12 componentes que destaca por su musicalidad, poesía y profundidad lírica. Sus letras suelen abordar temas sociales con un tono emotivo y reivindicativo.',
    caracteristicas: ['12 componentes', 'Tono poético', 'Crítica social']
  },
  {
    id: 'chirigota',
    nombre: 'Chirigota',
    icono: 'fa-laugh-beam',
    color: '#FF6B35',
    descripcion: 'La modalidad más cómica del carnaval. Con 12 componentes, su objetivo principal es hacer reír al público con letras ingeniosas, juegos de palabras y situaciones absurdas.',
    caracteristicas: ['12 componentes', 'Humor', 'Ingenio']
  },
  {
    id: 'coro',
    nombre: 'Coro',
    icono: 'fa-music',
    color: '#4A90A4',
    descripcion: 'Formado por 35-45 voces, el coro es la agrupación más numerosa. Destaca por sus potentes tangos y su capacidad para crear atmósferas únicas con armonías vocales.',
    caracteristicas: ['35-45 voces', 'Tangos', 'Armonías']
  },
  {
    id: 'cuarteto',
    nombre: 'Cuarteto',
    icono: 'fa-theater-masks',
    color: '#9B59B6',
    descripcion: 'Pequeña agrupación teatral de 3-5 componentes que representa escenas cómicas con diálogos, parodias y situaciones hilarantes. Son los más teatrales del concurso.',
    caracteristicas: ['3-5 componentes', 'Teatro', 'Parodias']
  }
];

// Estadísticas del Carnaval
const ESTADISTICAS = [
  { valor: '1884', label: 'Primer concurso oficial' },
  { valor: '140+', label: 'Años de historia' },
  { valor: '100+', label: 'Agrupaciones por año' },
  { valor: '15', label: 'Días de fiesta' }
];

// Fotos nostálgicas para el hero
const FOTOS_NOSTALGICAS = [
  '/carnaval-1.jpg',
  '/carnaval-2.jpg',
  '/carnaval-3.jpg',
  '/carnaval-4.jpg',
  '/carnaval-5.jpg'
];

const AMBIENT_PHRASES = [
  "Me han dicho que la locura...",
  "En el escalon de cada noche...",
  "Si caminito de falla...",
  "Y cuando yo era un tonto...",
  "Con permiso buenas tardes...",
  "Tampoco pa ponerse ajín!",
  "Lo que diga mi mujer...",
  "Somos la ratatatata...",
  "Nací una noche plata de carnavales...",
  "Quien ha dicho ole, quien ha dicho bravo...",
  "¡Que se le seque la hierbabuena!",
  "¡Menos trabajo y más Carnaval!",
  "Come on baby, come on baby...",
  "Iba por canalejas...",
  "Un viento de trece años...",
  "Remueve y remueve que esto se ha acabao...",
];

// Componente para el efecto de máquina de escribir ambiental
const TypewriterLyric = ({ phrase, x, y, side, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState('typing');

  useEffect(() => {
    let timeout;
    if (phase === 'typing') {
      if (displayedText.length < phrase.length) {
        timeout = setTimeout(() => {
          setDisplayedText(phrase.slice(0, displayedText.length + 1));
        }, 50 + Math.random() * 80);
      } else {
        timeout = setTimeout(() => setPhase('visible'), 800);
      }
    } else if (phase === 'visible') {
      timeout = setTimeout(() => setPhase('deleting'), 1000);
    } else if (phase === 'deleting') {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(prev => prev.slice(0, -1));
        }, 20 + Math.random() * 30);
      } else {
        setPhase('complete');
      }
    } else if (phase === 'complete') {
      timeout = setTimeout(onComplete, 200);
    }
    return () => clearTimeout(timeout);
  }, [displayedText, phase, phrase, onComplete]);

  return (
    <div
      className={`ambient-typewriter ${phase} side-${side}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="typewriter-text">{displayedText}</span>
      <span className="typewriter-cursor">|</span>
    </div>
  );
};

function Home({ onViewChange, onSelectAgrupacion }) {
  const [featuredAgrupacion, setFeaturedAgrupacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});

  // Floating photos state
  const [floatingPhotos, setFloatingPhotos] = useState([]);
  const [agrupacionImages, setAgrupacionImages] = useState([]);
  const photoIdRef = useRef(0);


  // Fetch agrupaciones with images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/agrupaciones?limit=200`);
        if (response.ok) {
          const data = await response.json();
          // Filter agrupaciones with valid images and keep full object
          const agrupacionesWithImages = data.data
            .filter(a => a.image && a.image.startsWith('http'));
          if (agrupacionesWithImages.length > 0) {
            setAgrupacionImages(agrupacionesWithImages);
          }
        }
      } catch (err) {
        console.error('Error fetching agrupacion images:', err);
      }
    };
    fetchImages();
  }, []);

  // Generate random position and rotation for a photo
  // Covers the border zone (left, right, and top edges)
  const generatePhotoProps = (existingPhotos = []) => {
    // Define spawn zones around the border (avoiding curtains at 0-6% and 94-100%)
    const zones = [
      // Left column (after curtain at 10%)
      { x: [12, 22], y: [5, 70] },
      // Right column (before curtain at 90%)
      { x: [75, 87], y: [5, 70] },
      // Top row (avoiding center content)
      { x: [22, 38], y: [2, 15] },
      { x: [62, 78], y: [2, 15] },
    ];

    // Pick a random zone
    const zone = zones[Math.floor(Math.random() * zones.length)];

    // Generate position within zone
    let x = zone.x[0] + Math.random() * (zone.x[1] - zone.x[0]);
    let y = zone.y[0] + Math.random() * (zone.y[1] - zone.y[0]);

    // Try to avoid overlapping with existing photos
    for (let attempts = 0; attempts < 5; attempts++) {
      const tooClose = existingPhotos.some(p =>
        Math.abs(p.x - x) < 12 && Math.abs(p.y - y) < 15
      );
      if (!tooClose) break;
      // Try a different position
      const newZone = zones[Math.floor(Math.random() * zones.length)];
      x = newZone.x[0] + Math.random() * (newZone.x[1] - newZone.x[0]);
      y = newZone.y[0] + Math.random() * (newZone.y[1] - newZone.y[0]);
    }

    // Use agrupacion data if available, fallback to static images
    let src, agrupacion = null;
    if (agrupacionImages.length > 0) {
      const randomAgrupacion = agrupacionImages[Math.floor(Math.random() * agrupacionImages.length)];
      src = randomAgrupacion.image;
      agrupacion = randomAgrupacion;
    } else {
      src = FOTOS_NOSTALGICAS[Math.floor(Math.random() * FOTOS_NOSTALGICAS.length)];
    }

    return {
      id: photoIdRef.current++,
      src,
      agrupacion,
      x,
      y,
      rotation: -15 + Math.random() * 30, // -15 to +15 degrees
      visible: true
    };
  };

  // Get max photos based on screen width
  const getMaxPhotos = () => {
    return window.innerWidth <= 768 ? 3 : 6;
  };

  // Floating photos animation effect
  useEffect(() => {
    // Wait for images to be loaded
    const startDelay = setTimeout(() => {
      // Add first photo
      setFloatingPhotos([generatePhotoProps([])]);
    }, 1500);

    const interval = setInterval(() => {
      setFloatingPhotos(prev => {
        const maxPhotos = getMaxPhotos();
        // Keep only visible photos up to max limit
        const activePhotos = prev.filter(p => p.visible).slice(-(maxPhotos - 1));
        // Add new photo avoiding overlaps
        return [...activePhotos, generatePhotoProps(activePhotos)];
      });

      // Mark oldest photo as fading after 6 seconds
      setTimeout(() => {
        setFloatingPhotos(prev => {
          if (prev.length > 0) {
            const [oldest, ...rest] = prev;
            return [{ ...oldest, visible: false }, ...rest];
          }
          return prev;
        });
      }, 6000);

      // Remove faded photos after transition completes (3s after fading)
      setTimeout(() => {
        setFloatingPhotos(prev => prev.filter(p => p.visible));
      }, 9500);
    }, 2500); // New photo every 2.5 seconds

    return () => {
      clearTimeout(startDelay);
      clearInterval(interval);
    };
  }, [agrupacionImages]);

  // Efecto ambiental de letras tipo máquina de escribir para la sección de contribución
  const [ambientLyrics, setAmbientLyrics] = useState([]);
  const lastPhraseIndex = useRef(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setAmbientLyrics(prev => {
        // Limpiar frases completadas automáticamente si hay exceso (seguridad)
        const activeLyrics = prev.length;

        // Si ya hay 4 o más, no añadir nueva
        if (activeLyrics >= 4) return prev;

        // Si hay menos de 2, forzar añadir. Si hay entre 2 y 4, añadir aleatoriamente.
        // Pero siempre intentar mantener al menos 2.
        if (activeLyrics >= 2 && Math.random() > 0.6) return prev;

        // Filtrar frases que ya están mostrándose para no repetir
        const currentPhrases = prev.map(l => l.phrase);
        const availablePhrases = AMBIENT_PHRASES.filter(p => !currentPhrases.includes(p));

        // Si no hay frases disponibles (raro), no hacer nada
        if (availablePhrases.length === 0) return prev;

        // Elegir una frase aleatoria de las disponibles
        const randomIndex = Math.floor(Math.random() * availablePhrases.length);
        const selectedPhrase = availablePhrases[randomIndex];
        lastPhraseIndex.current = AMBIENT_PHRASES.indexOf(selectedPhrase);

        const isLeft = Math.random() > 0.5;
        const newLyric = {
          id: Date.now(),
          phrase: selectedPhrase,
          x: isLeft ? 12 + Math.random() * 13 : 75 + Math.random() * 12,
          y: 10 + Math.random() * 70,
          side: isLeft ? 'left' : 'right'
        };
        return [...prev, newLyric];
      });
    }, 2500); // Comprobar más frecuentemente para mantener el flujo constante

    return () => clearInterval(interval);
  }, []);

  const handleLyricComplete = (id) => {
    setAmbientLyrics(prev => prev.filter(l => l.id !== id));
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all section refs
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchFeaturedAgrupacion();

    // Confetti effect
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      confetti({
        particleCount: 3,
        startVelocity: 15,
        spread: 45,
        angle: 270,
        origin: { x: Math.random() * 0.2, y: 0 },
        colors: ['#FFD700', '#FF1493', '#00CED1', '#FF6347', '#32CD32'],
        ticks: 300,
        gravity: 0.8,
        scalar: 1.2,
        zIndex: 1003
      });
      confetti({
        particleCount: 3,
        startVelocity: 15,
        spread: 45,
        angle: 270,
        origin: { x: 0.8 + Math.random() * 0.2, y: 0 },
        colors: ['#FFD700', '#FF1493', '#00CED1', '#FF6347', '#32CD32'],
        ticks: 300,
        gravity: 0.8,
        scalar: 1.2,
        zIndex: 1003
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedAgrupacion = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/agrupaciones/featured`);
      if (!response.ok) throw new Error('Error al cargar los datos');
      const data = await response.json();
      setFeaturedAgrupacion(data.agrupacion);
    } catch (err) {
      console.error('Error fetching featured agrupación:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToContent = () => {
    document.getElementById('que-es-carnaval')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-redesign">
      {/* ============================================
          HERO SECTION - Full Viewport
          ============================================ */}
      <section className="hero-fullscreen">
        <div className="hero-backdrop">
          {/* Floating nostalgic photos */}
          {floatingPhotos.map((photo) => (
            <div
              key={photo.id}
              className={`floating-photo ${photo.visible ? 'visible' : 'fading'} ${photo.agrupacion ? 'clickable' : ''}`}
              style={{
                left: `${photo.x}%`,
                top: `${photo.y}%`,
                '--initial-rotation': `${photo.rotation}deg`
              }}
              onClick={() => {
                if (photo.agrupacion && onSelectAgrupacion) {
                  onSelectAgrupacion(photo.agrupacion);
                }
              }}
              title={photo.agrupacion ? `${photo.agrupacion.name} (${photo.agrupacion.year})` : ''}
            >
              <img src={photo.src} alt={photo.agrupacion?.name || 'Carnaval de Cádiz'} />
            </div>
          ))}
        </div>
        <div className="hero-curtain-left"></div>
        <div className="hero-curtain-right"></div>

        <div className="hero-content-center">
          <div className="hero-icon-main">
            <i className="fas fa-theater-masks"></i>
          </div>
          <h1 className="hero-main-title">
            <span className="title-line">El Carnaval</span>
            <span className="title-line accent">de Cádiz</span>
          </h1>
          <p className="hero-tagline">
            La fiesta más antigua y auténtica de España. Donde el ingenio, la sátira y la música
            se unen para crear arte efímero que perdura en la memoria.
          </p>
          <div className="hero-cta-group">
            <button
              className="btn-hero-primary"
              onClick={() => onViewChange && onViewChange('collection')}
            >
              <i className="fas fa-music"></i> Explorar Repertorio
            </button>
            <button
              className="btn-hero-secondary"
              onClick={scrollToContent}
            >
              <i className="fas fa-info-circle"></i> Conocer más
            </button>
          </div>
        </div>

        <div className="scroll-indicator" onClick={scrollToContent}>
          <span>Descubre</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* ============================================
          SECTION: ¿Qué es el Carnaval de Cádiz?
          ============================================ */}
      <section
        id="que-es-carnaval"
        className={`section-carnaval ${visibleSections['que-es-carnaval'] ? 'visible' : ''}`}
        ref={(el) => (sectionRefs.current['que-es-carnaval'] = el)}
      >
        <div className="section-container">
          <div className="carnaval-grid">
            <div className="carnaval-text">
              <h2 className="section-title-fancy">
                <span className="title-decorator">✦</span>
                ¿Qué es el Carnaval de Cádiz?
                <span className="title-decorator">✦</span>
              </h2>
              <div className="carnaval-description">
                <p>
                  El <strong>Carnaval de Cádiz</strong> es mucho más que una fiesta: es una expresión
                  cultural única en el mundo. Cada año, durante el mes de febrero, la ciudad más
                  antigua de Occidente se transforma en un escenario donde el ingenio popular,
                  la sátira y la música se fusionan en un espectáculo irrepetible.
                </p>
                <p>
                  En el <strong>Gran Teatro Falla</strong>, el corazón del concurso oficial, cientos
                  de agrupaciones compiten mostrando sus letras originales, donde la crítica social,
                  el humor y la poesía se entrelazan con melodías que van desde lo más emotivo
                  hasta lo más hilarante.
                </p>
                <p>
                  Declarado <strong>Fiesta de Interés Turístico Internacional</strong>, el carnaval
                  gaditano es reconocido por su libertad de expresión y su capacidad para reírse
                  de todo y de todos, incluyendo de sí mismo.
                </p>
              </div>
            </div>
            <div className="carnaval-stats">
              {ESTADISTICAS.map((stat, idx) => (
                <div key={idx} className="stat-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <span className="stat-value">{stat.valor}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Separator with CFG Logo */}
      <div className="section-separator">
        <div className="separator-line"></div>
        <img src={cfgLogo} alt="Carnaval de Cádiz" className="separator-logo" />
        <div className="separator-line"></div>
      </div>

      {/* ============================================
          SECTION: Tipos de Agrupaciones
          ============================================ */}
      <section
        id="tipos-agrupaciones"
        className={`section-tipos ${visibleSections['tipos-agrupaciones'] ? 'visible' : ''}`}
        ref={(el) => (sectionRefs.current['tipos-agrupaciones'] = el)}
      >
        <div className="section-container">
          <h2 className="section-title-fancy center">
            <span className="title-decorator">✦</span>
            Las Modalidades del Concurso
            <span className="title-decorator">✦</span>
          </h2>
          <p className="section-subtitle">
            Cuatro formas de expresión que dan vida al carnaval en el teatro
          </p>

          <div className="tipos-grid">
            {TIPOS_AGRUPACIONES.map((tipo, idx) => (
              <div
                key={tipo.id}
                className="tipo-card"
                style={{
                  '--card-color': tipo.color,
                  animationDelay: `${idx * 0.15}s`
                }}
              >
                <div className="tipo-icon">
                  <i className={`fas ${tipo.icono}`}></i>
                </div>
                <h3 className="tipo-nombre">{tipo.nombre}</h3>
                <p className="tipo-descripcion">{tipo.descripcion}</p>
                <div className="tipo-tags">
                  {tipo.caracteristicas.map((tag, i) => (
                    <span key={i} className="tipo-tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          PARALLAX SECTION - Teatro Falla
          ============================================ */}
      <div className="parallax-section">
        <div className="parallax-overlay"></div>
        <div className="parallax-content">
          <i className="fas fa-theater-masks"></i>
          <h3>El Gran Teatro Falla</h3>
          <p>Templo de la fiesta gaditana desde 1910</p>
        </div>
      </div>

      {/* ============================================
          SECTION: Agrupación Destacada del Día
          ============================================ */}
      <section
        id="featured-section"
        className={`section-featured ${visibleSections['featured-section'] ? 'visible' : ''}`}
        ref={(el) => (sectionRefs.current['featured-section'] = el)}
      >
        <div className="section-container">
          <h2 className="section-title-fancy center">
            <i className="fas fa-star" style={{ color: '#FFD700' }}></i>
            Agrupación del Día
            <i className="fas fa-star" style={{ color: '#FFD700' }}></i>
          </h2>
          <p className="section-subtitle">
            Cada día destacamos una agrupación diferente de nuestro repertorio
          </p>

          <div className="featured-spotlight">
            {loading ? (
              <div className="loading">
                <i className="fas fa-spinner fa-spin"></i> Cargando...
              </div>
            ) : featuredAgrupacion ? (
              <FeaturedAgrupacion
                agrupacion={featuredAgrupacion}
                onClick={() => onSelectAgrupacion && onSelectAgrupacion(featuredAgrupacion)}
              />
            ) : (
              <div className="empty-state">
                <i className="fas fa-theater-masks"></i>
                <h3>No hay agrupaciones disponibles</h3>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION: Quick Navigation
          ============================================ */}
      <section
        id="quick-nav"
        className={`section-quicknav ${visibleSections['quick-nav'] ? 'visible' : ''}`}
        ref={(el) => (sectionRefs.current['quick-nav'] = el)}
      >
        <div className="section-container">
          <h2 className="section-title-fancy center">
            <span className="title-decorator">✦</span>
            Explora más
            <span className="title-decorator">✦</span>
          </h2>

          <div className="quick-nav-grid-new">
            <button className="quick-nav-card-new letras" onClick={() => onViewChange?.('collection')}>
              <div className="qn-icon"><i className="fas fa-music"></i></div>
              <div className="qn-content">
                <h3>Repertorio</h3>
                <p>Explora todas las letras</p>
              </div>
              <i className="fas fa-arrow-right qn-arrow"></i>
            </button>

            <button className="quick-nav-card-new calendario" onClick={() => onViewChange?.('calendar-2026')}>
              <div className="qn-icon"><i className="fas fa-calendar-alt"></i></div>
              <div className="qn-content">
                <h3>Calendario 2026</h3>
                <p>Programa del concurso</p>
              </div>
              <i className="fas fa-arrow-right qn-arrow"></i>
            </button>

            <button className="quick-nav-card-new foro" onClick={() => onViewChange?.('forum')}>
              <div className="qn-icon"><i className="fas fa-comments"></i></div>
              <div className="qn-content">
                <h3>Foro</h3>
                <p>Únete a la conversación</p>
              </div>
              <i className="fas fa-arrow-right qn-arrow"></i>
            </button>

            <button className="quick-nav-card-new bingo" onClick={() => onViewChange?.('bingo-2026')}>
              <div className="qn-icon"><i className="fas fa-th"></i></div>
              <div className="qn-content">
                <h3>Bingo 2026</h3>
                <p>¿Cuántos clichés encuentras?</p>
              </div>
              <i className="fas fa-arrow-right qn-arrow"></i>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION: Call to Action - Contribuye
          ============================================ */}
      <section
        id="contribuir-section"
        className={`section-contribuir ${visibleSections['contribuir-section'] ? 'visible' : ''}`}
        ref={(el) => (sectionRefs.current['contribuir-section'] = el)}
      >
        <div className="contribuir-container">
          {/* Ambient Typewriter Lyrics */}
          {ambientLyrics.map(lyric => (
            <TypewriterLyric
              key={lyric.id}
              phrase={lyric.phrase}
              x={lyric.x}
              y={lyric.y}
              side={lyric.side}
              onComplete={() => handleLyricComplete(lyric.id)}
            />
          ))}
          <div className="contribuir-icon">
            <i className="fas fa-hand-holding-heart"></i>
          </div>
          <h2 className="contribuir-title">¡Ayúdanos a crecer!</h2>
          <p className="contribuir-text">
            Estamos construyendo el mayor archivo digital del Carnaval de Cádiz.
            ¿Conoces letras de <strong>agrupaciones ilegales</strong>, <strong>callejeras</strong> o
            <strong> romanceros</strong> que no están en nuestra base de datos?
          </p>
          <p className="contribuir-text">
            Tu contribución ayuda a preservar la tradición carnavalera para las generaciones futuras.
          </p>
          <div className="contribuir-stats">
            <div className="contribuir-stat">
              <i className="fas fa-database"></i>
              <span>+500 letras</span>
            </div>
            <div className="contribuir-stat">
              <i className="fas fa-users"></i>
              <span>+100 agrupaciones</span>
            </div>
            <div className="contribuir-stat">
              <i className="fas fa-calendar-alt"></i>
              <span>Desde 1990</span>
            </div>
          </div>
          <button
            className="btn-contribuir"
            onClick={() => onViewChange?.('collection')}
          >
            <i className="fas fa-plus-circle"></i>
            Añadir Agrupación
          </button>
          <p className="contribuir-note">
            <i className="fas fa-info-circle"></i>
            Necesitas crear una cuenta para poder contribuir
          </p>
        </div>
      </section>

      {/* ============================================
          FOOTER TEATRAL
          ============================================ */}
      <footer className="home-footer-theater">
        <div className="footer-curtain-decor"></div>
        <div className="footer-content">
          <div className="footer-brand">
            <i className="fas fa-theater-masks"></i>
            <span>Carnaval de Cádiz</span>
          </div>
          <p className="footer-tagline">
            Preservando la tradición carnavalera gaditana
          </p>
          <div className="footer-links">
            <button onClick={() => onViewChange?.('about')}>
              <i className="fas fa-info-circle"></i> Sobre el proyecto
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
