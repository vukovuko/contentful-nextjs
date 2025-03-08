import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Image from 'next/image';
import { Components } from 'react-markdown';
import CodeBlock from './CodeBlock';

interface MarkdownTextProps {
  content: string;
  imageMaxWidth?: number; // Optional max width constraint for images
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ 
  content,
  imageMaxWidth = 1200 // Default max width for images
}) => {
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
    img: (props) => {
      const { src, alt, title } = props;
      
      if (!src) return null;
      
      // Parse dimensions from alt text if provided in format: alt [width×height]
      let width, height;
      const dimensionsMatch = alt ? alt.match(/\[(\d+)×(\d+)\]/) : null;
      
      if (dimensionsMatch) {
        width = parseInt(dimensionsMatch[1], 10);
        height = parseInt(dimensionsMatch[2], 10);
      }
      
      // Clean alt text by removing dimension notation
      const cleanAlt = alt ? alt.replace(/\[\d+×\d+\]/, '').trim() : 'Image';
      
      return (
        <figure className="my-6">
          <div className="relative overflow-hidden rounded-lg">
            {/* Regular img fallback for external images */}
            {src.startsWith('http') || src.startsWith('/api/') ? (
              <div className="relative">
                <ProgressiveImage 
                  src={src}
                  alt={cleanAlt}
                  maxWidth={imageMaxWidth}
                  width={width}
                  height={height}
                />
              </div>
            ) : (
              // Next.js Image for optimized local images
              <div className="relative">
                <Image
                  src={src}
                  alt={cleanAlt}
                  width={width || 1200}
                  height={height || 800}
                  className="rounded-lg max-w-full h-auto"
                  sizes={`(max-width: 768px) 100vw, ${imageMaxWidth}px`}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </div>
            )}
          </div>
          {title && (
            <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
              {title}
            </figcaption>
          )}
        </figure>
      );
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

// Progressive image loading component with loading states
const ProgressiveImage: React.FC<{
  src: string;
  alt: string;
  maxWidth?: number;
  width?: number;
  height?: number;
}> = ({ src, alt, maxWidth, width, height }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <>
      {isLoading && (
        <div 
          className="animate-pulse bg-gray-200 rounded-lg"
          style={{ 
            width: '100%', 
            paddingBottom: height && width ? `${(height / width * 100)}%` : '56.25%' // Default to 16:9 aspect ratio
          }}
        />
      )}
      
      {error ? (
        <div className="flex items-center justify-center border border-gray-200 rounded-lg p-4 bg-gray-50" style={{ minHeight: '200px' }}>
          <div className="text-center text-gray-500">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto text-gray-400 mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Failed to load image</p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`rounded-lg max-w-full h-auto ${isLoading ? 'hidden' : 'block'}`}
          style={{ maxWidth: maxWidth ? `${maxWidth}px` : '100%' }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
          width={width}
          height={height}
        />
      )}
    </>
  );
};

export default MarkdownText;