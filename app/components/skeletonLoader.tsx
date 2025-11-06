import React from 'react'

export default function SkeletonLoader() {
  return (
    <div className="max-w-[470px] w-full mx-auto opacity-100 transition-opacity duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 pl-1">
          <div className="size-9 rounded-full bg-gray-700 animate-shimmer" />
          <div className="space-y-1">
            <div className="h-4 w-24 bg-gray-700 rounded animate-shimmer" />
            <div className="h-3 w-12 bg-gray-700 rounded animate-shimmer" />
          </div>
        </div>
        <div className="w-6 h-6 bg-gray-700 rounded animate-shimmer" />
      </div>

      {/* Image Skeleton */}
      <div className="border border-[#262626] rounded-sm">
        <div className="aspect-square bg-gray-700 animate-shimmer" />
      </div>

      {/* Footer Skeleton */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-gray-700 rounded animate-shimmer" />
            <div className="w-6 h-6 bg-gray-700 rounded animate-shimmer" />
            <div className="w-6 h-6 bg-gray-700 rounded animate-shimmer" />
          </div>
          <div className="w-6 h-6 bg-gray-700 rounded animate-shimmer" />
        </div>

        <div className="mb-2">
          <div className="h-4 w-16 bg-gray-700 rounded animate-shimmer" />
        </div>

        <div className="mb-2 space-y-1">
          <div className="h-4 w-full bg-gray-700 rounded animate-shimmer" />
          <div className="h-4 w-3/4 bg-gray-700 rounded animate-shimmer" />
        </div>

        <div className="mb-2">
          <div className="h-4 w-32 bg-gray-700 rounded animate-shimmer" />
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-[#262626]">
          <div className="w-6 h-6 rounded-full bg-gray-700 animate-shimmer" />
          <div className="h-4 w-full bg-gray-700 rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
}