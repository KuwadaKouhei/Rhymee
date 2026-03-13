import { NextRequest, NextResponse } from "next/server";
import { getReading } from "@/lib/kuromoji";
import { toVowelPattern, calculateRhymeScore } from "@/lib/vowel";
import { supabase } from "@/lib/supabase";
import type { SearchMode, RhymeSearchResponse, WordRow } from "@/lib/types";

/**
 * GET /api/rhyme - 韻検索エンドポイント
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // パラメータ取得
  const word = searchParams.get("word");
  const mode = (searchParams.get("mode") || "suffix") as SearchMode;
  const count = Math.max(1, parseInt(searchParams.get("count") || "3", 10));
  const limit = searchParams.get("limit")
    ? Math.max(1, parseInt(searchParams.get("limit")!, 10))
    : undefined; // 未指定なら全件返す
  const pos = searchParams.get("pos");
  const shuffle = searchParams.get("shuffle") === "true"; // デフォルトfalse

  // バリデーション
  if (!word) {
    return NextResponse.json(
      { error: "パラメータ 'word' は必須です" },
      { status: 400 }
    );
  }

  if (!["exact", "suffix", "partial"].includes(mode)) {
    return NextResponse.json(
      { error: "パラメータ 'mode' は exact, suffix, partial のいずれかです" },
      { status: 400 }
    );
  }

  // 形態素解析で読みを取得
  let reading: string;
  let vowelPattern: string;
  try {
    reading = await getReading(word);
    vowelPattern = toVowelPattern(reading);
  } catch (err) {
    console.error("形態素解析エラー:", err);
    return NextResponse.json(
      { error: "形態素解析に失敗しました" },
      { status: 500 }
    );
  }

  // DB検索
  try {
    // 全件取得のためページネーションで取得
    const PAGE_SIZE = 1000;
    let allData: WordRow[] = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from("words")
        .select("*")
        .neq("surface", word)
        .range(from, from + PAGE_SIZE - 1);

      if (mode === "exact") {
        query = query.eq("vowel_pattern", vowelPattern);
      } else if (mode === "suffix") {
        const suffixPattern = vowelPattern.slice(-count);
        query = query.like("vowel_pattern", `%${suffixPattern}`);
      } else {
        query = query.like("vowel_pattern", `%${vowelPattern}%`);
      }

      if (pos) {
        query = query.eq("pos", pos);
      }

      const { data: pageData, error: pageError } = await query;

      if (pageError) {
        console.error("DB検索エラー:", pageError);
        return NextResponse.json(
          { error: "データベース接続に失敗しました" },
          { status: 503 }
        );
      }

      allData = allData.concat(pageData as WordRow[]);
      hasMore = (pageData?.length ?? 0) === PAGE_SIZE;
      from += PAGE_SIZE;
    }

    const data = allData;
    const error = null;

    if (error) {
      console.error("DB検索エラー:", error);
      return NextResponse.json(
        { error: "データベース接続に失敗しました" },
        { status: 503 }
      );
    }

    const rows = data as WordRow[];

    // スコア計算
    const scored = rows.map((row) => ({
      word: row.surface,
      reading: row.reading,
      vowelPattern: row.vowel_pattern,
      pos: row.pos,
      score: calculateRhymeScore(reading, row.reading),
    }));

    if (shuffle) {
      // シャッフル（Fisher-Yates）
      for (let i = scored.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [scored[i], scored[j]] = [scored[j], scored[i]];
      }
    } else {
      // スコア降順でソート
      scored.sort((a, b) => b.score - a.score);
    }

    // limit が指定されていれば切り詰める
    const matches = limit ? scored.slice(0, limit) : scored;

    const response: RhymeSearchResponse = {
      input: word,
      reading,
      vowelPattern,
      mode,
      count,
      matches,
      total: rows.length,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("予期しないエラー:", err);
    return NextResponse.json(
      { error: "データベース接続に失敗しました" },
      { status: 503 }
    );
  }
}
