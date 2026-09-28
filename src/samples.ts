import type { Lang } from './i18n';

export interface SampleSnippet {
  title: string;
  category: string;
  body: string;
}

const ja: SampleSnippet[] = [
  {
    title: 'いつもの挨拶（メール）',
    category: 'ビジネス',
    body: 'いつもお世話になっております。\n株式会社〇〇の山田です。',
  },
  {
    title: 'お礼',
    category: 'ビジネス',
    body: 'ご丁寧にありがとうございます。\n今後ともどうぞよろしくお願いいたします。',
  },
  {
    title: '日程調整',
    category: 'ビジネス',
    body: '以下の日程でご都合はいかがでしょうか。\n・〇月〇日（〇）10:00〜11:00\n・〇月〇日（〇）14:00〜15:00\nご検討のほど、よろしくお願いいたします。',
  },
  {
    title: '住所テンプレート',
    category: '住所',
    body: '〒000-0000\n東京都〇〇区〇〇町1-2-3 〇〇マンション101\n山田 太郎\nTEL 090-0000-0000',
  },
  {
    title: '遅刻の連絡',
    category: '連絡',
    body: '申し訳ありません、電車遅延のため10分ほど遅れます。到着しましたらご連絡します。',
  },
  {
    title: '体調不良でお休み',
    category: '連絡',
    body: 'おはようございます。体調不良のため、本日はお休みをいただきたく存じます。ご迷惑をおかけして申し訳ありません。',
  },
];

const en: SampleSnippet[] = [
  { title: 'Email greeting', category: 'Work', body: 'Hi,\n\nThanks for getting in touch.' },
  { title: 'Thank you', category: 'Work', body: 'Thank you so much — I really appreciate it.' },
  {
    title: 'Scheduling',
    category: 'Work',
    body: 'Would any of these times work for you?\n• Mon 10:00–11:00\n• Wed 14:00–15:00',
  },
  {
    title: 'Address template',
    category: 'Address',
    body: 'Taro Yamada\n1-2-3 Example-cho, Example-ku\nTokyo 000-0000, Japan\nTel +81 90-0000-0000',
  },
  { title: 'Running late', category: 'Messages', body: 'Sorry, my train is delayed — I’ll be about 10 minutes late.' },
];

export function samples(lang: Lang): SampleSnippet[] {
  return lang === 'ja' ? ja : en;
}
