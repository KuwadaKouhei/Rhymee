"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import ResultList from "@/components/ResultList";
import type { SearchMode, RhymeSearchResponse } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<RhymeSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (word: string, mode: SearchMode, count: number, shuffle: boolean) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-12 dark:bg-zinc-900">
      <main className="w-full max-w-2xl">
        {/* ヘッダー */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Rhyme<span className="text-violet-600 dark:text-violet-400">e</span>
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            日本語の韻を見つけよう
          </p>
        </div>

        {/* 検索フォーム */}
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {/* 入力情報 */}
        {result && (
          <div className="mt-6 rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                入力: <span className="font-medium text-zinc-900 dark:text-zinc-100">{result.input}</span>
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                読み: <span className="font-medium text-zinc-900 dark:text-zinc-100">{result.reading}</span>
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                母音: <span className="font-mono font-medium text-violet-600 dark:text-violet-400">{result.vowelPattern}</span>
              </span>
            </div>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4
            dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 結果一覧 */}
        {result && (
          <ResultList
            key={`${result.input}-${result.mode}-${result.count}`}
            matches={result.matches}
            inputVowelPattern={result.vowelPattern}
            mode={result.mode}
            count={result.count}
            total={result.total}
          />
        )}
      </main>
    </div>
  );
}
