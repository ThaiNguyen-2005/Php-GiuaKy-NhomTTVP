import React, { useEffect, useState } from 'react';
import { fetchDigitalDocuments, type DigitalDocument } from '../../api/bookApi';

export default function Digital() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<DigitalDocument[]>([]);

  const displayDocuments =
    activeFilter === 'ALL'
      ? documents
      : documents.filter((doc) => doc.format === activeFilter);

  useEffect(() => {
    fetchDigitalDocuments()
      .then(setDocuments)
      .catch((error) => {
        console.error('Không thể tải tài liệu số:', error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex h-full flex-col space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Tài liệu số</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Truy cập bộ sưu tập E-Book, Audio và bài giảng điện tử 24/7
          </p>
        </div>
      </div>

      <div className="custom-scrollbar flex w-fit shrink-0 gap-2 overflow-x-auto rounded-xl bg-surface-container-low p-1">
        {['ALL', 'PDF', 'EPUB', 'AUDIO', 'SLIDES'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              activeFilter === filter
                ? 'bg-surface-bright text-primary scholar-shadow'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {filter === 'ALL' ? 'Tất cả định dạng' : filter}
          </button>
        ))}
      </div>

      <div className="grid auto-rows-max grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center font-medium text-on-surface-variant">
            Đang tải tài liệu...
          </div>
        ) : (
          displayDocuments.map((resource) => (
            <div
              key={resource.id}
              className="group flex flex-col rounded-2xl border border-surface-container-low bg-surface-bright p-4 scholar-shadow transition-colors hover:border-primary/30"
            >
              <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-surface-container">
                <img
                  src={resource.cover || ''}
                  alt={resource.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span
                    className={`${resource.color} select-none rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md`}
                  >
                    {resource.format}
                  </span>
                  <span className="text-[10px] font-medium text-white">{resource.size}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  {resource.type}
                </span>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-on-surface transition-colors group-hover:text-primary">
                  {resource.title}
                </h3>

                <div className="mt-1.5 flex items-center justify-between">
                  <p className="line-clamp-1 text-xs text-on-surface-variant">{resource.author}</p>
                  <div className="flex items-center gap-1 rounded-md bg-surface-container-low px-2 py-0.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">cloud_download</span>
                    <span className="font-medium">{resource.downloads}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
