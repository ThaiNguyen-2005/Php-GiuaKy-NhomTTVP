import { Book, FormattedBook } from '../types/book';

const API_BASE_URL = 'http://localhost:8000/api';

export const fetchBooks = async (): Promise<FormattedBook[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        const data: Book[] = await response.json();
        
        return data.map((b) => ({
            id: b.book_id,
            title: b.title,
            author: b.author,
            isbn: `N/A (${b.published_year})`,
            category: b.genre || 'Chưa phân loại',
            location: 'Kho tổng',
            status: b.is_available === 1 ? 'Sẵn có' : 'Hết sách',
            statusColor: b.is_available === 1 ? 'bg-green-500' : 'bg-red-500',
            cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=100'
        }));
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu sách", error);
        throw error;
    }
};
