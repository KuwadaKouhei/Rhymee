"use client";

/**
 * 検索結果のスケルトンローディングカード
 */
export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-md" />
        </div>
        <div className="skeleton h-5 w-12 rounded-full" />
      </div>
      <div className="skeleton mt-2 h-4 w-24 rounded-md" />
      <div className="skeleton mt-2 h-4 w-16 rounded-md" />
    </div>
  );
}
