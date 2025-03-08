import BlogGrid from "@/components/BlogGrid"; 
import { fetchGraphQL } from "@/lib/contentful-graphql";
import { BlogPost } from "@/types/blog";
import { isPreviewMode } from '@/lib/contentful-context';

// GraphQL query to fetch all blog posts
const BLOG_POSTS_QUERY = `
  query GetBlogPosts($preview: Boolean = false) {
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

export default async function BlogPage() {
  // Check for preview mode using the helper function
  const isPreview = await isPreviewMode();

  // Fetch all blog posts using GraphQL
  const response = await fetchGraphQL(BLOG_POSTS_QUERY, {
    variables: {
      preview: isPreview
    }
  });
  
  // Transform the GraphQL response to our BlogPost type structure
  const posts = response.data.blogPostCollection.items.map((item: any) => ({
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
  }));

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Blog Posts
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explore the latest thoughts, tutorials, and insights. This is work in progress!
        </p>
      </div>
      <BlogGrid posts={posts} />
    </div>
  );
}