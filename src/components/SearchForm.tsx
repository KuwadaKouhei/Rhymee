"use client";

import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import type { SearchMode } from "@/lib/types";

interface SearchFormProps {
  onSearch: (word: string, mode: SearchMode, count: number, shuffle: boolean) => void;
  isLoading: boolean;
}

export interface SearchFormHandle {
  setWord: (word: string) => void;
  submit: () => void;
}

const MODE_LABELS: Record<SearchMode, string> = {
  suffix: "末尾一致",
  exact: "完全一致",
  partial: "部分一致",
};

const SearchForm = forwardRef<SearchFormHandle, SearchFormProps>(
  function SearchForm({ onSearch, isLoading }, ref) {
    const [word, setWord] = useState("");
    const [mode, setMode] = useState<SearchMode>("suffix");
    const [count, setCount] = useState(3);
    const [shuffle, setShuffle] = useState(false);
    const [optionsOpen, setOptionsOpen] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      setWord: (w: string) => setWord(w),
      submit: () => {
        // 次のティックで実行して state 更新を反映
        setTimeout(() => {
          const input = inputRef.current;
          if (input) {
            const currentWord = input.value.trim();
            if (currentWord) {
              onSearch(currentWord, mode, count, shuffle);
            }
          }
        }, 0);
      },
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!word.trim()) return;
      onSearch(word.trim(), mode, count, shuffle);
    };

    return (
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* 検索入力 */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="韻を踏みたい単語を入力..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-lg
              text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-all
              focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20
              focus:shadow-lg focus:shadow-violet-500/5
              dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100
              dark:placeholder-zinc-500 dark:focus:border-violet-500
              dark:focus:ring-violet-500/20"
          />
          <button
            type="submit"
            disabled={isLoading || !word.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-violet-600
              px-5 py-2.5 text-sm font-medium text-white transition-all
              hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/25
              active:scale-95
              disabled:cursor-not-allowed disabled:opacity-50
              dark:bg-violet-500 dark:hover:bg-violet-600"
          >
            {isLoading ? (
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              "検索"
            )}
          </button>
        </div>

        {/* オプション折りたたみ */}
        <button
          type="button"
          onClick={() => setOptionsOpen(!optionsOpen)}
          className="flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 md:hidden"
        >
          検索オプション
          <svg
            className={`h-4 w-4 transition-transform ${optionsOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className={`space-y-4 ${optionsOpen ? "block" : "hidden md:block"}`}>
          {/* モード切り替え */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              モード:
            </span>
            <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {(Object.entries(MODE_LABELS) as [SearchMode, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMode(key)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                      mode === key
                        ? "bg-white text-violet-700 shadow-sm dark:bg-zinc-700 dark:text-violet-400"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* suffix モード時のカウントスライダー */}
          {mode === "suffix" && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                末尾一致文字数:{" "}
                <span className="text-violet-600 dark:text-violet-400">{count}</span>
              </label>
              <input
                type="range"
                min={1}
                max={8}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-200
                  accent-violet-600 dark:bg-zinc-700 dark:accent-violet-500"
              />
            </div>
          )}

          {/* ランダム表示トグル */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              ランダム:
            </span>
            <button
              type="button"
              onClick={() => setShuffle(!shuffle)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                shuffle
                  ? "bg-violet-600 dark:bg-violet-500"
                  : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  shuffle ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {shuffle ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </form>
    );
  }
);

export default SearchForm;
