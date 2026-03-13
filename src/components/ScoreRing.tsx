"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
}

/**
 * 円形プログレスリングでスコアを表示するコンポーネント
 */
export default function ScoreRing({ score, size = 40 }: ScoreRingProps) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "stroke-emerald-500 dark:stroke-emerald-400"
      : score >= 50
        ? "stroke-amber-500 dark:stroke-amber-400"
        : "stroke-zinc-400 dark:stroke-zinc-500";

  const textColor =
    score >= 80
      ? "fill-emerald-600 dark:fill-emerald-400"
      : score >= 50
        ? "fill-amber-600 dark:fill-amber-400"
        : "fill-zinc-500 dark:fill-zinc-400";

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        className="score-ring-bg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <circle
        className={`score-ring-fill ${color}`}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ "--target-offset": offset } as React.CSSProperties}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className={`text-[10px] font-bold ${textColor}`}
      >
        {score}
      </text>
    </svg>
  );
}
