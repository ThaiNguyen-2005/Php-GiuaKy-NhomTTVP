<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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