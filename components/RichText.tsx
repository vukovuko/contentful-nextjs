import { BLOCKS, INLINES, MARKS, Document, Block, Inline, Text } from '@contentful/rich-text-types'
import { documentToReactComponents, Options, NodeRenderer } from '@contentful/rich-text-react-renderer'
import Link from 'next/link'
import ContentfulImage from './ContentfulImage'
import { ReactNode } from 'react'

// Define custom types for our specific Contentful structure
type ContentfulAsset = {
  sys: {
    contentType: {
      sys: {
        id: string
      }
    }
  }
  fields: {
    slug?: string
    title?: string
    embedUrl?: string
    file?: {
      url: string
      details: {
        image: {
          height: number
          width: number
        }
      }
    }
  }
}

const options: Options = {
  renderMark: {
    [MARKS.CODE]: (text: ReactNode): ReactNode => {
      return (
        <pre>
          <code>{text}</code>
        </pre>
      )
    }
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: Block | Inline, children: ReactNode): ReactNode => {
      // Type guard to check if node has content with marks
      const hasCodeMark = node.content?.some(item => 
        'marks' in item && item.marks?.some(mark => mark.type === 'code')
      );

      if (hasCodeMark) {
        return (
          <div>
            <pre>
              <code>{children}</code>
            </pre>
          </div>
        )
      }

      return <p>{children}</p>
    },

    [INLINES.ENTRY_HYPERLINK]: (node: Block | Inline, children: ReactNode): ReactNode => {
      if (node.data?.target && 
          node.data.target.sys?.contentType?.sys?.id === 'post') {
        return (
          <Link href={`/posts/${node.data.target.fields?.slug}`}>
            {node.data.target.fields?.title}
          </Link>
        )
      }
      return null;
    },

    [INLINES.HYPERLINK]: (node: Block | Inline, children: ReactNode): ReactNode => {
      const text = node.content?.find(item => item.nodeType === 'text');
      const textValue = text && 'value' in text ? text.value : '';
      
      return (
        <a href={node.data?.uri} target='_blank' rel='noopener noreferrer'>
          {textValue || children}
        </a>
      )
    },

    [BLOCKS.EMBEDDED_ENTRY]: (node: Block | Inline, children: ReactNode): ReactNode => {
      if (node.data?.target && 
          node.data.target.sys?.contentType?.sys?.id === 'videoEmbed') {
        return (
          <iframe
            height='400'
            width='100%'
            src={node.data.target.fields?.embedUrl}
            title={node.data.target.fields?.title}
            allowFullScreen={true}
          />
        )
      }
      return null;
    },

    [BLOCKS.EMBEDDED_ASSET]: (node: Block | Inline, children: ReactNode): ReactNode => {
      // Add proper null checks
      if (!node.data?.target || !node.data.target.fields?.file) {
        return null;
      }
      
      const { file } = node.data.target.fields;
      
      if (!file.url || !file.details?.image) {
        return null;
      }
      
      return (
        <ContentfulImage
          src={file.url}
          height={file.details.image.height}
          width={file.details.image.width}
          alt={node.data.target.fields.title || 'Embedded asset'}
          className='h-20 w-20'
        />
      )
    }
  }
}

interface RichTextProps {
  content: Document
}

const RichText = ({ content }: RichTextProps) => {
  return <>{documentToReactComponents(content, options)}</>
}

export default RichText