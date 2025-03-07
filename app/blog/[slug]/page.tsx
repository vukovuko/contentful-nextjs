import { notFound } from "next/navigation";
import client from "@/lib/contentful";
import { BlogPost } from "@/types/blog";
import Link from "next/link";
import RichText from "@/components/RichText";
import { Document } from '@contentful/rich-text-types';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entries = await client.getEntries({
    content_type: "blogPost",
    "fields.slug": slug,
  });

  if (!entries.items.length) {
    return notFound();
  }

  const post = entries.items[0].fields as unknown as BlogPost;
  const author = post.author.fields;


  const isRichText = typeof post.text === 'object' && post.text !== null;

  return (
    <main className="container mx-auto px-4 py-8">
      <Link href="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to all posts
      </Link>
      
      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.heading}</h1>
        
        {/* Add tags below the title */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <Link 
                key={index} 
                href={`/blog/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm px-3 py-1 rounded-md transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        
        <div className="flex items-center mb-6">
          {author.image && (
            <img
              src={`https:${author.image.fields.file.url}`}
              alt={author.name}
              className="w-10 h-10 rounded-full mr-3"
            />
          )}
          <div>
            <p className="font-medium">{author.name}</p>
            {post.datePublished && (
              <p className="text-sm text-gray-500">
                {new Date(post.datePublished).toLocaleDateString()}
                {post.dateLastUpdated && post.dateLastUpdated !== post.datePublished && 
                  ` (Updated ${new Date(post.dateLastUpdated).toLocaleDateString()})`}
              </p>
            )}
          </div>
        </div>
        
        {post.blogPostFeaturedImage && (
          <div className="mb-6">
            <img 
              src={`https:${post.blogPostFeaturedImage.fields.file.url}`} 
              alt={post.heading} 
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
        
        <div className="prose lg:prose-xl max-w-none">
          {isRichText ? (
            // If text is a rich text object
            <RichText content={post.text as unknown as Document} />
          ) : (
            // If text is a string (HTML)
            <div dangerouslySetInnerHTML={{ __html: post.text }} />
          )}
        </div>
        
        {/* Add tags at the bottom of the post */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Link 
                  key={index} 
                  href={`/blog/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm px-3 py-1 rounded-md transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}