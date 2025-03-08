// components/RichText.tsx
import React, { ReactNode } from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS, Document, Block, Inline, Text, Mark } from '@contentful/rich-text-types';
import Link from 'next/link';
import Image from 'next/image';

// Define types for Contentful asset and entry
interface ContentfulAssetFile {
  url: string;
  details?: {
    image?: {
      width: number;
      height: number;
    };
  };
  contentType?: string;
  fileName?: string;
}

interface ContentfulAsset {
  fields: {
    title?: string;
    description?: string;
    file?: ContentfulAssetFile;
  };
}

interface ContentfulEntry {
  sys: {
    contentType?: {
      sys: {
        id: string;
      };
    };
  };
  fields: {
    [key: string]: any;
    title?: string;
    slug?: string;
    heading?: string;
    embedUrl?: string;
  };
}

interface ContentfulTarget {
  sys: {
    contentType?: {
      sys: {
        id: string;
      };
    };
  };
  fields?: any;
}

interface RichTextProps {
  content: Document;
}

const RichText: React.FC<RichTextProps> = ({ content }) => {
  const options = {
    renderMark: {
      [MARKS.BOLD]: (text: ReactNode): ReactNode => (
        <strong className="font-bold">{text}</strong>
      ),
      [MARKS.ITALIC]: (text: ReactNode): ReactNode => (
        <em className="italic">{text}</em>
      ),
      [MARKS.UNDERLINE]: (text: ReactNode): ReactNode => (
        <u className="underline">{text}</u>
      ),
      [MARKS.CODE]: (text: ReactNode): ReactNode => (
        <code className="bg-gray-100 p-1 rounded font-mono text-sm">{text}</code>
      ),
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: Block | Inline, children: ReactNode): ReactNode => {
        // Check if this paragraph contains a code block
        const hasCodeMark = (node.content as Array<Text | Block | Inline>)?.some(
          (item) => {
            if ('marks' in item && Array.isArray(item.marks)) {
              return item.marks.some(mark => mark.type === 'code');
            }
            return false;
          }
        );
        
        if (hasCodeMark) {
          return (
            <pre className="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto">
              <code className="font-mono text-sm">{children}</code>
            </pre>
          );
        }
        
        return <p className="mb-4">{children}</p>;
      },
      [BLOCKS.HEADING_1]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <h2 className="text-3xl font-bold mt-8 mb-4">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <h3 className="text-2xl font-bold mt-6 mb-3">{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <h4 className="text-xl font-bold mt-4 mb-2">{children}</h4>
      ),
      [BLOCKS.HEADING_5]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <h5 className="text-lg font-bold mt-4 mb-2">{children}</h5>
      ),
      [BLOCKS.HEADING_6]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <h6 className="text-base font-bold mt-4 mb-2">{children}</h6>
      ),
      [BLOCKS.UL_LIST]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <ul className="list-disc pl-6 mb-4">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <ol className="list-decimal pl-6 mb-4">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <li className="mb-1">{children}</li>
      ),
      [BLOCKS.QUOTE]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-8 border-t border-gray-300" />,
      [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline): ReactNode => {
        const { target } = node.data as { target?: ContentfulAsset };
        if (!target || !target.fields) {
          return null;
        }
        
        const { file, title, description } = target.fields;
        if (!file || !file.url) {
          return null;
        }
        
        // Handle images
        if (file.contentType && file.contentType.includes('image')) {
          return (
            <div className="my-6">
              <Image
                src={`https:${file.url}`}
                alt={description || title || 'Embedded image'}
                width={file.details?.image?.width || 800}
                height={file.details?.image?.height || 600}
                className="rounded-lg"
              />
              {title && <p className="text-sm text-gray-500 mt-2">{title}</p>}
            </div>
          );
        }
        
        // Handle other asset types (like PDFs)
        return (
          <div className="my-4">
            <a 
              href={`https:${file.url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              {title || file.fileName || 'Download file'}
            </a>
          </div>
        );
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node: Block | Inline): ReactNode => {
        const { target } = node.data as { target?: ContentfulEntry };
        if (!target || !target.fields) {
          return null;
        }
        
        // Handle different embedded entry types based on content type
        const contentType = target.sys.contentType?.sys?.id;
        
        switch (contentType) {
          case 'videoEmbed':
            return (
              <div className="my-6">
                <iframe
                  src={target.fields.embedUrl}
                  title={target.fields.title || 'Embedded video'}
                  className="w-full aspect-video rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          // Add other content types as needed
          default:
            return null;
        }
      },
      [INLINES.HYPERLINK]: (node: Block | Inline, children: ReactNode): ReactNode => {
        const { uri } = node.data as { uri: string };
        
        // Check if this is an internal link (to your own domain)
        const isInternalLink = uri.startsWith('/') || uri.includes('yourdomain.com');
        
        if (isInternalLink) {
          return (
            <Link href={uri} className="text-blue-600 hover:underline">
              {children}
            </Link>
          );
        }
        
        // External link
        return (
          <a 
            href={uri} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline"
          >
            {children}
          </a>
        );
      },
      [INLINES.ENTRY_HYPERLINK]: (node: Block | Inline, children: ReactNode): ReactNode => {
        const { target } = node.data as { target?: ContentfulEntry };
        if (!target || !target.fields) {
          return children;
        }
        
        // Handle links to other entries, like blog posts
        const contentType = target.sys.contentType?.sys?.id;
        
        switch (contentType) {
          case 'blogPost':
            return (
              <Link 
                href={`/blog/${target.fields.slug}`}
                className="text-blue-600 hover:underline"
              >
                {children || target.fields.heading || 'Read more'}
              </Link>
            );
          // Add other content types as needed
          default:
            return children;
        }
      },
      [BLOCKS.TABLE]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <div className="overflow-x-auto my-6">
          <table className="min-w-full border-collapse border border-gray-300">
            <tbody>{children}</tbody>
          </table>
        </div>
      ),
      [BLOCKS.TABLE_ROW]: (_node: Block | Inline, children: ReactNode): ReactNode => (
        <tr className="border-b border-gray-300">{children}</tr>
      ),
      [BLOCKS.TABLE_CELL]: (node: Block | Inline, children: ReactNode): ReactNode => {
        // Check if this is a header cell
        let isHeader = false;
        
        // Safely check for header cell (bold text in first content)
        if ('content' in node && Array.isArray(node.content) && node.content.length > 0) {
          const firstContent = node.content[0];
          
          if ('content' in firstContent && Array.isArray(firstContent.content) && firstContent.content.length > 0) {
            const firstTextNode = firstContent.content[0];
            
            if ('marks' in firstTextNode && Array.isArray(firstTextNode.marks)) {
              isHeader = firstTextNode.marks.some(mark => mark.type === 'bold');
            }
          }
        }
        
        return isHeader ? (
          <th className="border border-gray-300 px-4 py-2 bg-gray-100">{children}</th>
        ) : (
          <td className="border border-gray-300 px-4 py-2">{children}</td>
        );
      }
    }
  };

  return <div className="rich-text">{documentToReactComponents(content, options)}</div>;
};

export default RichText;