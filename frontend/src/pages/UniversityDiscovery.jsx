import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, DollarSign, Award, Heart, CheckCircle, Lock, Globe, LayoutDashboard, Kanban } from 'lucide-react';
import { Range, getTrackBackground } from 'react-range';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileMenu from '../components/ProfileMenu';
import '../styles/UniversityDiscovery.css';

const UniversityDiscovery = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shortlist, setShortlist] = useState([]);

    // Filters State
    const [search, setSearch] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [tuitionRange, setTuitionRange] = useState([60000]); // Max $60k
    const [rankingLimit, setRankingLimit] = useState(100);

    const Countries = ["USA", "UK", "Canada", "Australia", "Germany", "France", "Netherlands", "Ireland", "New Zealand", "Singapore"];

    // Fetch Universities with Filters
    const fetchUniversities = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                search,
                country: selectedCountry,
                max_tuition: tuitionRange[0],
                max_ranking: rankingLimit
            }).toString();

            const response = await fetch(`http://localhost:5000/api/universities?${query}`, { credentials: 'include' });
            const data = await response.json();

            if (Array.isArray(data)) {
                // Deduplicate by Name to prevent visual duplicates
                const uniqueUniversities = data.filter((uni, index, self) =>
                    index === self.findIndex((u) => u.name === uni.name)
                );
                setUniversities(uniqueUniversities);
            } else {
                console.error("Expected array from API but got:", data);
                setUniversities([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Shortlist (to show heart status)
    const fetchShortlist = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/universities/shortlist', { credentials: 'include' });
            const data = await response.json();
            setShortlist(data.map(item => item.university_id));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchShortlist();
        fetchUniversities();
    }, []);

    // Debounce Search Trigger
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUniversities();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, selectedCountry, tuitionRange, rankingLimit]);

    const toggleShortlist = async (uniId) => {
        try {
            if (shortlist.includes(uniId)) {
                alert("Already in shortlist! Go to Dashboard to manage.");
            } else {
                await fetch('http://localhost:5000/api/universities/shortlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ university_id: uniId }),
                    credentials: 'include'
                });
                setShortlist([...shortlist, uniId]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Handle Lock (Final Application)
    const handleLock = async (uni) => {
        try {
            const response = await fetch('http://localhost:5000/api/lock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ university_id: uni.id, university_data: uni }),
                credentials: 'include'
            });
            if (response.ok) {
                navigate('/dashboard');
                alert("University Locked! Application Started.");
            } else {
                alert("Could not lock university.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="page-wrapper">
            {/* Navigation Header */}
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <Globe size={24} className="brand-icon" />
                    <span>EduCompass AI</span>
                </div>
                <div className="nav-links">
                    <Link to="/dashboard" className="nav-link">
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/discovery" className="nav-link active">
                        <Search size={18} />
                        <span>Discovery</span>
                    </Link>
                    <Link to="/tracker" className="nav-link">
                        <Kanban size={18} />
                        <span>Tracker</span>
                    </Link>
                </div>
                <ProfileMenu />
            </nav>

            <div className="discovery-container">
                {/* Sidebar Filters */}
                <aside className="filters-sidebar">
                    <div className="sidebar-header">
                        <h3><Filter size={20} /> Filters</h3>
                        <button className="clear-btn" onClick={() => { setSearch(''); setSelectedCountry(''); setTuitionRange([60000]); setRankingLimit(100); }}>Reset</button>
                    </div>

                    <div className="filter-group">
                        <label>Target Country</label>
                        <div className="tags-container">
                            {Countries.map(c => (
                                <button
                                    key={c}
                                    className={`filter-tag ${selectedCountry === c ? 'active' : ''}`}
                                    onClick={() => setSelectedCountry(selectedCountry === c ? '' : c)}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Max Tuition: ${tuitionRange[0].toLocaleString()}</label>
                        <div className="range-wrapper">
                            <Range
                                values={tuitionRange}
                                step={1000}
                                min={0}
                                max={100000}
                                onChange={(values) => setTuitionRange(values)}
                                renderTrack={({ props, children }) => (
                                    <div
                                        onMouseDown={props.onMouseDown}
                                        onTouchStart={props.onTouchStart}
                                        style={{ ...props.style, height: '36px', display: 'flex', width: '100%' }}
                                    >
                                        <div
                                            ref={props.ref}
                                            style={{
                                                height: '5px',
                                                width: '100%',
                                                borderRadius: '4px',
                                                background: getTrackBackground({
                                                    values: tuitionRange,
                                                    colors: ['#6366f1', '#2b2b40'],
                                                    min: 0,
                                                    max: 100000,
                                                }),
                                                alignSelf: 'center'
                                            }}
                                        >
                                            {children}
                                        </div>
                                    </div>
                                )}
                                renderThumb={({ props }) => (
                                    <div
                                        {...props}
                                        style={{
                                            ...props.style,
                                            height: '20px',
                                            width: '20px',
                                            borderRadius: '50%',
                                            backgroundColor: '#FFF',
                                            boxShadow: '0px 2px 6px #AAA'
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Max Ranking: Top {rankingLimit}</label>
                        <input
                            type="range"
                            min="10" max="500" step="10"
                            value={rankingLimit}
                            onChange={(e) => setRankingLimit(e.target.value)}
                            className="native-range"
                        />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="results-area">
                    <header className="results-header">
                        <div className="search-bar">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Data Science, Harvard, Engineering..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="results-count">
                            Found {universities.length} universities
                        </div>
                    </header>

                    {loading ? (
                        <div className="loading-grid">Loading Universities...</div>
                    ) : (
                        <motion.div layout className="uni-grid">
                            <AnimatePresence>
                                {universities.map(uni => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={uni.id}
                                        className="uni-card"
                                    >
                                        <div className="uni-header">
                                            <div className="uni-rank">#{uni.ranking}</div>
                                            <button
                                                className={`like-btn ${shortlist.includes(uni.id) ? 'active' : ''}`}
                                                onClick={() => toggleShortlist(uni.id)}
                                            >
                                                <Heart size={18} fill={shortlist.includes(uni.id) ? "#ef4444" : "none"} />
                                            </button>
                                        </div>
                                        <div className="uni-body">
                                            <h3>{uni.name}</h3>
                                            <div className="uni-location">
                                                <MapPin size={14} /> {uni.country}
                                            </div>

                                            {/* AI Category Badge */}
                                            <div className="ai-badges">
                                                <span className={`category-badge ${uni.ai_category?.toLowerCase() || 'target'}`}>
                                                    {uni.ai_category || 'Target'}
                                                </span>
                                                <span className={`chance-badge ${uni.acceptance_chance?.toLowerCase() || 'medium'}`}>
                                                    {uni.acceptance_chance || 'Medium'} Chance
                                                </span>
                                            </div>

                                            <div className="uni-stats">
                                                <div className="stat">
                                                    <DollarSign size={14} />
                                                    <span>{uni.tuition_fee ? `$${uni.tuition_fee.toLocaleString()}/yr` : 'N/A'}</span>
                                                </div>
                                                <div className="stat">
                                                    <Award size={14} />
                                                    <span>{uni.acceptance_rate ? `${uni.acceptance_rate}% Accept` : 'Top 10%'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="uni-footer">
                                            <button className="lock-btn" onClick={() => handleLock(uni)}>
                                                <Lock size={14} /> Lock & Apply
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {universities.length === 0 && (
                                <div className="no-results">
                                    <Search size={48} />
                                    <p>No universities found matching your criteria.</p>
                                    <button onClick={() => { setSearch(''); setSelectedCountry(''); }}>Clear Filters</button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UniversityDiscovery;
