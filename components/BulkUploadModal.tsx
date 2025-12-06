
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Priority, Status } from '../types';

interface BulkUploadModalProps {
  onImport: (data: any[]) => void;
  onCancel: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onImport, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        if (jsonData.length === 0) {
          setError('The uploaded file is empty.');
          setPreviewData([]);
          return;
        }

        // Map and Clean Data
        const mappedData = jsonData.map((row: any) => {
            // Helper to find key case-insensitively
            const findKey = (keys: string[]) => {
                const rowKeys = Object.keys(row);
                for (const k of keys) {
                   const match = rowKeys.find(rk => rk.toLowerCase().includes(k.toLowerCase()) || rk.toLowerCase() === k.toLowerCase());
                   if (match) return row[match];
                }
                return '';
            };

            const title = findKey(['title', 'test case', 'scenario', 'summary', 'name']);
            const description = findKey(['description', 'expected', 'steps', 'behavior']);
            const rawPriority = findKey(['priority']);
            const menuUsed = findKey(['menu', 'module', 'path']);
            const testData = findKey(['data', 'input', 'values']);

            // If no title, skip (or generate placeholder, but skipping is safer)
            if (!title) return null;

            // Normalize Priority
            let priority = Priority.Medium;
            if (rawPriority) {
                const p = String(rawPriority).toLowerCase();
                if (p.includes('high')) priority = Priority.High;
                else if (p.includes('low')) priority = Priority.Low;
            }

            return {
                title: String(title),
                description: String(description || ''),
                priority,
                status: Status.Pending,
                menuUsed: String(menuUsed || ''),
                testData: String(testData || ''),
                observedBehaviour: '',
                screenshotRef: '',
                suggestions: ''
            };
        }).filter(item => item !== null);

        if (mappedData.length === 0) {
            setError('Could not identify any valid test cases. Ensure columns like "Title" or "Scenario" exist.');
        }

        setPreviewData(mappedData);

      } catch (err) {
        console.error(err);
        setError('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleImportConfirm = () => {
      if (previewData.length > 0) {
          onImport(previewData);
      }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onCancel}
    >
      <div 
        className="bg-gray-950 p-8 rounded-xl shadow-2xl border border-gray-800 w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <span className="text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
                Bulk Upload Test Cases
            </h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {error && <div className="bg-rose-500/20 text-rose-300 p-3 rounded-md mb-4 text-center text-sm">{error}</div>}

        {!previewData.length ? (
            <div 
                className={`flex-grow border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-12 transition-colors cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-indigo-400 hover:bg-gray-900'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                />
                <div className="bg-gray-800 p-4 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-lg font-medium text-white mb-2">Click to upload or drag and drop</p>
                <p className="text-gray-500 text-sm">Excel (.xlsx) or CSV files supported</p>
                <div className="mt-6 text-xs text-gray-500 bg-gray-900 p-3 rounded border border-gray-800 max-w-md text-center">
                    <p className="font-bold mb-1">Tip: We'll try to auto-detect columns like:</p>
                    <p>Title, Description, Expected Result, Menu, Priority, Test Data</p>
                </div>
            </div>
        ) : (
            <div className="flex-grow flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2 px-1">
                    <p className="text-sm text-gray-400">Found <span className="text-white font-bold">{previewData.length}</span> valid records in <span className="text-indigo-300">{file?.name}</span></p>
                    <button onClick={() => setPreviewData([])} className="text-xs text-rose-400 hover:underline">Remove File</button>
                </div>
                <div className="flex-grow overflow-auto border border-gray-800 rounded-lg bg-gray-900/30">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-900 text-xs uppercase text-gray-400 sticky top-0">
                            <tr>
                                <th className="p-3">#</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Priority</th>
                                <th className="p-3">Menu</th>
                                <th className="p-3">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
                            {previewData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-800/50">
                                    <td className="p-3 text-gray-500 font-mono text-xs">{idx + 1}</td>
                                    <td className="p-3 font-medium text-white">{item.title}</td>
                                    <td className="p-3">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${
                                            item.priority === Priority.High ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                                            item.priority === Priority.Medium ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                                            'border-sky-500/30 text-sky-400 bg-sky-500/10'
                                        }`}>
                                            {item.priority}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono text-xs text-gray-400">{item.menuUsed || '-'}</td>
                                    <td className="p-3 text-gray-500 truncate max-w-xs">{item.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        <div className="mt-6 flex justify-end gap-4 pt-4 border-t border-gray-800">
             <button
                onClick={onCancel}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 px-6 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleImportConfirm}
                disabled={previewData.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Import {previewData.length > 0 ? `${previewData.length} Records` : ''}
            </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
