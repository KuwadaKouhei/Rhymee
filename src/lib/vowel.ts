/** カタカナ→子音のマッピングテーブル */
const KATAKANA_TO_CONSONANT: Record<string, string> = {
  // ア行（子音なし）
  ア: "", イ: "", ウ: "", エ: "", オ: "",
  // カ行
  カ: "k", キ: "k", ク: "k", ケ: "k", コ: "k",
  // サ行
  サ: "s", シ: "sh", ス: "s", セ: "s", ソ: "s",
  // タ行
  タ: "t", チ: "ch", ツ: "ts", テ: "t", ト: "t",
  // ナ行
  ナ: "n", ニ: "n", ヌ: "n", ネ: "n", ノ: "n",
  // ハ行
  ハ: "h", ヒ: "h", フ: "f", ヘ: "h", ホ: "h",
  // マ行
  マ: "m", ミ: "m", ム: "m", メ: "m", モ: "m",
  // ヤ行
  ヤ: "y", ユ: "y", ヨ: "y",
  // ラ行
  ラ: "r", リ: "r", ル: "r", レ: "r", ロ: "r",
  // ワ行
  ワ: "w", ヲ: "w",
  // ガ行
  ガ: "g", ギ: "g", グ: "g", ゲ: "g", ゴ: "g",
  // ザ行
  ザ: "z", ジ: "j", ズ: "z", ゼ: "z", ゾ: "z",
  // ダ行
  ダ: "d", ヂ: "j", ヅ: "z", デ: "d", ド: "d",
  // バ行
  バ: "b", ビ: "b", ブ: "b", ベ: "b", ボ: "b",
  // パ行
  パ: "p", ピ: "p", プ: "p", ペ: "p", ポ: "p",
};

/** モーラ（子音+母音のペア） */
export interface Mora {
  consonant: string;
  vowel: string;
}

/**
 * カタカナ文字列をモーラ列に分解する
 * @param reading カタカナの読み
 * @returns モーラの配列
 */
export function toMoraList(reading: string): Mora[] {
  const result: Mora[] = [];
  let lastVowel = "";

  for (const char of reading) {
    if (char === "ー") {
      // 長音: 直前の母音を繰り返す（子音なし）
      if (lastVowel) {
        result.push({ consonant: "", vowel: lastVowel });
      }
    } else if (char === "ン") {
      result.push({ consonant: "", vowel: "N" });
      lastVowel = "N";
    } else if (char === "ッ") {
      // 促音: スキップ
      continue;
    } else if (SMALL_KANA_VOWEL[char]) {
      // 拗音: 前のモーラの母音を置き換える
      const vowel = SMALL_KANA_VOWEL[char];
      if (result.length > 0) {
        result[result.length - 1].vowel = vowel;
      } else {
        result.push({ consonant: "", vowel });
      }
      lastVowel = vowel;
    } else {
      const vowel = KATAKANA_TO_VOWEL[char];
      const consonant = KATAKANA_TO_CONSONANT[char];
      if (vowel !== undefined) {
        result.push({ consonant: consonant ?? "", vowel });
        lastVowel = vowel;
      }
    }
  }

  return result;
}

/**
 * 2つの読みの韻スコアを計算する（0〜100）
 * 100% = 同音異義語（読みが完全一致）のみ
 * それ以外は子音の一致度でスコアリング（最大99%）
 * 末尾から比較し、末尾ほど重みが大きい
 */
