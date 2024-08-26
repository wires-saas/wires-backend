export interface ArticleMetadata {
  title: string;
  description: string;
  image: string;
  categories: string[];
  publishedAt: number;
  author: string;
}

export interface ArticleStats {
  sent: number;
  displayed: number;
  clicked: number;
}
