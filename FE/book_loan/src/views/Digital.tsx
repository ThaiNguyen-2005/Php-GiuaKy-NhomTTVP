import React, { useState, useEffect } from 'react';


export default function Digital() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  // 1. Tạo cái giỏ trống để đựng sách thật lấy từ Database về
  const [documents, setDocuments] = useState<any[]>([]);

  // 2. Dùng useEffect để tự động chạy đi lấy sách ngay khi vừa mở trang web
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Chỗ này quan trọng: Đây là đường dẫn API gọi sang Laravel (Tạm thời tớ để mẫu)
        const response = await fetch('http://127.0.0.1:8000/api/digital-documents'); 
        const data = await response.json();
        
        // Lấy được dữ liệu thì đổ vào cái giỏ
        setDocuments(data);
      } catch (error) {
        console.error("Trục trặc đường truyền rồi:", error);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div className="p-8 space-y-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Tài liệu Số</h2>
          <p className="text-on-surface-variant text-sm mt-1">Truy cập bộ sưu tập EBook, Audio và Bài giảng điện tử 24/7</p>
        </div>
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm tài liệu số..." 
            className="w-full pl-10 pr-4 py-2.5 bg-surface-bright border border-surface-container-high rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-shadow scholar-shadow"
          />
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-surface-container-low w-fit rounded-xl overflow-x-auto custom-scrollbar">
        {['ALL', 'PDF', 'EPUB', 'AUDIO', 'SLIDES'].map(filter => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-surface-bright text-primary scholar-shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {filter === 'ALL' ? 'Tất cả định dạng' : filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-max">
       {documents.map(resource => (
          <div key={resource.id} className="bg-surface-bright rounded-2xl p-4 scholar-shadow flex flex-col group border border-surface-container-low hover:border-primary/30 transition-colors">
            <div className="aspect-square relative rounded-xl overflow-hidden bg-surface-container mb-4">
               <img src={resource.cover} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
               <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                   <span className={`${resource.color} text-white font-bold text-[10px] px-2 py-1 rounded select-none shadow-md uppercase tracking-wider`}>{resource.format}</span>
                   <span className="text-white text-[10px] font-medium">{resource.size}</span>
               </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{resource.type}</span>
              <h3 className="font-bold text-sm text-on-surface mt-1 line-clamp-2 leading-snug group-hover:text-primary transition-colors">{resource.title}</h3>
              
              { }
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-on-surface-variant line-clamp-1">{resource.author}</p>
                <div className="flex items-center gap-1 text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md">
                  <span className="material-symbols-outlined text-[14px]">cloud_download</span>
                  <span className="font-medium">{resource.downloads}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-surface-container grid grid-cols-2 gap-2">
                <button className="py-2 flex items-center justify-center gap-1.5 bg-primary-container text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[16px]">visibility</span> Đọc
                </button>
                <button className="py-2 flex items-center justify-center gap-1.5 text-on-surface-variant bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold transition-colors">
                    <span className="material-symbols-outlined text-[16px]">download</span> Tải về
                </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 flex justify-center">
         <button className="px-6 py-2 border border-surface-container-high rounded-full text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors">
             Tải thêm tài liệu...
         </button>
      </div>
    </div>
  );
}
