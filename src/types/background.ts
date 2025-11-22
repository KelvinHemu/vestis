export interface Background {
  id: number;
  name: string;
  category: 'Indoor' | 'Outdoor' | 'studio';
  url: string;
  alt_text: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface BackgroundsResponse {
  backgrounds: Background[];
  count?: number;
}

export type BackgroundCategory = 'Indoor' | 'Outdoor' | 'studio';
