import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, GraduationCap, Globe, DollarSign, BrainCircuit, Sparkles } from 'lucide-react';
import api from '../utils/api';
import '../styles/OnboardingWizard.css';

// Helper Component for Dropdown with "Other" input
const SelectWithCustom = ({ label, value, options, onChange, placeholder = "Select Option" }) => {
    const isCustom = value && !options.includes(value) && value !== "Other";
    const [showCustom, setShowCustom] = React.useState(isCustom);

    const handleSelectChange = (e) => {
        const val = e.target.value;
        if (val === "Other") {
            setShowCustom(true);
            onChange(""); // Clear value for typing
        } else {
            setShowCustom(false);
            onChange(val);
        }
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <select
                value={showCustom ? "Other" : value}
                onChange={handleSelectChange}
            >
                <option value="">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
                <option value="Other">Other (Type manually)</option>
            </select>
            {showCustom && (
                <input
                    type="text"
                    className="mt-2" // Add margin top if needed
                    placeholder={`Type your ${label.toLowerCase()}...`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ marginTop: '8px' }}
                    autoFocus
                />
            )}
        </div>
    );
};

const OnboardingWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        // Step 1: Academic
        education_level: '',
        degree_major: '',
        graduation_year: '',
        gpa: '',
        school_board: '',
        // Step 2: Goals
        target_degree: '',
        target_major: '',
        target_country: '',
        // Step 3: Budget
        budget: '',
        funding_type: '',
        // Step 4: Readiness
        ielts_score: '',
        gre_score: '',
        work_experience: '',
        sat_score: '',
        act_score: '',
        // Step 5: Personal Insights
        extracurricular_activities: '',
        career_aspirations: '',
        languages_known: '',
        learning_style: '',
        preferred_university_type: ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = async () => {
        setLoading(true);
        try {
            const response = await api.post('/profile/save-step', { step, data: formData });
            const result = response.data;

            if (step < 5) {
                setStep(prev => prev + 1);

                // Trigger AI Analysis for the completed step
                window.dispatchEvent(new CustomEvent('ai-analyze', {
                    detail: { step: step, data: formData }
                }));

            } else {
                if (result.stage === 3) {
                    window.location.href = '/dashboard';
                } else {
                    navigate('/dashboard');
                }
            }

        } catch (err) {
            console.error("Failed to save step", err);
        } finally {
            setLoading(false);
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    const slideVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 }
    };

    return (
        <div className="wizard-container">
            <div className="wizard-progress">
                <div className="progress-bar" style={{ width: `${(step / 5) * 100}%` }}></div>
                <div className="steps-indicator">
                    <span className={step >= 1 ? 'active' : ''}>1. Academic</span>
                    <span className={step >= 2 ? 'active' : ''}>2. Goals</span>
                    <span className={step >= 3 ? 'active' : ''}>3. Budget</span>
                    <span className={step >= 4 ? 'active' : ''}>4. Readiness</span>
                    <span className={step >= 5 ? 'active' : ''}>5. Insights</span>
                </div>
            </div>

            <div className="wizard-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="step-card"
                    >
                        {step === 1 && <StepAcademic formData={formData} handleChange={handleChange} SelectWithCustom={SelectWithCustom} />}
                        {step === 2 && <StepGoals formData={formData} handleChange={handleChange} SelectWithCustom={SelectWithCustom} />}
                        {step === 3 && <StepBudget formData={formData} handleChange={handleChange} />}
                        {step === 4 && <StepReadiness formData={formData} handleChange={handleChange} />}
                        {step === 5 && <StepPersonalInsights formData={formData} handleChange={handleChange} SelectWithCustom={SelectWithCustom} />}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="wizard-footer">
                {step > 1 && (
                    <button className="btn-secondary" onClick={prevStep} disabled={loading}>
                        <ChevronLeft size={18} /> Back
                    </button>
                )}
                <button className="btn-primary" onClick={nextStep} disabled={loading}>
                    {loading ? 'Saving...' : step === 5 ? 'Finish Profile' : 'Next Step'}
                    {!loading && <ChevronRight size={18} />}
                </button>
                {step === 5 && (
                    <button className="btn-secondary skip-btn" onClick={() => {
                        setStep(5);
                        nextStep();
                    }} style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: '#666' }}>
                        Skip for now
                    </button>
                )}
            </div>
        </div>
    );
};

