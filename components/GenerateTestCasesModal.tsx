import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Priority, Status } from '../types';

type GeneratedCase = {
    title: string;
    description: string;
    priority: Priority;
};

type TestCaseData = GeneratedCase & { status: Status };

interface GenerateTestCasesModalProps {
    onAddTestCases: (testCases: TestCaseData[]) => void;
    onCancel: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center">
        <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const priorityColorMap: Record<Priority, string> = {
  [Priority.High]: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  [Priority.Medium]: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  [Priority.Low]: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
};


const GenerateTestCasesModal: React.FC<GenerateTestCasesModalProps> = ({ onAddTestCases, onCancel }) => {
    const [userPrompt, setUserPrompt] = useState('');
    const [numCases, setNumCases] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedCases, setGeneratedCases] = useState<GeneratedCase[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userPrompt.trim()) {
            setError('Please enter a feature description.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedCases([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: 'A concise, descriptive title for the test case (e.g., "Verify successful login with valid credentials").' },
                      description: { type: Type.STRING, description: 'Bulleted list of detailed steps to perform the test. Include preconditions, steps, and expected results. Use markdown for lists.' },
                      priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: 'The priority of the test case.' },
                    },
                    required: ['title', 'description', 'priority'],
                },
            };

            const prompt = `Based on the following feature description, generate exactly ${numCases} distinct software test cases.
            Feature to test: "${userPrompt}"
            For each test case, provide a unique title, a detailed description (using markdown for bulleted lists of steps), and a priority.
            Ensure the test cases cover a mix of positive scenarios (happy paths), negative scenarios (error conditions), and edge cases.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });

            const parsed = JSON.parse(response.text);
            if (!Array.isArray(parsed)) {
                throw new Error("AI returned an unexpected data format.");
            }
            setGeneratedCases(parsed);
            setSelectedIndices(new Set(parsed.map((_, index) => index)));

        } catch (err: any) {
            console.error(err);
            setError(`An error occurred: ${err.message || 'Failed to generate test cases.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSelection = (index: number) => {
        setSelectedIndices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
            return newSet;
        });
    };

    const handleAddSelected = () => {
        const casesToAdd = generatedCases
            .filter((_, index) => selectedIndices.has(index))
            .map(c => ({
                ...c,
                status: Status.NotStarted,
            }));
        onAddTestCases(casesToAdd);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fade-in" onClick={onCancel}>
            <div className="bg-gray-950 p-6 rounded-xl shadow-2xl border border-gray-800 w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                        <span className="text-teal-400">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.628 2.034a1 1 0 011.744 0l1.494 2.936m-5.321-1.493a1 1 0 011.493 1.493L6 8.5l-2.936 1.494a1 1 0 01-1.493-1.493L4.5 6l-1.493-2.936a1 1 0 011.493-1.493L6 3.5l1.064-2.007zM16 8.5a1 1 0 00-1.493-1.493L13.5 6l-1.436-1.064a1 1 0 00-1.493 1.493L12 8.5l-1.494 2.936a1 1 0 001.493 1.493L13.5 12l1.064 2.007a1 1 0 001.493-1.493L14.5 10.5l2.936-1.494a1 1 0 00.564-1.506z" clipRule="evenodd" /></svg>
                        </span>
                        Generate Test Cases with AI
                    </h2>
                    <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {error && <div className="bg-rose-500/20 text-rose-300 p-3 rounded-md my-4 text-center text-sm">{error}</div>}
                
                {generatedCases.length === 0 && !isLoading && (
                    <form onSubmit={handleGenerate} className="space-y-6 animate-fade-in">
                        <div>
                            <label htmlFor="feature-prompt" className="block text-sm font-medium text-gray-300 mb-1">Feature to Test</label>
                            <textarea
                                id="feature-prompt"
                                value={userPrompt}
                                onChange={e => setUserPrompt(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 h-28 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                placeholder="e.g., User password reset flow via email link"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="num-cases" className="block text-sm font-medium text-gray-300 mb-1">Number of Test Cases to Generate</label>
                            <input
                                type="number"
                                id="num-cases"
                                value={numCases}
                                onChange={e => setNumCases(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-24 bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                min="1" max="10"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg disabled:bg-gray-700">
                                {isLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </form>
                )}
                
                {isLoading && <div className="py-20"><LoadingSpinner /></div>}

                {generatedCases.length > 0 && !isLoading && (
                    <div className="flex-grow flex flex-col min-h-0 animate-fade-in">
                        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                            {generatedCases.map((tc, index) => (
                                <div key={index} className="bg-black/50 p-4 rounded-lg border border-gray-800 flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIndices.has(index)}
                                        onChange={() => handleToggleSelection(index)}
                                        className="mt-1 h-5 w-5 rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-gray-100">{tc.title}</h4>
                                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${priorityColorMap[tc.priority]}`}>{tc.priority}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap">{tc.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-800">
                            <button
                                onClick={() => setGeneratedCases([])}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Start Over
                            </button>
                            <button
                                onClick={handleAddSelected}
                                disabled={selectedIndices.size === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg disabled:bg-indigo-800/50 disabled:cursor-not-allowed"
                            >
                                Add {selectedIndices.size} Selected Cases
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateTestCasesModal;