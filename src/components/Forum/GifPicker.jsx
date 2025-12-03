import { useState, useEffect } from 'react';
import '../../styles/components/gifPicker.css';

const TENOR_API_KEY = 'LIVDSRZULELA'; // Public demo key
const CLIENT_KEY = 'CarnavalWEB';

const GifPicker = ({ onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const [gifs, setGifs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load trending GIFs initially
        fetchGifs('');
    }, []);

    const fetchGifs = async (query) => {
        setLoading(true);
        try {
            const endpoint = query
                ? `https://g.tenor.com/v1/search?q=${query}&key=${TENOR_API_KEY}&client_key=${CLIENT_KEY}&limit=12`
                : `https://g.tenor.com/v1/trending?key=${TENOR_API_KEY}&client_key=${CLIENT_KEY}&limit=12`;

            const res = await fetch(endpoint);
            const data = await res.json();
            setGifs(data.results || []);
        } catch (error) {
            console.error('Error fetching GIFs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchGifs(search);
    };

    return (
        <div className="gif-picker-overlay" onClick={onClose}>
            <div className="gif-picker-content" onClick={e => e.stopPropagation()}>
                <div className="gif-picker-header">
                    <h3>Seleccionar GIF</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSearch} className="gif-search-form">
                    <input
                        type="text"
                        placeholder="Buscar GIFs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                    <button type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </form>

                <div className="gif-grid">
                    {loading ? (
                        <div className="gif-loading">Cargando...</div>
                    ) : (
                        gifs.map(gif => (
                            <div
                                key={gif.id}
                                className="gif-item"
                                onClick={() => onSelect(gif.media[0].gif.url)}
                            >
                                <img src={gif.media[0].tinygif.url} alt={gif.content_description} />
                            </div>
                        ))
                    )}
                </div>

                <div className="gif-footer">
                    Powered by Tenor
                </div>
            </div>
        </div>
    );
};

export default GifPicker;
