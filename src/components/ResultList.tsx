"use client";

import { useState, useMemo } from "react";
import type { RhymeMatch } from "@/lib/types";
import ScoreRing from "./ScoreRing";

const PAGE_SIZE = 50;

interface ResultListProps {
  matches: RhymeMatch[];
  inputVowelPattern: string;
  mode: string;
  count: number;
  total: number;
  onWordClick?: (word: string) => void;
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
    return (
      <span className="rounded bg-violet-100 px-1 font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
        {vowelPattern}
      </span>
    );
  }

  if (mode === "suffix") {
    const idx = vowelPattern.length - matchPart.length;
    if (idx >= 0 && vowelPattern.endsWith(matchPart)) {
      return (
        <>
          <span className="text-zinc-400 dark:text-zinc-500">
            {vowelPattern.slice(0, idx)}
          </span>
          <span className="rounded bg-violet-100 px-0.5 font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {matchPart}
          </span>
        </>
      );
    }
  }

  if (mode === "partial") {
    const idx = vowelPattern.indexOf(matchPart);
    if (idx !== -1) {
      return (
        <>
          <span className="text-zinc-400 dark:text-zinc-500">
            {vowelPattern.slice(0, idx)}
          </span>
          <span className="rounded bg-violet-100 px-0.5 font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
            {matchPart}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">
            {vowelPattern.slice(idx + matchPart.length)}
          </span>
        </>
      );
    }
  }

  return (
    <span className="text-zinc-400 dark:text-zinc-500">{vowelPattern}</span>
  );
}

export default function ResultList({
  matches,
  inputVowelPattern,
  mode,
  count,
  total,
  onWordClick,
}: ResultListProps) {
  const [page, setPage] = useState(0);
  const [activePos, setActivePos] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(0);

  // 品詞の一覧を取得
  const posList = useMemo(() => {
    const posSet = new Set(matches.map((m) => m.pos));
    return Array.from(posSet).sort();
  }, [matches]);

  // フィルタリング
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (activePos && m.pos !== activePos) return false;
      if (m.score < minScore) return false;
      return true;
    });
  }, [matches, activePos, minScore]);

  const totalPages = Math.ceil(filteredMatches.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(totalPages - 1, 0));
  const start = safePage * PAGE_SIZE;
  const pageMatches = filteredMatches.slice(start, start + PAGE_SIZE);

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(0)}
          disabled={safePage === 0}
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600
            transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed
            disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          &laquo;
        </button>
        <button
          onClick={() => setPage(safePage - 1)}
          disabled={safePage === 0}
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600
            transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed
            disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          &lsaquo;
        </button>
        <span className="px-2 py-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          {safePage + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPage(safePage + 1)}
          disabled={safePage >= totalPages - 1}
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600
            transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed
            disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => setPage(totalPages - 1)}
          disabled={safePage >= totalPages - 1}
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
      <div className="mt-8 animate-[fade-in_0.3s_ease-out] text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          一致する韻が見つかりませんでした
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full animate-[fade-in-up_0.4s_ease-out]">
      {/* フィルタリングエリア */}
      <div className="mb-4 space-y-3">
        {/* 品詞タブ */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setActivePos(null); setPage(0); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              activePos === null
                ? "bg-violet-600 text-white shadow-sm dark:bg-violet-500"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            すべて
          </button>
          {posList.map((pos) => (
            <button
              key={pos}
              onClick={() => { setActivePos(activePos === pos ? null : pos); setPage(0); }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activePos === pos
                  ? "bg-violet-600 text-white shadow-sm dark:bg-violet-500"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* スコア閾値スライダー */}
        <div className="flex items-center gap-3">
          <label className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            最低スコア:{" "}
            <span className="text-violet-600 dark:text-violet-400">{minScore}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={99}
            value={minScore}
            onChange={(e) => { setMinScore(parseInt(e.target.value, 10)); setPage(0); }}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-200
              accent-violet-600 dark:bg-zinc-700 dark:accent-violet-500"
          />
        </div>
      </div>

      {/* 件数とページネーション */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-violet-600 dark:text-violet-400">
            {filteredMatches.length}
          </span>{" "}
          件{filteredMatches.length !== total && ` / ${total} 件中`}
          {totalPages > 1 && (
            <span className="ml-2">
              （{start + 1}〜{Math.min(start + PAGE_SIZE, filteredMatches.length)}{" "}
              件目）
            </span>
          )}
        </p>
        <Pagination />
      </div>

      {/* 結果カード */}
      <div className="grid gap-3 sm:grid-cols-2">
        {pageMatches.map((match, i) => (
          <div
            key={`${match.word}-${start + i}`}
            onClick={() => onWordClick?.(match.word)}
            className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-4
              shadow-sm transition-all duration-200
              hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10
              active:scale-[0.98]
              dark:border-zinc-700 dark:bg-zinc-800
              dark:hover:border-violet-600 dark:hover:shadow-violet-500/5"
            style={{
              animationDelay: `${(i % 10) * 30}ms`,
            }}
          >
            <div className="flex items-center gap-3">
              <ScoreRing score={match.score} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold text-zinc-900 transition-colors group-hover:text-violet-600 dark:text-zinc-100 dark:group-hover:text-violet-400">
                    {match.word}
                  </h3>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {match.pos}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {match.reading}
                </p>
                <p className="mt-1 font-mono text-sm">
                  {highlightVowelPattern(
                    match.vowelPattern,
                    inputVowelPattern,
                    mode,
                    count
                  )}
                </p>
              </div>
            </div>
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
