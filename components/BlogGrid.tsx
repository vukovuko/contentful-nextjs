import React from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";

interface BlogGridProps {
  posts: BlogPost[];
}

const BlogGrid: React.FC<BlogGridProps> = ({ posts = [] }) => {
  if (posts.length === 0) {
    return <div className="text-center py-12 text-gray-400">No posts found</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {posts.map((post) => (
        <div 
          key={post.slug} 
          className="bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:translate-y-[-5px]"
        >
          {post.blogPostFeaturedImage ? (
            <div className="relative h-56 overflow-hidden">
              <img
                src={`https:${post.blogPostFeaturedImage.fields.file.url}`}
                alt={post.heading}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              {post.datePublished && (
                <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {new Date(post.datePublished).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              )}
            </div>
          ) : (
            post.datePublished && (
              <div className="px-6 pt-6">
                <span className="inline-block bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {new Date(post.datePublished).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )
          )}
          
          <div className="p-6">
            <h2 className="text-xl font-bold mb-3 text-white hover:text-blue-400 transition-colors">
              <Link href={`/blog/${post.slug}`}>
                {post.heading}
              </Link>
            </h2>
            
            {/* Display tags if they exist */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag, index) => (
                  <Link 
                    key={index} 
                    href={`/blog/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-md transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
            
            {post.excerpt && (
              <p className="text-gray-400 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-4">
              {post.author && post.author.fields && (
                <div className="flex items-center">
                  {post.author.fields.image ? (
                    <img
                      src={`https:${post.author.fields.image.fields.file.url}`}
                      alt={post.author.fields.name}
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">
                        {post.author.fields.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-300">
                    {post.author.fields.name}
                  </span>
                </div>
              )}
              
              <Link 
                href={`/blog/${post.slug}`} 
                className="text-blue-400 hover:text-blue-300 text-sm font-medium group flex items-center"
              >
                Read more
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BlogGrid;