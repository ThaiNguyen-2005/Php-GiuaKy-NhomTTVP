<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
