'use client'

import { ChevronDown, Database, Download, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Case {
    case_id: string;
    status?: string;
    subject?: string;
}

// Import your server action
import { getCasesS1 } from '@/Actions/server';

const Cases = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Export handler
    const handleExport = (type: 'csv' | 'txt') => {
        if (!cases.length) return;
        
        let content = '';
        let filename = '';
        
        if (type === 'csv') {
            content = 'Case ID,Status,Subject\n' +
                cases.map(c => `"${c.case_id}","${c.status || ''}","${c.subject || ''}"`).join('\n');
            filename = 'cases.csv';
        } else {
            content = cases.map(c => 
                `Case ID: ${c.case_id}\nStatus: ${c.status || 'N/A'}\nSubject: ${c.subject || 'N/A'}\n${'-'.repeat(40)}\n`
            ).join('\n');
            filename = 'cases.txt';
        }
        
        const blob = new Blob([content], { type: type === 'csv' ? 'text/csv' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDropdownOpen(false);
    };

    // Fetch cases from your server action
    const fetchCases = async () => {
        try {
            const data = await getCasesS1();
            setCases(data || []);
        } catch (err) {
            setError((err as Error).message || 'Failed to fetch cases');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            case 'in progress': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading cases...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error loading cases</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
                    <p className="text-gray-600 mt-1">Manage and view all your cases</p>
                </div>
                
                {/* Export Dropdown */}
                <div className="relative mt-4 sm:mt-0" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                        <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                                >
                                    <Database className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                                    Export as CSV
                                </button>
                                <button
                                    onClick={() => handleExport('txt')}
                                    className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                                >
                                    <FileText className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-500" />
                                    Export as TXT
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cases Table */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Case ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subject
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cases.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-lg font-medium text-gray-900 mb-1">No cases found</p>
                                            <p className="text-gray-500">There are no cases to display at the moment.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                cases.map((case_item, index) => (
                                    <tr key={case_item.case_id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{case_item.case_id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(case_item.status)}`}>
                                                {case_item.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 max-w-xs truncate" title={case_item.subject}>
                                                {case_item.subject || 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Info */}
            {cases.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                    Showing {cases.length} case{cases.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
};

export default Cases;