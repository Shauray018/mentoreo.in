"use client";

export default function MentorCardSkeleton() {
  return (
    <div className="min-w-[280px] md:min-w-0 snap-center bg-white rounded-[24px] p-3 shadow-sm border border-gray-100 flex flex-col relative animate-pulse">
      <div className="w-full h-40 rounded-[16px] bg-gray-200 mb-3" />
      <div className="px-1 flex flex-col flex-1">
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
        <div className="flex gap-2 mb-4">
          <div className="h-5 w-12 bg-gray-100 rounded" />
          <div className="h-5 w-16 bg-gray-100 rounded" />
          <div className="h-5 w-10 bg-gray-100 rounded" />
        </div>
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-10 bg-gray-200 rounded" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
