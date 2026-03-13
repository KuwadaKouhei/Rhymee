/** wordsテーブルの行データ */
export interface WordRow {
  id: number;
  surface: string;
  reading: string;
  vowel_pattern: string;
  mora_count: number;
  pos: string;
}

/** 検索モード */
export type SearchMode = "exact" | "suffix" | "partial";

/** APIリクエストのクエリパラメータ */
export interface RhymeSearchParams {
  word: string;
  mode?: SearchMode;
  count?: number;
  limit?: number;
  pos?: string;
}

/** APIレスポンスのマッチ結果 */
export interface RhymeMatch {
  word: string;
  reading: string;
  vowelPattern: string;
  pos: string;
  score: number;
}

/** APIレスポンス全体 */
export interface RhymeSearchResponse {
  input: string;
  reading: string;
  vowelPattern: string;
  mode: string;
  count: number;
  matches: RhymeMatch[];
  total: number;
}
