import { createClient } from 'contentful';
import BlogGrid from '@/components/BlogGrid';
import { BlogPost } from '@/types/blog';

// Generate static params for common tags
export async function generateStaticParams() {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  });

  const response = await client.getEntries({
    content_type: 'blogPost'
  });

  const tags = new Set<string>();
  
  response.items.forEach((item: any) => {
    if (item.fields.tags && Array.isArray(item.fields.tags)) {
      item.fields.tags.forEach((tag: string) => {
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
  const formattedTag = tagSlug.replace(/-/g, ' '); // Convert slug to readable format
  
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  });

  // Get all blog posts
  const response = await client.getEntries({
    content_type: 'blogPost',
    order: ['-fields.datePublished']
  });

  // Manually filter for tags (case-insensitive)
  const posts = response.items
    .filter((item: any) => {
      const tags = item.fields.tags || [];
      return tags.some((tag: string) => 
        tag.toLowerCase() === formattedTag.toLowerCase()
      );
    })
    .map((item: any) => item.fields) as BlogPost[];
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        Posts tagged with <span className="text-blue-400">#{formattedTag}</span>
      </h1>
      <BlogGrid posts={posts} />
    </div>
  );
}