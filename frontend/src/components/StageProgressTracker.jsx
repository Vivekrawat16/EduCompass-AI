import React from 'react';
import { User, Search, Target, Lock, FileText, Check } from 'lucide-react';
import './StageStyles.css';

const stages = [
    { id: 'ONBOARDING', label: 'Profile Built', icon: User },
    { id: 'DISCOVERY', label: 'Universities Discovered', icon: Search },
    { id: 'SHORTLISTING', label: 'Shortlisting', icon: Target },
    { id: 'LOCKING', label: 'Locking', icon: Lock },
    { id: 'APPLICATION', label: 'Applications', icon: FileText }
];

const StageProgressTracker = ({ currentStage }) => {
    const currentIndex = stages.findIndex(s => s.id === currentStage);

    return (
        <div className="stage-progress-tracker">
            {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isPending = index > currentIndex;

                return (
                    <div key={stage.id} className="stage-step-container">
                        <div className={`stage-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}>
                            <div className="stage-icon">
                                {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                            </div>
                            <span className="stage-label">{stage.label}</span>
                        </div>
                        {index < stages.length - 1 && (
                            <div className={`stage-connector ${isCompleted ? 'completed' : ''}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StageProgressTracker;