export function calculateRhymeScore(inputReading: string, matchReading: string): number {
  // 読みが完全一致 → 同音異義語 → 100%
  if (inputReading === matchReading) return 100;

  const inputMora = toMoraList(inputReading);
  const matchMora = toMoraList(matchReading);

  // 短い方の長さに合わせて末尾から比較
  const len = Math.min(inputMora.length, matchMora.length);
  if (len === 0) return 0;

  let totalWeight = 0;
  let matchedWeight = 0;

  for (let i = 0; i < len; i++) {
    // 末尾からのインデックス
    const inputIdx = inputMora.length - 1 - i;
    const matchIdx = matchMora.length - 1 - i;

    // 末尾ほど重みが大きい（末尾=最大重み、先頭に行くほど減少）
    const weight = len - i;
    totalWeight += weight;

    const im = inputMora[inputIdx];
    const mm = matchMora[matchIdx];

    // 母音が一致していない場合はスコア加算なし
    if (im.vowel !== mm.vowel) continue;

    // 子音が一致していれば重み分を加算
    if (im.consonant === mm.consonant) {
      matchedWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;

  // 最大99%（100%は同音異義語のみ）
  const raw = (matchedWeight / totalWeight) * 99;
  return Math.round(raw);
}

/** カタカナ→母音のマッピングテーブル */
const KATAKANA_TO_VOWEL: Record<string, string> = {
  // ア行
  ア: "a", イ: "i", ウ: "u", エ: "e", オ: "o",
  // カ行
  カ: "a", キ: "i", ク: "u", ケ: "e", コ: "o",
  // サ行
  サ: "a", シ: "i", ス: "u", セ: "e", ソ: "o",
  // タ行
  タ: "a", チ: "i", ツ: "u", テ: "e", ト: "o",
  // ナ行
  ナ: "a", ニ: "i", ヌ: "u", ネ: "e", ノ: "o",
  // ハ行
  ハ: "a", ヒ: "i", フ: "u", ヘ: "e", ホ: "o",
  // マ行
  マ: "a", ミ: "i", ム: "u", メ: "e", モ: "o",
  // ヤ行
  ヤ: "a", ユ: "u", ヨ: "o",
  // ラ行
  ラ: "a", リ: "i", ル: "u", レ: "e", ロ: "o",
  // ワ行
  ワ: "a", ヲ: "o",
  // ガ行
  ガ: "a", ギ: "i", グ: "u", ゲ: "e", ゴ: "o",
  // ザ行
  ザ: "a", ジ: "i", ズ: "u", ゼ: "e", ゾ: "o",
  // ダ行
  ダ: "a", ヂ: "i", ヅ: "u", デ: "e", ド: "o",
  // バ行
  バ: "a", ビ: "i", ブ: "u", ベ: "e", ボ: "o",
  // パ行
  パ: "a", ピ: "i", プ: "u", ペ: "e", ポ: "o",
};

/** 拗音・小書き母音（前の文字の母音を置き換える） */
const SMALL_KANA_VOWEL: Record<string, string> = {
  ャ: "a", ュ: "u", ョ: "o",
  ァ: "a", ィ: "i", ゥ: "u", ェ: "e", ォ: "o",
};

/**
 * カタカナ文字列を母音列に変換する
 * @param reading カタカナの読み
 * @returns 母音列（例: "ouou"）
 */
export function toVowelPattern(reading: string): string {
  let result = "";
  let lastVowel = "";

  for (const char of reading) {
    if (char === "ー") {
      // 長音: 直前の母音を繰り返す
      if (lastVowel) {
        result += lastVowel;
      }
    } else if (char === "ン") {
      // 撥音
      result += "N";
      lastVowel = "N";
    } else if (char === "ッ") {
      // 促音: スキップ
      continue;
    } else if (SMALL_KANA_VOWEL[char]) {
      // 拗音・小書き母音: 前の文字の母音を置き換える
      const vowel = SMALL_KANA_VOWEL[char];
      if (result.length > 0) {
        result = result.slice(0, -1) + vowel;
      } else {
        result += vowel;
      }
      lastVowel = vowel;
    } else {
      const vowel = KATAKANA_TO_VOWEL[char];
      if (vowel) {
        result += vowel;
        lastVowel = vowel;
      }
    }
  }

  return result;
}

/**
 * 母音列からモーラ数を計算する
 * @param vowelPattern 母音列
 * @returns モーラ数
 */
export function countMora(reading: string): number {
  let count = 0;
  for (const char of reading) {
    // 拗音の小書き（ャュョ）は前の文字と合わせて1モーラなのでスキップ
    if (char === "ャ" || char === "ュ" || char === "ョ") {
      continue;
    }
    // 小書き母音（ァィゥェォ）も前の文字と合わせて1モーラなのでスキップ
    if (char === "ァ" || char === "ィ" || char === "ゥ" || char === "ェ" || char === "ォ") {
      continue;
    }
    // それ以外のカタカナ文字・長音・撥音・促音は1モーラ
    if (/[\u30A0-\u30FF]/.test(char)) {
      count++;
    }
  }
  return count;
}
