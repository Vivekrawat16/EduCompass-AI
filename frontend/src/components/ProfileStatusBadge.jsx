import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import './StageStyles.css';

const ProfileStatusBadge = ({ status, completion }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'COMPLETE':
                return { icon: CheckCircle, color: 'green', text: 'Profile Complete' };
            case 'PARTIAL':
                return { icon: Clock, color: 'yellow', text: 'Partially Complete' };
            default:
                return { icon: AlertCircle, color: 'red', text: 'Incomplete' };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className="profile-status-container">
            <div className={`profile-status-badge status-${config.color}`}>
                <Icon size={14} />
                <span>{config.text}</span>
            </div>
            <div className="profile-completion-bar">
                <div
                    className="profile-completion-fill"
                    style={{ width: `${completion}%` }}
                />
                <span className="profile-completion-text">{completion}%</span>
            </div>
        </div>
    );
};

export default ProfileStatusBadge;
