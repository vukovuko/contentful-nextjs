import BlogGrid from '@/components/BlogGrid';
import { BlogPost } from '@/types/blog';
import { fetchGraphQL } from '@/lib/contentful-graphql';
import { isPreviewMode } from '@/lib/contentful-context';
import Link from 'next/link';

// GraphQL query to get all tags for static generation
const ALL_TAGS_QUERY = `
  query GetAllTags {
    blogPostCollection {
      items {
        tags
      }
    }
  }
`;

// GraphQL query to fetch all blog posts - we'll filter by tag in JS
const ALL_BLOG_POSTS_QUERY = `
  query GetAllBlogPosts($preview: Boolean = false) {
    blogPostCollection(
      order: [datePublished_DESC],
      preview: $preview
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
        }
        author {
          name
          image {
            url
          }
          joined
        }
      }
    }
  }
`;

// Generate static params for common tags
export async function generateStaticParams() {
  const response = await fetchGraphQL(ALL_TAGS_QUERY);
  
  const tags = new Set<string>();
  
  response.data.blogPostCollection.items.forEach((item: any) => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach((tag: string) => {
        tags.add(tag.toLowerCase().replace(/\s+/g, '-'));
      });
    }
  });

  return Array.from(tags).map((tag) => ({
    tag,
  }));
}

// Main page component
export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: tagSlug } = await params;
  const searchTagNormalized = tagSlug.replace(/-/g, ' ').toLowerCase(); // Normalize for case-insensitive comparison
  
  // Check for preview mode using the helper function
  const isPreview = await isPreviewMode();
  
  // Fetch ALL blog posts using GraphQL (we'll filter client-side to avoid case sensitivity issues)
  const response = await fetchGraphQL(ALL_BLOG_POSTS_QUERY, {
    variables: {
      preview: isPreview
    }
  });
  
  // Filter posts by tag (case-insensitive)
  const filteredItems = response.data.blogPostCollection.items.filter((item: any) => {
    if (!item.tags || !Array.isArray(item.tags)) return false;
    return item.tags.some((tag: string) => tag.toLowerCase() === searchTagNormalized);
  });
  
  // Get the original tag with correct capitalization for display
  let displayTag = searchTagNormalized;
  if (filteredItems.length > 0 && filteredItems[0].tags) {
    const matchingTag = filteredItems[0].tags.find(
      (tag: string) => tag.toLowerCase() === searchTagNormalized
    );
    if (matchingTag) displayTag = matchingTag;
  }
  
  // Transform the GraphQL response to match the BlogPost type
  const posts = filteredItems.map((item: any) => {
    return {
      heading: item.heading,
      slug: item.slug,
      text: item.text,
      excerpt: item.excerpt,
      datePublished: item.datePublished,
      dateLastUpdated: item.dateLastUpdated,
      tags: item.tags || [],
      blogPostFeaturedImage: item.blogPostFeaturedImage ? {
        fields: {
          file: {
            url: item.blogPostFeaturedImage.url
          }
        }
      } : undefined,
      author: {
        fields: {
          name: item.author.name,
          image: item.author.image ? {
            fields: {
              file: {
                url: item.author.image.url
              }
            }
          } : undefined,
          joined: item.author.joined
        }
      }
    } as BlogPost;
  });
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/blog" className="text-blue-600 hover:underline mb-8 inline-block">
        ← Back to all posts
      </Link>
      
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        Posts tagged with <span className="text-blue-400">#{displayTag}</span>
      </h1>
      
      <BlogGrid posts={posts} />
    </div>
  );
}