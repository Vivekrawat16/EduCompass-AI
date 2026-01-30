import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Calendar, FileText, MoreHorizontal, Plus, Globe, LayoutDashboard, Search, Kanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileMenu from '../components/ProfileMenu';
import ApplicationGuidance from '../components/ApplicationGuidance';
import '../styles/ApplicationTracker.css';

const COLUMNS = [
    { id: 'Draft', title: 'Drafting' },
    { id: 'Applied', title: 'Applied' },
    { id: 'Interview', title: 'Interview' },
    { id: 'Result', title: 'Decision' }
];

// Draggable Card Component
const DraggableCard = ({ app }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: app.application_id.toString(),
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="kanban-card">
            <div className="card-top">
                <span className="uni-name">{app.university_name}</span>
                <span className={`rank-badge`}>#{app.ranking}</span>
            </div>
            <div className="card-meta">
                <div className="meta-row">
                    <Calendar size={14} />
                    <span>{app.deadline ? new Date(app.deadline).toLocaleDateString() : 'No Deadline'}</span>
                </div>
                <div className="meta-row">
                    <FileText size={14} />
                    <span>{app.country}</span>
                </div>
            </div>
        </div>
    );
};

// Droppable Column Component
const KanBanColumn = ({ id, title, apps }) => {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="kanban-column">
            <div className="column-header">
                <h3>{title}</h3>
                <span className="count">{apps.length}</span>
            </div>
            <div ref={setNodeRef} className="column-body">
                {apps.map(app => (
                    <DraggableCard key={app.application_id} app={app} />
                ))}
                {apps.length === 0 && <div className="empty-slot">Drop here</div>}
            </div>
        </div>
    );
};

const ApplicationTracker = () => {
    const [applications, setApplications] = useState([]);
    const [lockedUniversities, setLockedUniversities] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [selectedLocked, setSelectedLocked] = useState(null);

    const fetchApps = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/applications', { credentials: 'include' });
            const data = await res.json();
            setApplications(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLocked = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/lock/all', { credentials: 'include' });
            const data = await res.json();
            setLockedUniversities(data);
            if (data.length > 0 && !selectedLocked) {
                setSelectedLocked(data[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchApps();
        fetchLocked();
    }, []);

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return;

        const appId = active.id;
        const newStatus = over.id;

        // Optimistic Update
        const updatedApps = applications.map(app => {
            if (app.application_id.toString() === appId) {
                return { ...app, status: newStatus };
            }
            return app;
        });

        setApplications(updatedApps);

        // API Call
        try {
            await fetch(`http://localhost:5000/api/applications/${appId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include'
            });
        } catch (err) {
            console.error("Failed to update status", err);
            fetchApps(); // Revert
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
                    <Link to="/discovery" className="nav-link">
                        <Search size={18} />
                        <span>Discovery</span>
                    </Link>
                    <Link to="/tracker" className="nav-link active">
                        <Kanban size={18} />
                        <span>Tracker</span>
                    </Link>
                </div>
                <ProfileMenu />
            </nav>

            <div className="tracker-container">
                <header className="tracker-header">
                    <h1>Application Tracker</h1>
                    <button className="add-btn"><Plus size={18} /> Add Manual</button>
                </header>

                <DndContext onDragEnd={handleDragEnd}>
                    <div className="kanban-board">
                        {COLUMNS.map(col => (
                            <KanBanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                apps={applications.filter(a => a.status === col.id || (col.id === 'Draft' && !a.status))}
                            />
                        ))}
                    </div>
                </DndContext>

                {/* Locked Universities & Application Guidance */}
                <section className="guidance-section">
                    <h2>📚 Application Guidance</h2>

                    {lockedUniversities.length > 0 ? (
                        <>
                            {/* Locked University Tabs */}
                            <div className="locked-tabs">
                                {lockedUniversities.map(uni => (
                                    <button
                                        key={uni.id}
                                        className={`locked-tab ${selectedLocked?.id === uni.id ? 'active' : ''}`}
                                        onClick={() => setSelectedLocked(uni)}
                                    >
                                        {uni.name}
                                    </button>
                                ))}
                            </div>

                            {/* Guidance Panel */}
                            <ApplicationGuidance university={selectedLocked} />
                        </>
                    ) : (
                        <ApplicationGuidance university={null} />
                    )}
                </section>
            </div>
        </div>
    );
};

export default ApplicationTracker;
