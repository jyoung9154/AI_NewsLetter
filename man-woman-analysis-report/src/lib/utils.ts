import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTitle(title: string): string {
  // 이미 줄바꿈이 있다면 그대로 반환
  if (title.includes('\n')) return title;

  // 물음표(?)나 느낌표(!) 뒤에 공백이 있다면 줄바꿈으로 변경 (마지막 글자 제외)
  // 예: "제목인가요? 네" -> "제목인가요?\n네"
  const formatted = title.replace(/([?|!])\s+(?!$)/g, '$1\n');

  return formatted;
}