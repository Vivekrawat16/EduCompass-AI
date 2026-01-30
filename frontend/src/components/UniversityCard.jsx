import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Heart, Lock, Unlock, MapPin, DollarSign, TrendingUp,
    AlertTriangle, CheckCircle, Star, ExternalLink
} from 'lucide-react';
import './UniversityCard.css';

const UniversityCard = ({
    university,
    isShortlisted,
    isLocked,
    onShortlist,
    onLock,
    onUnlock,
    showEvaluation = true
}) => {
    const [showLockModal, setShowLockModal] = useState(false);
    const [showUnlockWarning, setShowUnlockWarning] = useState(false);

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Dream': return 'category-dream';
            case 'Target': return 'category-target';
            case 'Safe': return 'category-safe';
            default: return 'category-target';
        }
    };

    const getChanceBadge = (chance) => {
        switch (chance) {
            case 'High': return { color: 'chance-high', icon: '✓' };
            case 'Medium': return { color: 'chance-medium', icon: '~' };
            case 'Low': return { color: 'chance-low', icon: '!' };
            default: return { color: 'chance-medium', icon: '~' };
        }
    };

    const getCostBadge = (cost) => {
        switch (cost) {
            case 'Low': return { color: 'cost-low', label: '$' };
            case 'Medium': return { color: 'cost-medium', label: '$$' };
            case 'High': return { color: 'cost-high', label: '$$$' };
            default: return { color: 'cost-medium', label: '$$' };
        }
    };

    const handleLockClick = () => {
        if (isLocked) {
            setShowUnlockWarning(true);
        } else {
            setShowLockModal(true);
        }
    };

    const confirmLock = () => {
        onLock(university.id);
        setShowLockModal(false);
    };

    const confirmUnlock = () => {
        onUnlock(university.id);
        setShowUnlockWarning(false);
    };

    const chanceBadge = getChanceBadge(university.acceptanceChance);
    const costBadge = getCostBadge(university.costLevel);

    return (
        <>
            <motion.div
                className={`uni-card ${isLocked ? 'locked' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
            >
                {/* Category Badge */}
                <div className={`category-badge ${getCategoryColor(university.category)}`}>
                    <Star size={12} />
                    {university.category}
                </div>

                {/* Header */}
                <div className="uni-card-header">
                    <h3>{university.name}</h3>
                    <div className="uni-meta">
                        <span><MapPin size={14} /> {university.country}</span>
                        <span className="ranking">#{university.ranking}</span>
                    </div>
                </div>

                {/* Evaluation Section */}
                {showEvaluation && (
                    <div className="uni-evaluation">
                        {/* Match Reasons */}
                        {university.matchReasons?.length > 0 && (
                            <div className="eval-section match-reasons">
                                <h4><CheckCircle size={14} /> Why it fits</h4>
                                <ul>
                                    {university.matchReasons.map((reason, i) => (
                                        <li key={i}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Risks */}
                        {university.risks?.length > 0 && (
                            <div className="eval-section risks">
                                <h4><AlertTriangle size={14} /> Key Risks</h4>
                                <ul>
                                    {university.risks.map((risk, i) => (
                                        <li key={i}>{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Badges Row */}
                        <div className="eval-badges">
                            <div className={`eval-badge ${chanceBadge.color}`}>
                                <TrendingUp size={12} />
                                <span>Chance: {university.acceptanceChance}</span>
                            </div>
                            <div className={`eval-badge ${costBadge.color}`}>
                                <DollarSign size={12} />
                                <span>Cost: {university.costLevel}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="uni-card-actions">
                    <button
                        className={`action-btn shortlist ${isShortlisted ? 'active' : ''}`}
                        onClick={() => onShortlist(university.id)}
                    >
                        <Heart size={18} fill={isShortlisted ? 'currentColor' : 'none'} />
                        {isShortlisted ? 'Saved' : 'Save'}
                    </button>

                    <button
                        className={`action-btn lock ${isLocked ? 'locked' : ''}`}
                        onClick={handleLockClick}
                    >
                        {isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                        {isLocked ? 'Unlock' : 'Lock for Application'}
                    </button>
                </div>

                {university.website && (
                    <a href={university.website} target="_blank" rel="noopener noreferrer" className="uni-link">
                        Visit Website <ExternalLink size={12} />
                    </a>
                )}
            </motion.div>

            {/* Lock Confirmation Modal */}
            {showLockModal && (
                <div className="modal-overlay" onClick={() => setShowLockModal(false)}>
                    <motion.div
                        className="lock-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <Lock size={32} className="modal-icon" />
                        <h3>Lock {university.name}?</h3>
                        <p>
                            Locking this university means you're committed to applying here.
                            This will unlock application guidance and strategy tailored to this university.
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowLockModal(false)}>
                                Cancel
                            </button>
                            <button className="modal-btn confirm" onClick={confirmLock}>
                                Yes, Lock It
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Unlock Warning Modal */}
            {showUnlockWarning && (
                <div className="modal-overlay" onClick={() => setShowUnlockWarning(false)}>
                    <motion.div
                        className="lock-modal warning"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <AlertTriangle size={32} className="modal-icon warning" />
                        <h3>Unlock {university.name}?</h3>
                        <p>
                            <strong>Warning:</strong> Unlocking will remove this university from your
                            application strategy. Any guidance progress may be lost.
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowUnlockWarning(false)}>
                                Keep Locked
                            </button>
                            <button className="modal-btn danger" onClick={confirmUnlock}>
                                Yes, Unlock It
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default UniversityCard;
