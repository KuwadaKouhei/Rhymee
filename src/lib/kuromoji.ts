import kuromoji from "kuromoji";
import path from "path";

/** kuromoji トークンの型定義 */
export interface Token {
  word_id: number;
  word_type: string;
  word_position: number;
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  pos_detail_2: string;
  pos_detail_3: string;
  conjugated_type: string;
  conjugated_form: string;
  basic_form: string;
  reading?: string;
  pronunciation?: string;
}

/** シングルトンのtokenizerインスタンス */
let tokenizerInstance: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
let tokenizerPromise: Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> | null = null;

/**
 * kuromoji の Tokenizer をシングルトンで取得する
 * @returns Tokenizerインスタンス
 */
export function getTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
  if (tokenizerInstance) {
    return Promise.resolve(tokenizerInstance);
  }
  if (tokenizerPromise) {
    return tokenizerPromise;
  }

  const dicPath = path.resolve(process.cwd(), "node_modules/kuromoji/dict");

  tokenizerPromise = new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath }).build((err, tokenizer) => {
      if (err) {
        tokenizerPromise = null;
        reject(err);
        return;
      }
      tokenizerInstance = tokenizer;
      resolve(tokenizer);
    });
  });

  return tokenizerPromise;
}

/**
 * テキストを形態素解析する
 * @param text 解析対象テキスト
 * @returns トークンの配列
 */
export async function tokenize(text: string): Promise<kuromoji.IpadicFeatures[]> {
  const tokenizer = await getTokenizer();
  return tokenizer.tokenize(text);
}

/**
 * テキストのカタカナ読みを取得する
 * @param text 解析対象テキスト
 * @returns カタカナ読み
 */
export async function getReading(text: string): Promise<string> {
  const tokens = await tokenize(text);
  return tokens
    .map((token) => {
      if (token.reading) {
        return token.reading;
      }
      // readingがない場合はsurface_formをカタカナに変換して使う
      return hiraganaToKatakana(token.surface_form);
    })
    .join("");
}

/**
 * ひらがなをカタカナに変換する
 * @param str ひらがな文字列
 * @returns カタカナ文字列
 */
function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) + 0x60)
  );
}
