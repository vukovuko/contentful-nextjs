// lib/contentful-graphql.ts

/**
 * Client for Contentful's GraphQL API
 */

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_PREVIEW_ACCESS_TOKEN = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;

interface GraphQLRequestOptions {
  variables?: Record<string, any>;
  preview?: boolean;
}

/**
 * Fetch data from Contentful GraphQL API
 * 
 * @param query GraphQL query string
 * @param options Request options (variables, preview flag)
 * @returns The GraphQL response data
 */
export async function fetchGraphQL(query: string, options: GraphQLRequestOptions = {}) {
  const { variables = {}, preview = false } = options;
  
  // Use preview API URL and token if in preview mode
  const url = `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}`;
  const token = preview ? CONTENTFUL_PREVIEW_ACCESS_TOKEN : CONTENTFUL_ACCESS_TOKEN;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      // For Next.js data fetching (optional but recommended for production)
      next: preview ? { revalidate: 5 } : { revalidate: 3600 } // Shorter cache in preview
    });

    const json = await response.json();
    
    if (json.errors) {
      console.error('GraphQL Errors:', JSON.stringify(json.errors));
      throw new Error(`GraphQL query failed: ${json.errors.map((e: any) => e.message).join(', ')}`);
    }
    
    return json;
  } catch (error) {
    console.error('Error fetching from Contentful GraphQL API:', error);
    throw error;
  }
}