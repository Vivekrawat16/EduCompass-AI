import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, CheckSquare, Clock, ExternalLink, Sparkles } from 'lucide-react';
import './ApplicationGuidance.css';

const ApplicationGuidance = ({ university }) => {
    if (!university) {
        return (
            <div className="guidance-empty">
                <Sparkles size={32} />
                <h3>Lock a University to Begin</h3>
                <p>Once you lock at least one university, application guidance will appear here.</p>
            </div>
        );
    }

    // Generate AI-powered guidance based on university
    const documents = [
        { name: 'Statement of Purpose (SOP)', status: 'pending', priority: 'high' },
        { name: 'Letters of Recommendation (2-3)', status: 'pending', priority: 'high' },
        { name: 'Academic Transcripts', status: 'pending', priority: 'high' },
        { name: 'English Proficiency Score (IELTS/TOEFL)', status: 'pending', priority: 'medium' },
        { name: 'GRE/GMAT Score (if required)', status: 'pending', priority: 'medium' },
        { name: 'Financial Documents', status: 'pending', priority: 'medium' },
        { name: 'Passport Copy', status: 'pending', priority: 'low' },
        { name: 'Resume/CV', status: 'pending', priority: 'low' }
    ];

    const timeline = [
        { month: 'Month 1', tasks: ['Finalize SOP draft', 'Request recommendation letters', 'Order transcripts'] },
        { month: 'Month 2', tasks: ['Prepare for standardized tests', 'Research scholarships', 'Complete application forms'] },
        { month: 'Month 3', tasks: ['Submit applications', 'Track application status', 'Prepare for interviews'] }
    ];

    const aiTasks = [
        { id: 1, title: 'Write SOP for ' + university.name, type: 'SOP', status: 'pending' },
        { id: 2, title: 'Schedule IELTS/TOEFL exam', type: 'Exam', status: 'pending' },
        { id: 3, title: 'Complete application form', type: 'Form', status: 'pending' },
        { id: 4, title: 'Prepare financial proof', type: 'Document', status: 'pending' }
    ];

    return (
        <motion.div
            className="guidance-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="guidance-header">
                <div>
                    <h2>Application Guidance</h2>
                    <p className="guidance-subtitle">For {university.name}</p>
                </div>
                <span className="ai-badge">
                    <Sparkles size={14} />
                    AI Generated
                </span>
            </div>

            <div className="guidance-grid">
                {/* Required Documents */}
                <div className="guidance-card documents">
                    <h3><FileText size={18} /> Required Documents</h3>
                    <ul className="doc-list">
                        {documents.map((doc, i) => (
                            <li key={i} className={`doc-item priority-${doc.priority}`}>
                                <span className="doc-name">{doc.name}</span>
                                <span className={`priority-badge ${doc.priority}`}>
                                    {doc.priority}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Timeline */}
                <div className="guidance-card timeline">
                    <h3><Calendar size={18} /> High-Level Timeline</h3>
                    <div className="timeline-list">
                        {timeline.map((phase, i) => (
                            <div key={i} className="timeline-phase">
                                <div className="phase-header">
                                    <Clock size={14} />
                                    <span>{phase.month}</span>
                                </div>
                                <ul>
                                    {phase.tasks.map((task, j) => (
                                        <li key={j}>{task}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Tasks */}
                <div className="guidance-card tasks">
                    <h3><CheckSquare size={18} /> AI-Generated Tasks</h3>
                    <div className="task-list">
                        {aiTasks.map(task => (
                            <div key={task.id} className="task-item">
                                <div className="task-checkbox"></div>
                                <div className="task-info">
                                    <span className="task-title">{task.title}</span>
                                    <span className="task-type">{task.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="guidance-footer">
                <p>
                    <strong>Note:</strong> This guidance is AI-generated based on typical requirements.
                    Always verify with the official university website.
                </p>
                {university.website && (
                    <a href={university.website} target="_blank" rel="noopener noreferrer">
                        Visit Official Website <ExternalLink size={14} />
                    </a>
                )}
            </div>
        </motion.div>
    );
};

export default ApplicationGuidance;
