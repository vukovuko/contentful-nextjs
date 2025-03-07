import BlogGrid from "@/components/BlogGrid";
import client from "@/lib/contentful";
import { BlogPost } from "@/types/blog";

export default async function BlogPage() {
  // Fetch all blog posts
  const entries = await client.getEntries({
    content_type: 'blogPost',
    order: ['-fields.datePublished'], // Sort by newest first
  });
  
  const posts = entries.items.map((item) => item.fields as unknown as BlogPost);
  
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