const StepAcademic = ({ formData, handleChange, SelectWithCustom }) => {
    const isHighSchool = formData.education_level === "High School";

    const boardOptions = ["CBSE", "ICSE", "IB", "State Board", "Cambridge (IGCSE/A-Level)"];
    const majorOptions = ["Computer Science", "Engineering", "Business Administration", "Commerce", "Arts & Humanities", "Medical / Health", "Law", "Social Sciences"];

    return (
        <div className="step-body">
            <div className="step-header">
                <div className="icon-bg"><GraduationCap size={32} /></div>
                <h2>Academic Background</h2>
                <p>Tell us about your most recent education.</p>
            </div>
            <div className="form-group">
                <label>Current Education Level</label>
                <select value={formData.education_level} onChange={(e) => handleChange('education_level', e.target.value)}>
                    <option value="">Select Level</option>
                    <option value="High School">High School (12th Grade)</option>
                    <option value="Bachelor's">Bachelor's Degree</option>
                    <option value="Master's">Master's Degree</option>
                </select>
            </div>

            {isHighSchool ? (
                <SelectWithCustom
                    label="School Board"
                    value={formData.school_board}
                    options={boardOptions}
                    onChange={(val) => handleChange('school_board', val)}
                    placeholder="Select Board"
                />
            ) : (
                <SelectWithCustom
                    label="Major / Stream"
                    value={formData.degree_major}
                    options={majorOptions}
                    onChange={(val) => handleChange('degree_major', val)}
                    placeholder="Select Major"
                />
            )}

            <div className="form-row">
                <div className="form-group">
                    <label>{isHighSchool ? "Completion Year" : "Graduation Year"}</label>
                    <select value={formData.graduation_year} onChange={(e) => handleChange('graduation_year', e.target.value)}>
                        <option value="">Year</option>
                        {[...Array(10)].map((_, i) => {
                            const yr = new Date().getFullYear() + 5 - i;
                            return <option key={yr} value={yr}>{yr}</option>;
                        })}
                    </select>
                </div>
                <div className="form-group">
                    <label>{isHighSchool ? "Percentage / CGPA" : "GPA / CGPA"}</label>
                    <input
                        type="text"
                        placeholder="e.g. 3.8 or 85%"
                        value={formData.gpa}
                        onChange={(e) => handleChange('gpa', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

const StepGoals = ({ formData, handleChange, SelectWithCustom }) => {
    const targetMajorOptions = ["Computer Science", "Data Science", "Artificial Intelligence", "MBA / Management", "Engineering", "Medicine", "Psychology", "Law", "Fine Arts"];
    const countryOptions = [
        "USA", "UK", "Canada", "Australia", "Germany",
        "France", "Netherlands", "Ireland", "New Zealand",
        "Singapore", "Japan", "South Korea", "Switzerland", "Italy", "Spain"
    ];

    return (
        <div className="step-body">
            <div className="step-header">
                <div className="icon-bg"><Globe size={32} /></div>
                <h2>Study Goals</h2>
                <p>What are you planning to pursue?</p>
            </div>
            <div className="form-group">
                <label>Target Degree</label>
                <div className="radio-group">
                    {['Bachelor\'s', 'Master\'s', 'MBA', 'PhD'].map(opt => (
                        <button
                            key={opt}
                            className={`radio-btn ${formData.target_degree === opt ? 'selected' : ''}`}
                            onClick={() => handleChange('target_degree', opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <SelectWithCustom
                label="Target Country"
                value={formData.target_country}
                options={countryOptions}
                onChange={(val) => handleChange('target_country', val)}
                placeholder="Select Country"
            />

            <SelectWithCustom
                label="Target Major"
                value={formData.target_major}
                options={targetMajorOptions}
                onChange={(val) => handleChange('target_major', val)}
                placeholder="Select Target Major"
            />
        </div>
    );
};

const StepBudget = ({ formData, handleChange }) => (
    <div className="step-body">
        <div className="step-header">
            <div className="icon-bg"><DollarSign size={32} /></div>
            <h2>Budget & Funding</h2>
            <p>Help us find universities that fit your finances.</p>
        </div>
        <div className="form-group">
            <label>Annual Budget (Tuition + Living)</label>
            <select value={formData.budget} onChange={(e) => handleChange('budget', e.target.value)}>
                <option value="">Select Range</option>
                <option value="< $20k">Under $20k / year</option>
                <option value="$20k - $40k">$20k - $40k / year</option>
                <option value="$40k - $60k">$40k - $60k / year</option>
                <option value="> $60k">$60k+ / year</option>
            </select>
        </div>
        <div className="form-group">
            <label>Funding Source</label>
            <div className="radio-group">
                {['Self-Funded', 'Loan', 'Scholarship', 'Mixed'].map(opt => (
                    <button
                        key={opt}
                        className={`radio-btn ${formData.funding_type === opt ? 'selected' : ''}`}
                        onClick={() => handleChange('funding_type', opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const StepReadiness = ({ formData, handleChange }) => {
    const isHighSchool = formData.education_level === "High School";

    return (
        <div className="step-body">
            <div className="step-header">
                <div className="icon-bg"><BrainCircuit size={32} /></div>
                <h2>Readiness Check</h2>
                <p>Where do you stand with your test prep?</p>
            </div>

            <div className="form-group">
                <label>English Test (IELTS/TOEFL)</label>
                <select value={formData.ielts_score} onChange={(e) => handleChange('ielts_score', e.target.value)}>
                    <option value="">Select Status</option>
                    <option value="Not Taken">Not Taken Yet</option>
                    <option value="Prepared">Prepared / Booked</option>
                    <option value="6.0 - 6.5">Score: 6.0 - 6.5</option>
                    <option value="7.0 - 7.5">Score: 7.0 - 7.5</option>
                    <option value="8.0+">Score: 8.0+</option>
                </select>
            </div>

            {isHighSchool ? (
                <>
                    <div className="form-group">
                        <label>SAT Score (Optional)</label>
                        <select value={formData.sat_score} onChange={(e) => handleChange('sat_score', e.target.value)}>
                            <option value="">Select Score Range</option>
                            <option value="Not Taken">Not Taken</option>
                            <option value="< 1200">Below 1200</option>
                            <option value="1200-1400">1200 - 1400</option>
                            <option value="1400+">1400+</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>ACT Score (Optional)</label>
                        <select value={formData.act_score} onChange={(e) => handleChange('act_score', e.target.value)}>
                            <option value="">Select Score Range</option>
                            <option value="Not Taken">Not Taken</option>
                            <option value="< 25">Below 25</option>
                            <option value="25-30">25 - 30</option>
                            <option value="30+">30+</option>
                        </select>
                    </div>
                </>
            ) : (
                <>
                    <div className="form-group">
                        <label>Aptitude Test (GRE/GMAT)</label>
                        <select value={formData.gre_score} onChange={(e) => handleChange('gre_score', e.target.value)}>
                            <option value="">Select Status</option>
                            <option value="Not Required">Not Required</option>
                            <option value="Not Taken">Not Taken Yet</option>
                            <option value="300-310">GRE: 300-310</option>
                            <option value="310-320">GRE: 310-320</option>
                            <option value="320+">GRE: 320+</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Work Experience</label>
                        <select value={formData.work_experience} onChange={(e) => handleChange('work_experience', e.target.value)}>
                            <option value="None">None (Fresher)</option>
                            <option value="< 1 Year">Less than 1 Year</option>
                            <option value="1-2 Years">1-2 Years</option>
                            <option value="3+ Years">3+ Years</option>
                        </select>
                    </div>
                </>
            )}
        </div>
    );
};

const StepPersonalInsights = ({ formData, handleChange, SelectWithCustom }) => {
    const careerOptions = [
        "Software Engineer", "Data Scientist", "Product Manager", "Entrepreneur",
        "Researcher / Academic", "Civil Services", "Management Consultant",
        "Investment Banker", "Digital Marketer", "Creative Artist / Designer",
        "Healthcare Professional", "Legal Professional"
    ];

    const languageOptions = [
        "English", "Spanish", "French", "German", "Mandarin",
        "Hindi", "Arabic", "Portuguese", "Japanese", "Russian", "Korean"
    ];

    return (
        <div className="step-body">
            <div className="step-header">
                <div className="icon-bg"><Sparkles size={32} /></div>
                <h2>Personal Insights</h2>
                <p>Tell us more about you to help us guide you better.</p>
            </div>

            <SelectWithCustom
                label="Career Aspirations"
                value={formData.career_aspirations}
                options={careerOptions}
                onChange={(val) => handleChange('career_aspirations', val)}
                placeholder="Select Career Goal"
            />

            <SelectWithCustom
                label="Primary Language"
                value={formData.languages_known}
                options={languageOptions}
                onChange={(val) => handleChange('languages_known', val)}
                placeholder="Select Language"
            />

            <div className="form-group">
                <label>Extracurricular Activities</label>
                <textarea
                    placeholder="Sports, Clubs, Volunteering, etc."
                    value={formData.extracurricular_activities}
                    onChange={(e) => handleChange('extracurricular_activities', e.target.value)}
                    rows={3}
                    className="input-textarea styled-textarea" // Added class for specific styling
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Learning Style</label>
                    <select value={formData.learning_style} onChange={(e) => handleChange('learning_style', e.target.value)}>
                        <option value="">Select Style</option>
                        <option value="Visual">Visual</option>
                        <option value="Auditory">Auditory</option>
                        <option value="Kinesthetic">Kinesthetic (Hands-on)</option>
                        <option value="Reading/Writing">Reading/Writing</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Preferred University Type</label>
                    <select value={formData.preferred_university_type} onChange={(e) => handleChange('preferred_university_type', e.target.value)}>
                        <option value="">Select Preference</option>
                        <option value="Public">Public (Large, Diverse)</option>
                        <option value="Private">Private (Smaller, Focused)</option>
                        <option value="Research">Research Intensive</option>
                        <option value="Liberal Arts">Liberal Arts</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
