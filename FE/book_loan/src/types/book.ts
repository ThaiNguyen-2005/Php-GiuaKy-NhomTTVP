export interface Book {
    book_id: number;
    title: string;
    author: string;
    genre: string;
    published_year: number;
    is_available: number;
}

export interface FormattedBook {
    id: number;
    title: string;
    author: string;
    isbn: string;
    category: string;
    location: string;
    status: string;
    statusColor: string;
    cover: string;
}
