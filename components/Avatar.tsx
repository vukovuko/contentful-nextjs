import React from 'react';
import ContentfulImage from './ContentfulImage';

interface AvatarProps {
  name: string;
  picture: {
    fields: {
      file: {
        url: string;
      };
    };
  } | null;
  size?: 'small' | 'medium' | 'large';
}

const Avatar: React.FC<AvatarProps> = ({ name, picture, size = 'medium' }) => {
  // Size mapping for different avatar sizes
  const sizeClasses = {
    small: {
      container: 'w-8 h-8 mr-2',
      font: 'text-xs'
    },
    medium: {
      container: 'w-10 h-10 mr-4',
      font: 'text-sm'
    },
    large: {
      container: 'w-14 h-14 mr-5',
      font: 'text-base'
    }
  };

  const { container, font } = sizeClasses[size];

  // Fallback avatar when no picture is available
  if (!picture || !picture.fields || !picture.fields.file) {
    return (
      <div className='flex items-center'>
        <div className={`relative ${container} bg-blue-600 rounded-full flex items-center justify-center`}>
          <span className={`text-white font-bold ${font}`}>
            {name.charAt(0)}
          </span>
        </div>
        <div className='font-semibold text-gray-300'>{name}</div>
      </div>
    );
  }

  return (
    <div className='flex items-center'>
      <div className={`relative ${container}`}>
        <ContentfulImage
          src={picture.fields.file.url}
          width={size === 'large' ? 56 : size === 'medium' ? 40 : 32}
          height={size === 'large' ? 56 : size === 'medium' ? 40 : 32}
          className='rounded-full m-0 object-cover'
          alt={`Avatar for ${name}`}
        />
      </div>
      <div className='font-semibold text-gray-300'>{name}</div>
    </div>
  );
};

export default Avatar;