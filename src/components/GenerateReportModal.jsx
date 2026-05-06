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

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#1e1e2e] border border-gray-700 rounded-xl shadow-2xl w-full max-w-[550px] overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-700 bg-[#252538] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="text-[#0066cc]" size={20} />
                            <h2 className="text-xl font-bold text-gray-100">Generate report</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Scrollable Area */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-7">
                        
                        {/* Target Info */}
                        {targetDomain && (
                            <div className="bg-[#0066cc]/10 border border-[#0066cc]/30 rounded-lg p-3 flex items-center gap-3">
                                <Settings className="text-[#0066cc]" size={18} />
                                <span className="text-[#0066cc] text-sm font-medium">Target: {targetDomain}</span>
                            </div>
                        )}

                        {/* Report Type */}
                        <div>
                            <h3 className="text-[13px] font-semibold text-gray-400 mb-3 uppercase tracking-wider">Report Type</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {['raw', 'editable'].map((type) => (
                                    <label key={type} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${reportType === type ? 'bg-[#0066cc]/20 border-[#0066cc] text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:bg-gray-800'}`}>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${reportType === type ? 'border-[#0066cc]' : 'border-gray-500'}`}>
                                            {reportType === type && <div className="w-2 h-2 rounded-full bg-[#0066cc]" />}
                                        </div>
                                        <span className="text-sm font-medium">{type === 'raw' ? 'Raw scan results' : 'Editable pentest report'}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Report Format */}
                        <div>
                            <h3 className="text-[13px] font-semibold text-gray-400 mb-3 uppercase tracking-wider">Report Format</h3>
                            <div className="flex flex-wrap gap-5">
                                {['PDF', 'HTML', 'JSON', 'CSV', 'XLSX'].map((format) => (
                                    <label key={format} className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${reportFormat === format ? 'border-[#0066cc]' : 'border-gray-500'}`}>
                                            {reportFormat === format && <div className="w-2 h-2 rounded-full bg-[#0066cc]" />}
                                        </div>
                                        <span className={`text-sm font-medium ${reportFormat === format ? 'text-white' : 'text-gray-400'}`}>{format}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Group Findings By */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-[13px] font-semibold text-gray-400 mb-3 uppercase tracking-wider">Group findings by</h3>
                            <div className="flex gap-6">
                                {['targets', 'vulnerability'].map((group) => (
                                    <label key={group} className="flex items-center gap-2 cursor-pointer">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${grouping === group ? 'border-[#0066cc]' : 'border-gray-500'}`}>
                                            {grouping === group && <div className="w-2 h-2 rounded-full bg-[#0066cc]" />}
                                        </div>
                                        <span className={`text-sm font-medium capitalize ${grouping === group ? 'text-white' : 'text-gray-400'}`}>{group}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-[13px] font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <Filter size={16} /> Filters
                            </h3>
                            <div className="space-y-3 bg-[#252538] p-4 rounded-lg border border-gray-700">
                                {[
                                    { id: 'reproduce', label: 'Include How to reproduce section' },
                                    { id: 'informational', label: 'Include Informational findings' },
                                    { id: 'falsePositives', label: 'Include False Positives findings' },
                                    { id: 'ignored', label: 'Include Ignored findings' },
                                    { id: 'notVerified', label: 'Include Not Verified findings' },
                                    { id: 'accepted', label: 'Include Accepted findings' },
                                    { id: 'fixed', label: 'Include Fixed findings' },
                                ].map((filter) => (
                                    <label key={filter.id} className="flex items-center gap-3 cursor-pointer group">
                                        <div 
                                            className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${filters[filter.id] ? 'bg-[#0066cc] border-[#0066cc]' : 'bg-transparent border-gray-500 group-hover:border-gray-400'}`}
                                            onClick={() => handleFilterChange(filter.id)}
                                        >
                                            {filters[filter.id] && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        <span className={`text-sm select-none ${filters[filter.id] ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>{filter.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Footer / Actions */}
                    <div className="px-6 py-4 border-t border-gray-700 bg-[#252538] flex items-center justify-between">
                        <button 
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 font-medium text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => onGenerate({ type: reportType, format: reportFormat, grouping, filters, target: targetDomain })}
                            className="px-6 py-2.5 rounded-lg bg-[#e3c15f] hover:bg-[#d4b355] text-gray-900 font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#e3c15f]/20 transition-all active:scale-95"
                        >
                            <Download size={16} />
                            Generate Report
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default GenerateReportModal;
