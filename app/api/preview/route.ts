import { NextRequest, NextResponse } from 'next/server'
import { fetchGraphQL } from '@/lib/contentful-graphql'

// GraphQL query to check if a slug exists
const VALIDATE_SLUG_QUERY = `
  query ValidateSlug($slug: String!, $preview: Boolean = true) {
    blogPostCollection(
      where: { slug: $slug },
      preview: $preview,
      limit: 1
    ) {
      items {
        slug
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  
  if (secret !== process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN || !slug) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
  
  try {
    // Check if the slug exists using GraphQL
    const response = await fetchGraphQL(VALIDATE_SLUG_QUERY, {
      variables: {
        slug: slug,
        preview: true
      }
    });
    
    const post = response.data?.blogPostCollection?.items?.[0]
    
    if (!post) {
      return NextResponse.json({ message: 'Invalid slug' }, { status: 401 })
    }
    
    // Create the URL for redirection
    const url = `/blog/${post.slug}`
    
    // Set up the preview cookie
    const redirectResponse = NextResponse.redirect(new URL(url, request.url))
    
    // Set cookies with a simple value
    redirectResponse.cookies.set('__prerender_bypass', 'true')
    redirectResponse.cookies.set('__next_preview_data', JSON.stringify({ preview: true }))
    
    return redirectResponse
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({ message: 'Error during preview' }, { status: 500 })
  }
}