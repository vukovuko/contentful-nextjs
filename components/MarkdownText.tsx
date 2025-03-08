// components/MarkdownText.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { Components } from 'react-markdown';
import CodeBlock from './CodeBlock';

interface MarkdownTextProps {
  content: string;
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ content }) => {
  // Define components for ReactMarkdown with proper TypeScript types
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-bold mt-4 mb-2">{children}</h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-lg font-bold mt-4 mb-2">{children}</h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-base font-bold mt-4 mb-2">{children}</h6>
    ),
    p: ({ children }) => <p className="mb-4">{children}</p>,
    a: ({ href, children }) => {
      const isInternalLink = href?.startsWith('/') || href?.includes('yourdomain.com');
      
      if (isInternalLink && href) {
        return (
          <Link href={href} className="text-blue-600 hover:underline">
            {children}
          </Link>
        );
      }
      
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {children}
        </a>
      );
    },
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4">{children}</ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>
    ),
    hr: () => <hr className="my-8 border-t border-gray-300" />,
    img: ({ src, alt }) => {
      if (src) {
        return (
          <div className="my-6">
            <img
              src={src}
              alt={alt || 'Image'}
              className="rounded-lg max-w-full h-auto"
            />
          </div>
        );
      }
      return null;
    },
    code: (props: any) => {
      const { className, children, inline } = props;
      
      // Extract language if specified
      const language = className ? /language-(\w+)/.exec(className)?.[1] : null;
      
      // Handle inline code
      if (inline) {
        return (
          <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm text-blue-700">
            {children}
          </code>
        );
      }
      
      // Use our custom CodeBlock component for code blocks
      return <CodeBlock language={language}>{String(children)}</CodeBlock>;
    },
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-gray-300">
          {children}
        </table>
      </div>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-gray-300">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="border border-gray-300 px-4 py-2 bg-gray-100">{children}</th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-4 py-2">{children}</td>
    ),
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownText;