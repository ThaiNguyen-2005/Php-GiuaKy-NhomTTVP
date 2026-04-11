export interface BookApiRecord {
  book_id: number;
  title: string;
  author: string;
  genre?: string | null;
  published_year?: number | null;
  cover?: string | null;
  location?: string | null;
  is_digital?: boolean | number;
  resource_type?: string | null;
  file_format?: string | null;
  file_size?: string | null;
  download_count?: number | null;
  total_quantity?: number | null;
  available_quantity?: number | null;
  is_available?: boolean | number;
}

export interface FormattedBook {
  id: number;
  book_id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  genre: string;
  location: string;
  status: string;
  statusColor: string;
  cover: string;
  quantity: number;
  available_quantity: number;
  published_year?: number;
  is_available: boolean;
}

export interface DigitalDocument {
  id: number;
  title: string;
  author: string;
  type: string;
  format: string;
  size: string;
  color: string;
  cover?: string | null;
  downloads: number;
}
