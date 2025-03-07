export interface Author {
  name: string;
  image?: {
    fields: {
      file: {
        url: string;
      }
    }
  };
  joined?: string;
}

export interface BlogPost {
  heading: string;
  slug: string;
  text: string;
  blogPostFeaturedImage?: {
    fields: {
      file: {
        url: string;
      }
    }
  };
  author: {
    fields: Author;
  };
  excerpt?: string;
  datePublished?: string;
  dateLastUpdated?: string;
  tags? : string[];
}