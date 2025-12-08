import { useEffect } from 'react';
import '../styles/components/about.css';

function AboutMe() {
    // Trigger curtain animation on mount
    useEffect(() => {
        // Add show-curtains class to body
        document.body.classList.add('show-curtains', 'curtain-opening');

        // Add right curtain div if not exists
        let rightCurtain = document.querySelector('.curtain-right');
        if (!rightCurtain) {
            rightCurtain = document.createElement('div');
            rightCurtain.className = 'curtain-right opening';
            document.body.appendChild(rightCurtain);
        } else {
            rightCurtain.classList.add('opening');
        }

        // Remove animation class after animation completes
        const timer = setTimeout(() => {
            document.body.classList.remove('curtain-opening');
            if (rightCurtain) {
                rightCurtain.classList.remove('opening');
            }
        }, 1000);

        return () => {
            clearTimeout(timer);
            // Clean up when leaving the page
            document.body.classList.remove('show-curtains', 'curtain-opening');
            const curtain = document.querySelector('.curtain-right');
            if (curtain) {
                curtain.remove();
            }
        };
    }, []);

    return (
        <div className="about-container">
            {/* Curtains are now global via body classes */}

            <div className="about-content">
                <header className="about-header">
                    <h1><i className="fas fa-theater-masks"></i> Acerca de Mí</h1>
                    <p className="about-subtitle">Desarrollador de CarnavalWEB</p>
                </header>

                {/* Profile Section */}
                <section className="about-section about-profile">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <img src="/profile-photo.jpg" alt="Jose David Manjón-Cabeza" />
                        </div>
                        <div className="profile-info">
                            <h2>Jose David Manjón-Cabeza Cantero</h2>
                            <p className="profile-title">Matemático</p>
                            <div className="profile-links">
                                <a href="https://github.com/David01mc" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-github"></i> GitHub
                                </a>
                                <a href="https://www.linkedin.com/in/jose-david-manjon-cabeza" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-linkedin"></i> LinkedIn
                                </a>
                                <a href="mailto:david01mc@gmail.com">
                                    <i className="fas fa-envelope"></i> Email
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About the Project */}
                <section className="about-section">
                    <h2><i className="fas fa-code"></i> Sobre el Proyecto</h2>
                    <div className="about-card">
                        <p>
                            <strong>CarnavalWEB</strong> es una plataforma dedicada al Carnaval de Cádiz,
                            donde los aficionados pueden explorar agrupaciones, letras, autores y mucho más.
                        </p>
                        <p>
                            Este proyecto nació de la pasión por el Carnaval y el deseo de crear una herramienta
                            moderna y accesible para toda la comunidad carnavalera.
                        </p>
                    </div>
                </section>

                {/* Technologies Used */}
                <section className="about-section">
                    <h2><i className="fas fa-laptop-code"></i> Tecnologías Utilizadas</h2>
                    <div className="tech-grid">
                        <div className="tech-item">
                            <i className="fab fa-react"></i>
                            <span>React</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-node-js"></i>
                            <span>Node.js</span>
                        </div>
                        <div className="tech-item">
                            <i className="fas fa-database"></i>
                            <span>MongoDB</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-css3-alt"></i>
                            <span>CSS3</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-js-square"></i>
                            <span>JavaScript</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-youtube"></i>
                            <span>YouTube API</span>
                        </div>
                        <div className="tech-item">
                            <i className="fas fa-robot"></i>
                            <span>OpenAI API</span>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-python"></i>
                            <span>Python</span>
                        </div>
                    </div>
                </section>

                {/* CV / Resume Section */}
                <section className="about-section">
                    <h2><i className="fas fa-file-alt"></i> Curriculum Vitae</h2>
                    <div className="about-card cv-section">
                        <div className="cv-item">
                            <h3>Experiencia</h3>
                            <ul>
                                <li>
                                    <strong>AI Solution Developer Technician</strong> - Cosmewax
                                    <span className="cv-date">junio 2024 - Presente</span>
                                    <p>Desarrollo de aplicaciones y automatizaciones con IA.</p>
                                </li>
                                <li>
                                    <strong>Desarrollador Full Stack</strong> - Proyecto Personal
                                    <span className="cv-date">noviembre 2025 - Presente</span>
                                    <p>Desarrollo de CarnavalWEB usando React, Node.js y MongoDB.</p>
                                </li>
                                {/* Add more experience items here */}
                            </ul>
                        </div>

                        <div className="cv-item">
                            <h3>Educación</h3>
                            <ul>
                                <li>
                                    <strong>Grado en Matemáticas</strong>
                                    <span className="cv-date">Universidad de Cádiz</span>
                                    <p>Especialización en matemáticas aplicadas.</p>
                                </li>
                                <li>
                                    <strong>Máster en Big Data & Business Analytics</strong>
                                    <span className="cv-date">Universidad de Pablo de Olavide</span>
                                    <p>Especialización en Científico de datos.</p>
                                </li>
                                <li>
                                    <strong>Máster en consultoría tecnológica: ERP & CRM</strong>
                                    <span className="cv-date">Universidad de Pablo de Olavide</span>
                                </li>
                                {/* Add more education items here */}
                            </ul>
                        </div>

                        <div className="cv-item">
                            <h3>Habilidades</h3>
                            <div className="skills-list">
                                <span className="skill-tag">JavaScript</span>
                                <span className="skill-tag">React</span>
                                <span className="skill-tag">Node.js</span>
                                <span className="skill-tag">MongoDB</span>
                                <span className="skill-tag">Express</span>
                                <span className="skill-tag">CSS/SCSS</span>
                                <span className="skill-tag">Git</span>
                                <span className="skill-tag">REST APIs</span>
                                <span className="skill-tag">OpenAI API</span>
                                <span className="skill-tag">Python</span>
                                <span className="skill-tag">Azure</span>
                                <span className="skill-tag">Docker</span>
                                <span className="skill-tag">SQL</span>
                            </div>
                        </div>

                        <a href="/cv.pdf" className="btn btn-primary cv-download" download>
                            <i className="fas fa-download"></i> Descargar CV (PDF)
                        </a>
                    </div>
                </section>

                {/* Contact */}
                <section className="about-section">
                    <h2><i className="fas fa-envelope"></i> Contacto</h2>
                    <div className="about-card">
                        <p>
                            Si tienes alguna sugerencia, has encontrado un error, o simplemente quieres
                            ponerte en contacto, no dudes en escribirme.
                        </p>
                        <div className="contact-buttons">
                            <a href="mailto:david01mc@gmail.com" className="btn btn-primary">
                                <i className="fas fa-envelope"></i> Enviar Email
                            </a>
                            <a href="https://github.com/David01mc/CarnavalWEB/issues" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                <i className="fab fa-github"></i> Reportar Issue
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AboutMe;
