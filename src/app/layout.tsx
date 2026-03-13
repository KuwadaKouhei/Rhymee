import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rhymee - 日本語韻検索",
  description:
    "日本語の単語を入力すると、同じ母音パターンを持つ単語を見つけます。韻を踏むラップやポエムの作成に。",
  metadataBase: new URL("https://rhymee.vercel.app"),
  openGraph: {
    title: "Rhymee - 日本語韻検索エンジン",
    description:
      "日本語の単語を入力すると、同じ母音パターンを持つ単語を見つけます。スコアリング機能付き。",
    url: "https://rhymee.vercel.app",
    siteName: "Rhymee",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rhymee - 日本語韻検索エンジン",
    description:
      "日本語の韻を見つけよう。母音パターン検索 & スコアリング。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
