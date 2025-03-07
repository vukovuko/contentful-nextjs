import Image from 'next/image';

export default function ContentfulImage({ 
  src, 
  alt, 
  width = 800, 
  height = 600,
  className
}: { 
  src: string; 
  alt: string; 
  width?: number; 
  height?: number;
  className?: string;
}) {
  // Ensure the URL starts with https:
  const fullSrc = src.startsWith('//') ? `https:${src}` : 
                 !src.startsWith('http') ? `https:${src}` : src;

  return (
    <Image
      src={fullSrc}
      alt={alt}
      width={width}
      height={height}
      className={className || ''}
    />
  );
}