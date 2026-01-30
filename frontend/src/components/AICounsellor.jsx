import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, Sparkles, X, ChevronRight, MessageSquare, Briefcase, BookOpen, User, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/AICounsellor.css';

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

const AICounsellor = () => {
    const { user, stage } = useAuth();
    const [isOpen, setIsOpen] = useState(true); // Open by default on desktop
    const [userStatus, setUserStatus] = useState(null);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your AI Counsellor. I can help you find universities, review your profile, or plan your application strategy. What's on your mind?",
            type: 'text'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Determine current stage enum
    const stageEnum = userStatus?.stage || STAGE_ID_MAP[stage] || 'ONBOARDING';
    const isOnboarding = stageEnum === 'ONBOARDING';

    // Fetch user status on mount
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/user/status', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setUserStatus(data);
                }
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

    // Listen for Onboarding Triggers
    useEffect(() => {
        const handleAIAnalyze = (event) => {
            const { step, data } = event.detail;
            setIsOpen(true); // Auto-open panel

            // Construct a natural language prompt for the AI based on the step
            let prompt = "";
            if (step === 1) prompt = `I just entered my academic details: Level ${data.education_level}, GPA ${data.gpa}. What do you think?`;
            if (step === 2) prompt = `I'm targeting ${data.target_country} for ${data.target_degree} in ${data.target_major}. Any advice?`;
            if (step === 3) prompt = `My budget is ${data.budget} and I'm looking for ${data.funding_type}. is this realistic?`;

            if (prompt) {
                handleSend(prompt, true); // true = hidden user message (simulated system trigger)
            }
        };

        window.addEventListener('ai-analyze', handleAIAnalyze);
        return () => window.removeEventListener('ai-analyze', handleAIAnalyze);
    }, []);

    const handleSend = async (msgText = input, isSystemTrigger = false) => {
        if (!msgText.trim()) return;

        // Block AI if in onboarding stage
        if (isOnboarding && !isSystemTrigger) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "🔒 Please complete your profile first to unlock AI recommendations. Click 'Complete Profile' on the dashboard.",
                type: 'warning'
            }]);
            return;
        }

        // If it's a user typing, show their message. If it's a system trigger, maybe show it differently or just show the response.
        // For now, let's show it as a user message to make the "Conversation" flow natural.
        const userMsg = { role: 'user', content: msgText, type: 'text' };
        setMessages(prev => [...prev, userMsg]);

        if (!isSystemTrigger) setInput(''); // Only clear input if user typed it
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/counsellor/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msgText,
                    stage: stageEnum,  // Pass stage to AI
                    profileCompletion: userStatus?.profileCompletion || 0
                }),
                credentials: 'include'
            });

            const data = await response.json();

            // Handle Response (Message) - clean display
            const content = data.message || data.ai_message || "I'm here to help!";

            const aiMsg = {
                role: 'assistant',
                content: content,
                type: 'text'
            };
            setMessages(prev => [...prev, aiMsg]);

            // Handle Actions (Task Engine)
            if (data.actions && data.actions.length > 0) {
                console.log("🚀 AI Actions Executed:", data.actions);

                // Show visual feedback for each action
                data.actions.forEach(action => {
                    if (action.type === 'ADD_SHORTLIST') {
                        // We could show a custom toast here
                        const toastMsg = {
                            role: 'system',
                            content: `✅ Added ${action.data.uni_name} to your ${action.data.category} list.`,
                            type: 'success'
                        };
                        setMessages(prev => [...prev, toastMsg]);
                    }
                    if (action.type === 'NAVIGATE') {
                        // Frontend Navigation
                        window.location.href = action.data.page;
                    }
                });
            }

            setIsLoading(false);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "⚠️ My brain is offline (Backend Error). Please check the server.",
                type: 'error'
            }]);
            setIsLoading(false);
        }
    };

    const togglePanel = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Toggle Button (Visible when closed) */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="ai-toggle-btn"
                        onClick={togglePanel}
                    >
                        <MessageSquare size={18} />
                        <span>Chat with AI</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Main Panel */}
            <motion.div
                className={`ai-panel ${isOpen ? 'open' : 'closed'}`}
                initial={{ x: 450 }} // Start off-screen right
                animate={{ x: isOpen ? 0 : 450 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                {/* Header */}
                <div className="ai-header">
                    <div className="ai-title">
                        <div className="ai-avatar">
                            <Sparkles size={18} color="#fff" />
                        </div>
                        <div>
                            <h3>EduCompass AI</h3>
                            <span className="status-badge">Online</span>
                        </div>
                    </div>
                    <button onClick={togglePanel} className="close-btn">
                        {isOpen ? <ChevronRight size={20} /> : <X size={20} />}
                    </button>
                </div>

                {/* Chat Area */}
                <div className="ai-chat-area">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <div className="msg-bubble">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message assistant">
                            <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions / Quick Actions */}
                <div className="ai-suggestions">
                    <button className="suggestion-pill" onClick={() => handleSend("How can I improve my profile to get into better universities?")}>
                        <User size={14} /> Improve Profile
                    </button>
                    <button className="suggestion-pill" onClick={() => handleSend("Show me universities that match my profile")}>
                        <BookOpen size={14} /> University List
                    </button>
                    <button className="suggestion-pill" onClick={() => handleSend("Help me find scholarships for my target universities")}>
                        <Briefcase size={14} /> Scholarship Help
                    </button>
                </div>

                {/* Input Area */}
                <div className="ai-input-area">
                    <input
                        type="text"
                        placeholder="Ask me anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()}>
                        <Send size={18} />
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default AICounsellor;
