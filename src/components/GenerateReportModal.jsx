import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileText, CheckCircle, Settings, Filter } from 'lucide-react';

const GenerateReportModal = ({ isOpen, onClose, onGenerate, targetDomain }) => {
    const [reportType, setReportType] = useState('raw');
    const [reportFormat, setReportFormat] = useState('PDF');
    const [grouping, setGrouping] = useState('targets');
    
    const [filters, setFilters] = useState({
        reproduce: false,
        informational: true,
        falsePositives: false,
        ignored: false,
        notVerified: true,
        accepted: true,
        fixed: true
    });

    const handleFilterChange = (filterName) => {
        setFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
    };

    if (!isOpen) return null;

    // --- Premium Styling Definitions ---
    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 4, 6, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    };

    const modalStyle = {
        background: '#060d12',
        border: '1px solid #00ff8844',
        borderRadius: '12px',
        boxShadow: '0 0 35px rgba(0, 255, 136, 0.15)',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#fff',
        fontFamily: 'Share Tech Mono, monospace',
    };

    const headerStyle = {
        padding: '16px 24px',
        borderBottom: '1px solid #00ff8822',
        background: '#0a1520',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
    };

    const sectionTitleStyle = {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '11px',
        color: '#7a9a8a',
        letterSpacing: '1.5px',
        marginBottom: '10px',
        textTransform: 'uppercase',
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                style={overlayStyle}
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    style={modalStyle}
                >
                    {/* Header */}
                    <div style={{ ...headerStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FileText style={{ color: '#00ff88' }} size={20} />
                            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>GENERATE REPORT</h2>
                        </div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#7a9a8a', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                            <X size={20} onMouseEnter={e => e.currentTarget.style.color = '#ff3355'} onMouseLeave={e => e.currentTarget.style.color = '#7a9a8a'} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Target Info */}
                        {targetDomain && (
                            <div style={{ background: 'rgba(0, 170, 255, 0.08)', border: '1px solid rgba(0, 170, 255, 0.25)', borderRadius: '6px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Settings style={{ color: '#00aaff' }} size={16} />
                                <span style={{ color: '#00aaff', fontSize: '13px', fontWeight: '500' }}>Active Target Scope: <strong style={{ color: '#fff' }}>{targetDomain}</strong></span>
                            </div>
                        )}

                        {/* Report Type */}
                        <div>
                            <h3 style={sectionTitleStyle}>Report Type</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[
                                    { id: 'raw', title: 'Raw scan results', desc: 'Direct technical checks' },
                                    { id: 'editable', title: 'Editable pentest report', desc: 'Curated executive view' }
                                ].map((type) => (
                                    <label key={type.id} 
                                        onClick={() => setReportType(type.id)}
                                        style={{ 
                                            display: 'flex', flexDirection: 'column', gap: '6px', padding: '14px', borderRadius: '8px', border: reportType === type.id ? '1px solid #00ff88' : '1px solid #0a2a1a', 
                                            background: reportType === type.id ? 'rgba(0, 255, 136, 0.05)' : '#0a1520', cursor: 'pointer', transition: 'all 0.2s' 
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: reportType === type.id ? '1px solid #00ff88' : '1px solid #7a9a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {reportType === type.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88' }} />}
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: reportType === type.id ? '#00ff88' : '#fff' }}>{type.title}</span>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#7a9a8a', paddingLeft: '24px' }}>{type.desc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Report Format */}
                        <div>
                            <h3 style={sectionTitleStyle}>Report Format</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {['PDF', 'HTML', 'JSON', 'CSV', 'XLSX'].map((format) => (
                                    <label key={format} 
                                        onClick={() => setReportFormat(format)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: reportFormat === format ? '1px solid #00ff88' : '1px solid #7a9a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {reportFormat === format && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88' }} />}
                                        </div>
                                        <span style={{ fontSize: '13px', color: reportFormat === format ? '#00ff88' : '#7a9a8a', fontWeight: 'bold' }}>{format}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Group Findings By */}
                        <div>
                            <h3 style={sectionTitleStyle}>Group findings by</h3>
                            <div style={{ display: 'flex', gap: '24px' }}>
                                {['targets', 'vulnerability'].map((group) => (
                                    <label key={group} 
                                        onClick={() => setGrouping(group)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: grouping === group ? '1px solid #00ff88' : '1px solid #7a9a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {grouping === group && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88' }} />}
                                        </div>
                                        <span style={{ fontSize: '13px', color: grouping === group ? '#00ff88' : '#7a9a8a', textTransform: 'capitalize', fontWeight: 'bold' }}>{group}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Filters */}
                        <div>
                            <h3 style={{ ...sectionTitleStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Filter size={14} style={{ color: '#00ff88' }} /> Filters
                            </h3>
                            <div style={{ background: '#0a1520', border: '1px solid #0a2a1a', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { id: 'reproduce', label: 'Include "How to reproduce" section' },
                                    { id: 'informational', label: 'Include Informational findings' },
                                    { id: 'falsePositives', label: 'Include False Positives findings' },
                                    { id: 'ignored', label: 'Include Ignored findings' },
                                    { id: 'notVerified', label: 'Include Not Verified findings' },
                                    { id: 'accepted', label: 'Include Accepted findings' },
                                    { id: 'fixed', label: 'Include Fixed findings' },
                                ].map((filter) => (
                                    <div key={filter.id} 
                                        onClick={() => handleFilterChange(filter.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                    >
                                        <div style={{ 
                                            width: '18px', height: '18px', borderRadius: '4px', border: filters[filter.id] ? '1px solid #00ff88' : '1px solid #7a9a8a', 
                                            background: filters[filter.id] ? 'rgba(0, 255, 136, 0.1)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                        }}>
                                            {filters[filter.id] && <CheckCircle size={12} style={{ color: '#00ff88' }} />}
                                        </div>
                                        <span style={{ fontSize: '12px', color: filters[filter.id] ? '#fff' : '#7a9a8a', userSelect: 'none' }}>{filter.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #0a2a1a', background: '#0a1520', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button 
                            onClick={onClose}
                            style={{ 
                                background: 'transparent', border: '1px solid #0a2a1a', borderRadius: '6px', padding: '10px 20px', 
                                color: '#7a9a8a', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' 
                            }}
                            onMouseEnter={e => { e.target.style.borderColor = '#ff3355'; e.target.style.color = '#ff3355' }}
                            onMouseLeave={e => { e.target.style.borderColor = '#0a2a1a'; e.target.style.color = '#7a9a8a' }}
                        >
                            CANCEL
                        </button>
                        <button 
                            onClick={() => onGenerate({ type: reportType, format: reportFormat, grouping, filters, target: targetDomain })}
                            style={{ 
                                background: '#00ff88', border: 'none', borderRadius: '6px', padding: '10px 24px', 
                                color: '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)' 
                            }}
                            onMouseEnter={e => e.target.style.background = '#00cc66'}
                            onMouseLeave={e => e.target.style.background = '#00ff88'}
                        >
                            <Download size={14} />
                            GENERATE REPORT
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GenerateReportModal;
