export interface Photo {
  id: string;
  slug?: string | null;
  url: string;
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  height: number;
  width?: number | null;
  approved?: boolean | null;
  rejected?: boolean | null;
  featured?: boolean | null;
  user?: {
    username?: string | null;
    picture?: string | null;
  } | null;
}

export interface PhotoPage {
  items: Photo[];
  nextCursor: string | null;
}

export interface PhotoFeedFilters {
  q?: string;
  tag?: string;
  orientation?: string;
  sort?: string;
}
