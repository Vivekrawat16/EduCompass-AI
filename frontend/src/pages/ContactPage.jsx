import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Globe, ArrowLeft } from 'lucide-react';
import '../styles/LandingPage.css';

const ContactPage = () => {
    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="landing-nav-container">
                    <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
                        <Globe size={24} className="brand-icon" />
                        <span>EduCompass AI</span>
                    </Link>
                    <div className="nav-actions">
                        <Link to="/" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ArrowLeft size={16} /> Back to Home
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="features-section" style={{ paddingTop: '8rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--scholar-navy-900)' }}>Contact Us</h1>
                    <p style={{ color: 'var(--scholar-gray-600)', fontSize: '1.1rem' }}>We'd love to hear from you. clearly describe your query below.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '4rem', background: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid var(--scholar-gray-200)' }}>
                    {/* Contact Info */}
                    <div>
                        <h3 style={{ marginBottom: '2rem', color: 'var(--scholar-navy-900)' }}>Get in Touch</h3>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '10px', background: 'var(--scholar-blue-100)', borderRadius: '8px', color: 'var(--scholar-blue-600)' }}><Mail size={20} /></div>
                            <div>
                                <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>Email</h4>
                                <p style={{ margin: 0, color: 'var(--scholar-gray-600)' }}>support@educompass.ai</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '10px', background: 'var(--scholar-blue-100)', borderRadius: '8px', color: 'var(--scholar-blue-600)' }}><Phone size={20} /></div>
                            <div>
                                <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>Phone</h4>
                                <p style={{ margin: 0, color: 'var(--scholar-gray-600)' }}>+1 (555) 123-4567</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '10px', background: 'var(--scholar-blue-100)', borderRadius: '8px', color: 'var(--scholar-blue-600)' }}><MapPin size={20} /></div>
                            <div>
                                <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>Office</h4>
                                <p style={{ margin: 0, color: 'var(--scholar-gray-600)' }}>123 Education Lane<br />Boston, MA 02115</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--scholar-navy-900)' }}>First Name</label>
                                <input type="text" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--scholar-gray-200)', background: 'var(--scholar-ivory)' }} placeholder="John" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--scholar-navy-900)' }}>Last Name</label>
                                <input type="text" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--scholar-gray-200)', background: 'var(--scholar-ivory)' }} placeholder="Doe" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--scholar-navy-900)' }}>Email</label>
                            <input type="email" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--scholar-gray-200)', background: 'var(--scholar-ivory)' }} placeholder="john@example.com" />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--scholar-navy-900)' }}>Message</label>
                            <textarea rows="4" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--scholar-gray-200)', background: 'var(--scholar-ivory)', resize: 'none' }} placeholder="How can we help you?"></textarea>
                        </div>

                        <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '1rem' }}>Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
