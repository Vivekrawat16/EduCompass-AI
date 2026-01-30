import React from 'react';
import { Sparkles } from 'lucide-react';
import './StageStyles.css';

const STAGE_LABELS = {
    ONBOARDING: 'Stage 1: Building Profile',
    DISCOVERY: 'Stage 2: Discovering Universities',
    SHORTLISTING: 'Stage 3: Shortlisting Universities',
    LOCKING: 'Stage 4: Finalizing Universities',
    APPLICATION: 'Stage 5: Application Preparation'
};

const StageBadge = ({ stage, stageNumber }) => {
    const label = STAGE_LABELS[stage] || 'Unknown Stage';

    return (
        <div className={`stage-badge stage-${stage?.toLowerCase()}`}>
            <Sparkles size={14} />
            <span>{label}</span>
        </div>
    );
};

export default StageBadge;
