# Rhyme Finder - 韻検索API & Webアプリ

## プロジェクト概要

日本語の単語を入力すると、同じ母音パターンを持つ単語を返すWebアプリ & パブリックAPI。

## 技術スタック

- Frontend: Next.js 14+ (App Router) + Tailwind CSS
- Backend: Next.js API Routes (Route Handlers)
- DB: Supabase (PostgreSQL)
- 形態素解析: kuromoji.js
- 言語: TypeScript（strict mode）
- デプロイ: Vercel + Supabase

## ディレクトリ構成

```
rhyme-finder/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 検索UI
│   │   ├── layout.tsx
│   │   └── api/
│   │       └── rhyme/
│   │           └── route.ts      # GET /api/rhyme
│   ├── lib/
│   │   ├── kuromoji.ts           # 形態素解析ラッパー（シングルトン）
│   │   ├── vowel.ts              # カタカナ→母音列変換ロジック
│   │   ├── supabase.ts           # Supabaseクライアント
│   │   └── types.ts              # 共通型定義
│   └── components/
│       ├── SearchForm.tsx        # 検索フォーム
│       └── ResultList.tsx        # 結果一覧
├── scripts/
│   └── seed.ts                   # 辞書データ投入スクリプト（ts-node）
├── supabase/
│   └── migrations/
│       └── 001_create_words.sql
├── .env.local.example
├── CLAUDE.md
└── README.md
```

## DB設計

### words テーブル

| カラム        | 型           | 説明                   |
| ------------- | ------------ | ---------------------- |
| id            | SERIAL       | PK                     |
| surface       | VARCHAR(100) | 表層形（例: 東京）     |
| reading       | VARCHAR(100) | 読み（例: トウキョウ） |
| vowel_pattern | VARCHAR(200) | 母音列（例: ouou）     |
| mora_count    | INT          | モーラ数               |
| pos           | VARCHAR(50)  | 品詞（名詞、動詞など） |

- `vowel_pattern` にBTreeインデックス
- `mora_count` にBTreeインデックス

## API仕様

### GET /api/rhyme

| パラメータ | 型     | 必須 | 説明                                                                   |
| ---------- | ------ | ---- | ---------------------------------------------------------------------- |
| word       | string | ✅   | 検索対象の単語                                                         |
| mode       | string | -    | exact（完全一致）/ suffix（末尾一致、デフォルト）/ partial（部分一致） |
| count      | number | -    | 末尾一致時の母音文字数（デフォルト: 3）                                |
| limit      | number | -    | 最大取得件数（デフォルト: 50, 上限: 200）                              |
| pos        | string | -    | 品詞フィルタ（例: 名詞）                                               |

### レスポンス例

```json
{
  "input": "東京",
  "reading": "トウキョウ",
  "vowelPattern": "ouou",
  "mode": "suffix",
  "count": 3,
  "matches": [
    {
      "word": "投球",
      "reading": "トウキュウ",
      "vowelPattern": "ouuu",
      "pos": "名詞"
    }
  ],
  "total": 42
}
```

## 母音変換ルール

- 基本: カタカナ各文字を母音にマッピング（ア→a, カ→a, サ→a...）
- 長音「ー」: 直前の母音を繰り返す
- 撥音「ン」: "N" として扱う
- 促音「ッ」: スキップ（母音なし）
- 拗音「ャュョ」: 対応する母音（a, u, o）
- 小書き「ァィゥェォ」: 対応する母音

## コーディング規約

- TypeScript strict mode
- 関数にはJSDocコメント
- エラーハンドリングは try-catch + 適切なHTTPステータスコード
- 環境変数は .env.local（.env.local.example をテンプレートとして用意）
- kuromoji.jsのtokenizerはシングルトンパターンで初期化
