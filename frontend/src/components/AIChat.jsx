import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import '../styles/AIChat.css';

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/counsellor/chat', { message: userMsg.content });
            const data = res.data;

            // Construct AI message from structured response
            const aiMsg = {
                role: 'ai',
                content: data.ai_message || data.message,
                analysis: data.analysis,
                recommendations: data.recommendations,
                actions: data.actions_executed
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);

            let errorMessage = "Sorry, I'm having trouble right now.";
            if (err.response && err.response.data) {
                const data = err.response.data;
                errorMessage = data.error || errorMessage;

                if (data.code === 'API_KEY_MISSING') {
                    errorMessage = "⚠️ AI Service Configuration Error: The Gemini API key is not configured. Please contact the administrator.";
                } else if (data.code === 'NETWORK_ERROR') {
                    errorMessage = "🌐 Network Error: Unable to reach the AI service. Please check your internet connection.";
                } else if (data.code === 'API_ERROR') {
                    errorMessage = "⚡ AI Service Error: The AI service returned an error. Please try again later.";
                }
            }

            setMessages(prev => [...prev, {
                role: 'ai',
                content: errorMessage,
                isError: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = (msg) => {
        // Handle error messages
        if (msg.isError) {
            return (
                <div className="ai-content-wrapper error-message">
                    <p className="ai-main-text">{msg.content}</p>
                </div>
            );
        }

        return (
            <div className="ai-content-wrapper">
                {msg.analysis && (
                    <div className="ai-analysis-box">
                        <Sparkles size={14} className="icon-sparkle" />
                        <p>{msg.analysis}</p>
                    </div>
                )}

                <p className="ai-main-text">{msg.content}</p>

                {msg.recommendations && (
                    <div className="ai-recommendations">
                        {['dream', 'target', 'safe'].map(type => {
                            const items = msg.recommendations[type];
                            if (!items || items.length === 0) return null;
                            return (
                                <div key={type} className={`rec-group ${type}`}>
                                    <span className="rec-label">{type.toUpperCase()}</span>
                                    <div className="rec-chips">
                                        {items.map((u, i) => (
                                            <div key={i} className="rec-chip">
                                                {typeof u === 'string' ? u : u.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {msg.actions && msg.actions.length > 0 && (
                    <div className="ai-actions-report">
                        <div className="actions-header">Actions Taken:</div>
                        {msg.actions.map((act, i) => (
                            <div key={i} className="action-item-done">
                                <CheckCircle size={14} /> {act}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    };

    return (
        <div className={`ai-chat-widget ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={28} />
                    <div className="pulse-dot"></div>
                </button>
            )}

            {isOpen && (
                <div className="chat-window-container">
                    <div className="chat-header">
                        <div className="header-branding">
                            <div className="icon-bg"><Sparkles size={18} /></div>
                            <div className="header-text">
                                <h3>AI Counsellor</h3>
                                <span>Powered by Gemini</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
                    </div>

                    <div className="chat-body" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="empty-state">
                                <div className="bot-avatar large">🤖</div>
                                <p>Hello! I'm here to help you plan your studies abroad. I can analyze your profile, recommend universities, and manage your checklist.</p>
                                <div className="suggestions">
                                    <button onClick={() => { setInput("Analyze my profile"); handleSend(); }}>Analyze my profile</button>
                                    <button onClick={() => { setInput("Suggest safe universities in Canada"); handleSend(); }}>Suggest safe universities in Canada</button>
                                </div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-message ${m.role}`}>
                                {m.role === 'ai' && <div className="bot-avatar">🤖</div>}
                                <div className="message-bubble">
                                    {m.role === 'ai' ? renderContent(m) : <p>{m.content}</p>}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-message ai">
                                <div className="bot-avatar">🤖</div>
                                <div className="message-bubble typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="chat-footer">
                        <div className="input-box">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                disabled={loading}
                            />
                            <button onClick={handleSend} disabled={loading || !input.trim()}>
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIChat;
