
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';

interface CodeBlockProps {
    code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-gray-900 rounded-md relative group">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
            </button>
            <pre className="p-4 text-sm text-gray-300 overflow-x-auto custom-scrollbar">
                <code>{code}</code>
            </pre>
        </div>
    );
};

export default CodeBlock;
