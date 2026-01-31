import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Sparkles, MessageSquare, Briefcase, BookOpen, User, Zap, Globe, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import '../styles/AIChatPage.css';

// Stage ID to Enum mapping
const STAGE_ID_MAP = {
    1: 'ONBOARDING',
    2: 'ONBOARDING',
    3: 'DISCOVERY',
    4: 'SHORTLISTING',
    5: 'SHORTLISTING',
    6: 'LOCKING',
    7: 'APPLICATION'
};

const AIChatPage = () => {
    const { user, stage } = useAuth();
    const [userStatus, setUserStatus] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Welcome to your personal AI command center. I'm ready to architect your study abroad journey. What's our focus today?",
            type: 'text'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const stageEnum = userStatus?.stage || STAGE_ID_MAP[stage] || 'ONBOARDING';
    const isOnboarding = stageEnum === 'ONBOARDING';

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get('/user/status');
                setUserStatus(res.data);
            } catch (err) {
                console.error("Failed to fetch user status:", err);
            }
        };
        fetchStatus();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (msgText = input) => {
        if (!msgText.trim()) return;

        if (isOnboarding) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "🔒 Please complete your profile first to unlock AI recommendations. Click 'Complete Profile' on the dashboard.",
                type: 'warning'
            }]);
            return;
        }

        const userMsg = { role: 'user', content: msgText, type: 'text' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/ai/counsellor/chat', {
                message: msgText,
                stage: stageEnum,
                profileCompletion: userStatus?.profileCompletion || 0
            });

            const data = response.data;
            const content = data.message || data.ai_message || "I'm here to help!";

            const aiMsg = {
                role: 'assistant',
                content: content,
                type: 'text'
            };
            setMessages(prev => [...prev, aiMsg]);

            if (data.actions && data.actions.length > 0) {
                data.actions.forEach(action => {
                    if (action.type === 'ADD_SHORTLIST') {
                        setMessages(prev => [...prev, {
                            role: 'system',
                            content: `✅ Added ${action.data.uni_name} to your ${action.data.category} list.`,
                            type: 'success'
                        }]);
                    }
                    if (action.type === 'NAVIGATE') {
                        window.location.href = action.data.page;
                    }
                });
            }
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "⚠️ Connection interrupted. Resetting neural link...",
                type: 'error'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-page-container">
            <div className="chat-layout-grid">

                {/* LEFT SIDEBAR - COMMAND MENU */}
                <aside className="chat-sidebar">
                    <div className="sidebar-header">
                        <Sparkles className="icon-pulse" size={20} />
                        <h3>AI Command</h3>
                    </div>

                    <div className="suggestion-group">
                        <span className="group-title">🎯 Strategy</span>
                        <button onClick={() => handleSend("Analyze my profile and suggest specific improvements for Ivy League")}>
                            <User size={16} /> Profile Deep Dive
                        </button>
                        <button onClick={() => handleSend("What are my chances for Top 50 universities?")}>
                            <Zap size={16} /> Admission Chances
                        </button>
                    </div>

                    <div className="suggestion-group">
                        <span className="group-title">🌏 Discovery</span>
                        <button onClick={() => handleSend("Find universities in Canada with low tuition and high acceptance")}>
                            <Globe size={16} /> Budget Friendly
                        </button>
                        <button onClick={() => handleSend("Show me universities with strong CS programs")}>
                            <Cpu size={16} /> Top Programs
                        </button>
                    </div>

                    <div className="suggestion-group">
                        <span className="group-title">📝 Application</span>
                        <button onClick={() => handleSend("Help me draft a Statement of Purpose")}>
                            <BookOpen size={16} /> SOP Assistant
                        </button>
                        <button onClick={() => handleSend("What documents do I need for US Visa?")}>
                            <Briefcase size={16} /> Visa Guide
                        </button>
                    </div>
                </aside>

                {/* RIGHT MAIN - CHAT INTERFACE */}
                <main className="chat-main-panel">
                    <div className="messages-area custom-scrollbar">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`chat-bubble-row ${msg.role}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="avatar ai-avatar-glow">
                                        <Cpu size={20} />
                                    </div>
                                )}
                                <div className={`bubble ${msg.type}`}>
                                    {msg.content}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="avatar user-avatar-glass">
                                        <User size={20} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {isLoading && (
                            <div className="chat-bubble-row assistant">
                                <div className="avatar ai-avatar-glow"><Cpu size={20} /></div>
                                <div className="bubble loading">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="input-area-integrated">
                        <input
                            type="text"
                            placeholder="Ask about universities, essays, or strategy..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={() => handleSend()} disabled={!input.trim()}>
                            <Send size={18} />
                        </button>
                    </div>
                </main>

            </div>
        </div>
    );
};

export default AIChatPage;
