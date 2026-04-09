export interface Vocabulary {
  id: string;
  hanzi: string;
  pinyin: string;
  vietnamese: string;
  english: string;
  category: string;
  level: 'HSK1' | 'HSK2' | 'HSK3';
  image?: string;
  audio?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: number;
  order: number;
  vocabIds: string[];
}

export const VOCABULARY: Vocabulary[] = [
  {
    id: 'v1',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    vietnamese: 'Xin chào',
    english: 'Hello',
    category: 'Greetings',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/hello/400/300'
  },
  {
    id: 'v2',
    hanzi: '谢谢',
    pinyin: 'xièxie',
    vietnamese: 'Cảm ơn',
    english: 'Thank you',
    category: 'Greetings',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/thanks/400/300'
  },
  {
    id: 'v3',
    hanzi: '再见',
    pinyin: 'zàijiàn',
    vietnamese: 'Tạm biệt',
    english: 'Goodbye',
    category: 'Greetings',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/goodbye/400/300'
  },
  {
    id: 'v4',
    hanzi: '我',
    pinyin: 'wǒ',
    vietnamese: 'Tôi',
    english: 'I / Me',
    category: 'Pronouns',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/me/400/300'
  },
  {
    id: 'v5',
    hanzi: '你',
    pinyin: 'nǐ',
    vietnamese: 'Bạn',
    english: 'You',
    category: 'Pronouns',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/you/400/300'
  },
  {
    id: 'v6',
    hanzi: '他',
    pinyin: 'tā',
    vietnamese: 'Anh ấy',
    english: 'He / Him',
    category: 'Pronouns',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/he/400/300'
  },
  {
    id: 'v7',
    hanzi: '一',
    pinyin: 'yī',
    vietnamese: 'Một',
    english: 'One',
    category: 'Numbers',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/one/400/300'
  },
  {
    id: 'v8',
    hanzi: '二',
    pinyin: 'èr',
    vietnamese: 'Hai',
    english: 'Two',
    category: 'Numbers',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/two/400/300'
  },
  {
    id: 'v9',
    hanzi: '三',
    pinyin: 'sān',
    vietnamese: 'Ba',
    english: 'Three',
    category: 'Numbers',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/three/400/300'
  },
  {
    id: 'v10',
    hanzi: '爸爸',
    pinyin: 'bàba',
    vietnamese: 'Bố',
    english: 'Father',
    category: 'Family',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/father/400/300'
  },
  {
    id: 'v11',
    hanzi: '妈妈',
    pinyin: 'māma',
    vietnamese: 'Mẹ',
    english: 'Mother',
    category: 'Family',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/mother/400/300'
  },
  {
    id: 'v12',
    hanzi: '老师',
    pinyin: 'lǎoshī',
    vietnamese: 'Thầy/Cô giáo',
    english: 'Teacher',
    category: 'People',
    level: 'HSK1',
    image: 'https://picsum.photos/seed/teacher/400/300'
  }
];

export const LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Bài 1: Chào hỏi cơ bản',
    description: 'Học cách chào hỏi và cảm ơn trong tiếng Trung.',
    level: 1,
    order: 1,
    vocabIds: ['v1', 'v2', 'v3']
  },
  {
    id: 'l2',
    title: 'Bài 2: Đại từ nhân xưng',
    description: 'Học các đại từ cơ bản: Tôi, Bạn, Anh ấy.',
    level: 1,
    order: 2,
    vocabIds: ['v4', 'v5', 'v6']
  },
  {
    id: 'l3',
    title: 'Bài 3: Số đếm cơ bản',
    description: 'Học cách đếm từ 1 đến 3.',
    level: 1,
    order: 3,
    vocabIds: ['v7', 'v8', 'v9']
  },
  {
    id: 'l4',
    title: 'Bài 4: Gia đình và Nghề nghiệp',
    description: 'Học về các thành viên trong gia đình và nghề nghiệp.',
    level: 1,
    order: 4,
    vocabIds: ['v10', 'v11', 'v12']
  }
];
