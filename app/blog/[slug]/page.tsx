import { notFound } from "next/navigation";
import Link from "next/link";
import RichText from "@/components/RichText";
import { Document } from '@contentful/rich-text-types';
import MarkdownText from "@/components/MarkdownText";
import { fetchGraphQL } from "@/lib/contentful-graphql";
import { BlogPost } from "@/types/blog";
import { isPreviewMode } from '@/lib/contentful-context';

// GraphQL query based exactly on your BlogPost model fields
const BLOG_POST_QUERY = `
  query GetBlogPostBySlug($slug: String!, $preview: Boolean = false) {
    blogPostCollection(
      where: { slug: $slug },
      preview: $preview,
      limit: 1
    ) {
      items {
        sys {
          id
        }
        heading
        slug
        text
        excerpt
        datePublished
        dateLastUpdated
        tags
        blogPostFeaturedImage {
          url
          title
          description
        }
        author {
          sys {
            id
          }
          name
          image {
            url
            title
          }
          joined
        }
      }
    }
  }
`;

// Generate static params for common slugs
export async function generateStaticParams() {
  // Query to get all blog post slugs
  const SLUGS_QUERY = `
    query GetAllSlugs {
      blogPostCollection {
        items {
          slug
        }
      }
    }
  `;

  const response = await fetchGraphQL(SLUGS_QUERY);
  
  return response.data.blogPostCollection.items.map((item: any) => ({
    slug: item.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Check for preview mode using the helper function
  const isPreview = await isPreviewMode();
  
  const { slug } = await params;
  
  // Fetch data using GraphQL
  const response = await fetchGraphQL(BLOG_POST_QUERY, {
    variables: {
      slug: slug,
      preview: isPreview
    }
  });

  // Handle no post found
  if (!response.data?.blogPostCollection?.items.length) {
    return notFound();
  }

  // Extract post data
  const postData = response.data.blogPostCollection.items[0];
  
  // Transform data to match your BlogPost type
  const post: BlogPost = {
    heading: postData.heading,
    slug: postData.slug,
    text: postData.text,
    excerpt: postData.excerpt || undefined,
    datePublished: postData.datePublished || undefined,
    dateLastUpdated: postData.dateLastUpdated || undefined,
    tags: postData.tags || [],
    blogPostFeaturedImage: postData.blogPostFeaturedImage ? {
      fields: {
        file: {
          url: postData.blogPostFeaturedImage.url
        }
      }
    } : undefined,
    author: {
      fields: {
        name: postData.author.name,
        image: postData.author.image ? {
          fields: {
            file: {
              url: postData.author.image.url
            }
          }
        } : undefined,
        joined: postData.author.joined || undefined
      }
    }
  };

  // Determine if text is rich text or markdown
  const isRichText = typeof post.text === 'object' && post.text !== null;

  return (
    <div className="container mx-auto px-4 py-8">
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
          {post.author.fields.image && (
            <img
              src={post.author.fields.image.fields.file.url}
              alt={post.author.fields.name}
              className="w-10 h-10 rounded-full mr-3"
            />
          )}
          <div>
            <p className="font-medium">{post.author.fields.name}</p>
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
              src={post.blogPostFeaturedImage.fields.file.url}
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
            // If text is a string (markdown or HTML)
            <MarkdownText content={post.text as string} />
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
    </div>
  );
}