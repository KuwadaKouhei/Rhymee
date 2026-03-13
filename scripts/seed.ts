import kuromoji from "kuromoji";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { toVowelPattern, countMora } from "../src/lib/vowel";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("環境変数 NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください");
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface WordEntry {
  surface: string;
  reading: string;
  vowel_pattern: string;
  mora_count: number;
  pos: string;
}

/**
 * kuromoji の辞書からエントリを抽出する
 */
async function extractWordsFromDictionary(): Promise<WordEntry[]> {
  const dicPath = path.resolve("node_modules/kuromoji/dict");

  const tokenizer = await new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>(
    (resolve, reject) => {
      kuromoji.builder({ dicPath }).build((err, tokenizer) => {
        if (err) reject(err);
        else resolve(tokenizer);
      });
    }
  );

  // よく使われる日本語単語リストを生成するため、
  // 代表的な日本語テキストを形態素解析して辞書のエントリを取り出す
  // ここでは kuromoji の内部辞書 (TokenInfoDictionary) から直接取得する
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dict = (tokenizer as any).token_info_dictionary;
  const words = new Map<string, WordEntry>();

  const featuresIdx = dict.target_map;

  for (const key in featuresIdx) {
    const wordIds: number[] = featuresIdx[key];
    for (const wordId of wordIds) {
      try {
        const featuresStr: string = dict.getFeatures(wordId);
        if (!featuresStr) continue;

        const features = featuresStr.split(",");
        if (features.length < 9) continue;

        const surface = features[0];
        const pos = features[1];        // 品詞
        const posDetail1 = features[2]; // 品詞細分類1
        // features[3] = 品詞細分類2（未使用）
        const reading = features[8];

        // 読みがないエントリはスキップ
        if (!reading || !surface) continue;

        // 許可する品詞の組み合わせのみ通す
        const skipPos = ["記号", "助詞", "助動詞", "BOS/EOS", "接頭詞", "接続詞", "フィラー"];
        if (skipPos.includes(pos)) continue;

        // 固有名詞は除外（地名・人名・組織名）
        if (posDetail1 === "固有名詞") continue;

        // 非自立語は除外（「こと」「もの」など）
        if (posDetail1 === "非自立") continue;

        // 接尾辞は除外
        if (posDetail1 === "接尾") continue;

        // 動詞の活用形は基本形のみ残す（features[6] が基本形）
        if (pos === "動詞" && features[6] !== "基本形") continue;

        // 形容詞も基本形のみ
        if (pos === "形容詞" && features[6] !== "基本形") continue;

        // 1文字の単語はスキップ（韻として有用性が低い）
        if (surface.length < 2) continue;

        // 長すぎる複合語はスキップ（8文字以上）
        if (surface.length > 7) continue;

        // カタカナだけの読みであることを確認
        if (!/^[ァ-ヴー]+$/.test(reading)) continue;

        // 重複チェック
        if (words.has(surface)) continue;

        const vowelPattern = toVowelPattern(reading);
        if (!vowelPattern) continue;

        words.set(surface, {
          surface,
          reading,
          vowel_pattern: vowelPattern,
          mora_count: countMora(reading),
          pos,
        });
      } catch {
        // 不正なエントリはスキップ
        continue;
      }
    }
  }

  return Array.from(words.values());
}

/**
 * Supabase にバッチでデータを投入する
 */
async function seedDatabase(entries: WordEntry[]): Promise<void> {
  const BATCH_SIZE = 1000;
  const total = entries.length;

  console.log(`${total}件のエントリを投入します...`);

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("words")
      .upsert(batch, { onConflict: "surface" });

    if (error) {
      console.error(`バッチ ${i / BATCH_SIZE + 1} でエラー:`, error.message);
      continue;
    }

    const progress = Math.min(i + BATCH_SIZE, total);
    console.log(`進捗: ${progress}/${total} (${Math.round((progress / total) * 100)}%)`);
  }

  console.log("投入完了！");
}

async function main() {
  // 既存データを削除
  console.log("既存データを削除中...");
  const { error: deleteError } = await supabase
    .from("words")
    .delete()
    .gte("id", 0);
  if (deleteError) {
    console.error("削除エラー:", deleteError.message);
    return;
  }

  console.log("辞書からデータを抽出中...");
  const entries = await extractWordsFromDictionary();
  console.log(`${entries.length}件のエントリを抽出しました`);

  await seedDatabase(entries);
}

main().catch(console.error);
