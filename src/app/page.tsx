"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import SearchForm from "@/components/SearchForm";
import ResultList from "@/components/ResultList";
import SkeletonCard from "@/components/SkeletonCard";
import type { SearchMode, RhymeSearchResponse } from "@/lib/types";

const HISTORY_KEY = "rhymee-search-history";
const MAX_HISTORY = 10;

function getHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToHistory(word: string) {
  const history = getHistory().filter((w) => w !== word);
  history.unshift(word);
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history.slice(0, MAX_HISTORY))
  );
}

export default function Home() {
  const [result, setResult] = useState<RhymeSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchFormRef = useRef<{ setWord: (word: string) => void; submit: () => void } | null>(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // キーボードショートカット: / でフォーカス
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>(
          'input[type="text"]'
        );
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = useCallback(
    async (word: string, mode: SearchMode, count: number, shuffle: boolean) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          word,
          mode,
          count: String(count),
          shuffle: String(shuffle),
        });

        const res = await fetch(`/api/rhyme?${params}`);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "検索に失敗しました");
        }

        const data: RhymeSearchResponse = await res.json();
        setResult(data);

        addToHistory(word);
        setHistory(getHistory());
        setShowHistory(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "予期しないエラーが発生しました"
        );
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleWordClick = useCallback((word: string) => {
    if (searchFormRef.current) {
      searchFormRef.current.setWord(word);
      searchFormRef.current.submit();
    }
  }, []);

  const handleHistoryClick = useCallback((word: string) => {
    if (searchFormRef.current) {
      searchFormRef.current.setWord(word);
      searchFormRef.current.submit();
    }
    setShowHistory(false);
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8 dark:bg-zinc-900">
      <main className="w-full max-w-2xl">
        {/* ヒーローセクション */}
        <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-center shadow-xl dark:from-violet-800 dark:via-purple-800 dark:to-indigo-900">
          {/* 背景装飾 */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10 animate-[pulse-soft_3s_ease-in-out_infinite]" />
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10 animate-[pulse-soft_4s_ease-in-out_infinite_1s]" />
            <div className="absolute left-1/2 top-4 h-16 w-16 -translate-x-1/2 rounded-full bg-white/5 animate-[float_6s_ease-in-out_infinite]" />
          </div>

          <div className="relative z-10">
            <h1 className="animate-[fade-in_0.6s_ease-out] text-5xl font-bold tracking-tight text-white">
              Rhyme<span className="text-violet-200">e</span>
            </h1>
            <p className="mt-3 animate-[fade-in-up_0.6s_ease-out_0.2s_both] text-lg text-violet-100/90">
              日本語の韻を見つけよう
            </p>
            <p className="mt-1 animate-[fade-in-up_0.6s_ease-out_0.4s_both] text-sm text-violet-200/60">
              <kbd className="rounded border border-violet-300/30 bg-violet-500/30 px-1.5 py-0.5 font-mono text-xs">/</kbd> で検索にフォーカス
            </p>
          </div>
        </div>

        {/* 検索フォーム */}
        <div className="animate-[fade-in-up_0.4s_ease-out_0.3s_both]">
          <SearchForm
            ref={searchFormRef}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>

        {/* 検索履歴 */}
        {history.length > 0 && !result && !isLoading && (
          <div className="mt-4 animate-[fade-in_0.3s_ease-out]">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                検索履歴 {showHistory ? "▲" : "▼"}
              </button>
              {showHistory && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-zinc-400 transition-colors hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
                >
                  クリア
                </button>
              )}
            </div>
            {showHistory && (
              <div className="mt-2 flex flex-wrap gap-2">
                {history.map((word) => (
                  <button
                    key={word}
                    onClick={() => handleHistoryClick(word)}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-violet-600 dark:hover:bg-violet-950/30 dark:hover:text-violet-300"
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 入力情報 */}
        {result && (
          <div className="mt-6 animate-[fade-in-up_0.3s_ease-out] rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                入力:{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {result.input}
                </span>
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                読み:{" "}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {result.reading}
                </span>
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                母音:{" "}
                <span className="font-mono font-medium text-violet-600 dark:text-violet-400">
                  {result.vowelPattern}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="mt-6 animate-[scale-in_0.2s_ease-out] rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* スケルトンローディング */}
        {isLoading && (
          <div className="mt-8 w-full">
            <div className="mb-4 flex items-center justify-between">
              <div className="skeleton h-4 w-24 rounded-md" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        )}

        {/* 結果一覧 */}
        {result && !isLoading && (
          <ResultList
            key={`${result.input}-${result.mode}-${result.count}`}
            matches={result.matches}
            inputVowelPattern={result.vowelPattern}
            mode={result.mode}
            count={result.count}
            total={result.total}
            onWordClick={handleWordClick}
          />
        )}
      </main>

      {/* フッター */}
      <footer className="mt-16 w-full border-t border-zinc-200 py-6 text-center dark:border-zinc-800">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Rhyme<span className="text-violet-500">e</span> - 日本語韻検索エンジン
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/KuwadaKouhei/Rhymee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              GitHub
            </a>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <a
              href="/api/rhyme?word=東京"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              API
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
