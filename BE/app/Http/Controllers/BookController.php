<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
<<<<<<< HEAD

class BookController extends Controller
{
    public function getDigitalDocuments()
    {
        // Tạo giỏ dữ liệu sách y chang bên React
        $fakeData = [
            [ "id" => 1, "title" => "Giáo trình Lập trình C++ Cơ bản và Nâng cao", "author" => "Phạm Văn Ất", "type" => "Giáo trình", "format" => "PDF", "size" => "5.2 MB", "color" => "bg-red-500", "cover" => "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400", "downloads" => 1250 ],
            [ "id" => 2, "title" => "Toán Rời Rạc & Lý thuyết Đồ thị", "author" => "Nguyễn Đức Nghĩa", "type" => "Tài liệu", "format" => "EPUB", "size" => "3.1 MB", "color" => "bg-blue-500", "cover" => "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400", "downloads" => 840 ],
            [ "id" => 3, "title" => "Bài giảng Kiến trúc Máy tính & Hợp ngữ MIPS", "author" => "ThS. Nguyễn Văn A", "type" => "Bài giảng", "format" => "SLIDES", "size" => "12.5 MB", "color" => "bg-orange-500", "cover" => "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400", "downloads" => 450 ],
            [ "id" => 4, "title" => "Lập trình Web với PHP & MySQL", "author" => "Luke Welling", "type" => "Sách nói", "format" => "AUDIO", "size" => "45.0 MB", "color" => "bg-purple-500", "cover" => "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=400", "downloads" => 3200 ],
            [ "id" => 5, "title" => "Phân tích thiết kế hệ thống thông tin", "author" => "Nhiều tác giả", "type" => "Tham khảo", "format" => "PDF", "size" => "8.4 MB", "color" => "bg-red-500", "cover" => "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400", "downloads" => 2100 ]
        ];

        // Biến thành JSON và trả về API
        return response()->json($fakeData);
    }
}
=======
use Illuminate\Support\Facades\DB;

class BookController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('query');
        $books = DB::table('books')
            ->where('title', 'LIKE', "%{$query}%")
            ->orWhere('author', 'LIKE', "%{$query}%")
            ->orWhere('genre', 'LIKE', "%{$query}%")
            ->get();
            
        return response()->json($books);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'genre' => 'nullable|string|max:100',
            'published_year' => 'nullable|integer',
            'quantity' => 'nullable|integer|min:1',
        ]);
        
        $qty = $request->quantity ?? 1;

        $bookId = DB::table('books')->insertGetId([
            'title' => $request->title,
            'author' => $request->author,
            'genre' => $request->genre,
            'published_year' => $request->published_year,
            'cover' => $request->cover,
            'location' => $request->location,
            'total_quantity' => $qty,
            'available_quantity' => $qty,
            'is_available' => $qty > 0,
        ]);
        
        return response()->json([
            'message' => 'Thêm sách thành công',
            'book' => DB::table('books')->where('book_id', $bookId)->first()
        ], 201);
    }
    
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'author' => 'nullable|string|max:255',
            'genre' => 'nullable|string|max:100',
            'published_year' => 'nullable|integer',
            'quantity' => 'nullable|integer|min:0',
        ]);
        
        $data = $request->only(['title', 'author', 'genre', 'published_year', 'cover', 'location']);
        $book = DB::table('books')->where('book_id', $id)->first();

        if (!$book) {
            return response()->json(['message' => 'Không tìm thấy sách'], 404);
        }

        if ($request->has('quantity')) {
            $diff = $request->quantity - $book->total_quantity;
            $data['total_quantity'] = $request->quantity;
            $data['available_quantity'] = max(0, $book->available_quantity + $diff);
            $data['is_available'] = $data['available_quantity'] > 0;
        }

        if(empty($data)) {
            return response()->json([
                'message' => 'Không có dữ liệu cập nhật'
            ], 400);
        }

        $updated = DB::table('books')->where('book_id', $id)->update($data);
        
        return response()->json([
            'message' => 'Cập nhật sách thành công',
            'book' => DB::table('books')->where('book_id', $id)->first()
        ]);
    }
    
    public function destroy($id)
    {
        $deleted = DB::table('books')->where('book_id', $id)->delete();
        
        if (!$deleted) {
            return response()->json(['message' => 'Không tìm thấy sách'], 404);
        }
        
        return response()->json([
            'message' => 'Xóa sách thành công'
        ]);
    }
}
>>>>>>> 2cbd17c807ca1e36d416bb1c24c06f42474a1c59
