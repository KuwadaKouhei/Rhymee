"use client";

import { useState } from "react";
import type { RhymeMatch } from "@/lib/types";

const PAGE_SIZE = 50;

interface ResultListProps {
  matches: RhymeMatch[];
  inputVowelPattern: string;
  mode: string;
  count: number;
  total: number;
}

/**
 * 母音パターンの一致部分をハイライトしたJSXを返す
 */
function highlightVowelPattern(
  vowelPattern: string,
  inputVowelPattern: string,
  mode: string,
  count: number
): React.ReactNode {
  let matchPart = "";

  if (mode === "exact") {
    matchPart = inputVowelPattern;
  } else if (mode === "suffix") {
    matchPart = inputVowelPattern.slice(-count);
  } else {
    matchPart = inputVowelPattern;
  }

  if (mode === "exact") {
    return <span className="text-violet-600 dark:text-violet-400 font-medium">{vowelPattern}</span>;
  }

  if (mode === "suffix") {
    const idx = vowelPattern.length - matchPart.length;
    if (idx >= 0 && vowelPattern.endsWith(matchPart)) {
      return (
        <>
          <span className="text-zinc-500 dark:text-zinc-400">{vowelPattern.slice(0, idx)}</span>
          <span className="text-violet-600 dark:text-violet-400 font-medium">{matchPart}</span>
        </>
      );
    }
  }

  if (mode === "partial") {
    const idx = vowelPattern.indexOf(matchPart);
    if (idx !== -1) {
      return (
        <>
          <span className="text-zinc-500 dark:text-zinc-400">{vowelPattern.slice(0, idx)}</span>
          <span className="text-violet-600 dark:text-violet-400 font-medium">{matchPart}</span>
          <span className="text-zinc-500 dark:text-zinc-400">{vowelPattern.slice(idx + matchPart.length)}</span>
        </>
      );
    }
  }

  return <span className="text-zinc-500 dark:text-zinc-400">{vowelPattern}</span>;
}

export default function ResultList({
  matches,
  inputVowelPattern,
  mode,
  count,
  total,
}: ResultListProps) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(matches.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const pageMatches = matches.slice(start, start + PAGE_SIZE);

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(0)}
          disabled={page === 0}
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600
            transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed
            disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          &laquo;
        </button>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600
            transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed
            disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          &lsaquo;
        </button>
        <span className="px-2 py-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages - 1}
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600
            transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed
            disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => setPage(totalPages - 1)}
          disabled={page >= totalPages - 1}
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600
            transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed
            disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          &raquo;
        </button>
      </div>
    );
  };

  if (matches.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          一致する韻が見つかりませんでした
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-violet-600 dark:text-violet-400">{total}</span> 件の結果
          {totalPages > 1 && (
            <span className="ml-2">
              （{start + 1}〜{Math.min(start + PAGE_SIZE, matches.length)} 件目）
            </span>
          )}
        </p>
        <Pagination />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {pageMatches.map((match, i) => (
          <div
            key={`${match.word}-${start + i}`}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm
              transition-colors hover:border-violet-200 hover:shadow-md
              dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-violet-800"
          >
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {match.word}
                </h3>
                <span className={`text-xs font-bold ${
                  match.score >= 80
                    ? "text-emerald-600 dark:text-emerald-400"
                    : match.score >= 50
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-zinc-400 dark:text-zinc-500"
                }`}>
                  {match.score}%
                </span>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium
                text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {match.pos}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {match.reading}
            </p>
            <p className="mt-2 font-mono text-sm">
              {highlightVowelPattern(match.vowelPattern, inputVowelPattern, mode, count)}
            </p>
          </div>
        ))}
      </div>

      {/* 下部ページネーション */}
      <div className="mt-6 flex justify-center">
        <Pagination />
      </div>
    </div>
  );
}
