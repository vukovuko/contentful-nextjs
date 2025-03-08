'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  language?: string | null;
  children: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, children }) => {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="relative group my-6">
      <button 
        onClick={copyToClipboard}
        className={`absolute top-2 right-2 p-1.5 rounded-md transition-all ${
          copied 
            ? 'bg-green-600 text-white opacity-100' 
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200 opacity-0 group-hover:opacity-100'
        }`}
        aria-label={copied ? "Copied!" : "Copy code"}
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        )}
      </button>
      
      {language ? (
        <SyntaxHighlighter
          language={language}
          style={oneDark as any}
          className="rounded-md"
          customStyle={{
            padding: '1.5rem',
            fontSize: '0.9rem',
            borderRadius: '0.375rem'
          }}
        >
          {codeText}
        </SyntaxHighlighter>
      ) : (
        <pre className="bg-gray-900 text-gray-100 p-5 rounded-md overflow-x-auto font-mono text-sm leading-relaxed">
          <code>{codeText}</code>
        </pre>
      )}
    </div>
  );
};

export default CodeBlock;