import Image from 'next/image';

interface ContentfulImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
}

const contentfulLoader = ({ src, width, quality }: { 
  src: string; 
  width: number; 
  quality?: number;
}) => {
  // Ensure the URL starts with https:
  const fullSrc = src.startsWith('//') ? `https:${src}` : 
                 !src.startsWith('http') ? `https:${src}` : src;
                 
  return `${fullSrc}?w=${width}&q=${quality || 75}`;
};

const ContentfulImage = ({
  src,
  alt,
  width = 800,
  height = 600,
  quality = 75,
  className,
  ...props
}: ContentfulImageProps) => {
  return (
    <Image
      loader={contentfulLoader}
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      className={className || ''}
      {...props}
    />
  );
};

export default ContentfulImage;