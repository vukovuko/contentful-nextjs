import { NextRequest, NextResponse } from 'next/server'
import { previewClient } from '@/lib/contentful'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  
  if (secret !== process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN || !slug) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }
  
  try {
    const entries = await previewClient.getEntries({
      content_type: 'blogPost', 
      'fields.slug': slug
    })
    
    const post = entries?.items?.[0]
    
    if (!post) {
      return NextResponse.json({ message: 'Invalid slug' }, { status: 401 })
    }
    
    // Create the URL for redirection
    const url = `/blog/${post.fields.slug}`
    
    // Set up the preview cookie
    const redirectResponse = NextResponse.redirect(new URL(url, request.url))
    
    // Set cookies with a simple value instead of a non-existent env var
    redirectResponse.cookies.set('__prerender_bypass', 'true')
    redirectResponse.cookies.set('__next_preview_data', JSON.stringify({ preview: true }))
    
    return redirectResponse
  } catch (error) {
    return NextResponse.json({ message: 'Error during preview' }, { status: 500 })
  }
}