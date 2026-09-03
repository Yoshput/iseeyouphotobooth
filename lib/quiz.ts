export type QuizPersona = 'quiet-luxe' | 'bold-statement' | 'everyday-chic' | 'the-dreamer';

export interface QuizAnswer {
  text: string;
  scores: Partial<Record<QuizPersona, number>>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: QuizAnswer[];
}

export interface PersonaResult {
  id: QuizPersona;
  name: string;
  tagline: string;
  description: string;
  collectionIds: string[];
  primaryColor: string;
}

export const PERSONAS: PersonaResult[] = [
  {
    id: 'quiet-luxe',
    name: 'The Quiet Luxe',
    tagline: 'Elegan tanpa harus berteriak',
    description: 'Kamu adalah orang yang percaya bahwa kemewahan sejati tidak perlu berlebihan. Detail halus, material titanium presisi, dan desain understated mendefinisikan gayamu.',
    collectionIds: ['quiet-luxury', 'titanium-edition'],
    primaryColor: '#8B7355',
  },
  {
    id: 'bold-statement',
    name: 'The Bold Statement',
    tagline: 'Kacamatamu berbicara sebelum kamu',
    description: 'Begitu kamu masuk ruangan, karakter dan siluet kacamatamu langsung mencuri perhatian. Bold, tegas, dan penuh percaya diri.',
    collectionIds: ['the-onyx-enigma', 'shades-edition'],
    primaryColor: '#1A1A2E',
  },
  {
    id: 'everyday-chic',
    name: 'The Everyday Chic',
    tagline: 'Stylish di segala situasi',
    description: 'Kamu mengutamakan fleksibilitas dan kenyamanan maksimal. Frame yang kamu pilih harus cocok dipakai bekerja, hangout, hingga santai seharian.',
    collectionIds: ['metro-deek', 'titanium-edition'],
    primaryColor: '#2D6A4F',
  },
  {
    id: 'the-dreamer',
    name: 'The Dreamer',
    tagline: 'Kacamata seindah imajinasimu',
    description: 'Kamu melihat dunia dengan cara yang unik. Bentuk frame ekspresif, nuansa translucent, atau aksen cat-eye menegaskan kepribadian otentikmu.',
    collectionIds: ['the-feline-silhouette', 'the-lucid-vision'],
    primaryColor: '#6B2FA0',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Aktivitas akhir pekan favoritmu biasanya...',
    answers: [
      { text: 'Istirahat santai & streaming film di rumah', scores: { 'quiet-luxe': 3 } },
      { text: 'Eksplor cafe baru & update inspirasi gaya', scores: { 'bold-statement': 2, 'everyday-chic': 1 } },
      { text: 'Olahraga outdoor & jalan pagi', scores: { 'everyday-chic': 3 } },
      { text: 'Kumpul komunitas seni atau workshop kreatif', scores: { 'the-dreamer': 3, 'bold-statement': 1 } },
    ],
  },
  {
    id: 'q2',
    question: 'Gaya berpakaian harianmu paling menggambarkan...',
    answers: [
      { text: 'Minimalis monokrom & clean cut', scores: { 'quiet-luxe': 3 } },
      { text: 'Smart casual dengan statement piece', scores: { 'bold-statement': 2, 'everyday-chic': 1 } },
      { text: 'Sporty, fleksibel, dan fungsional', scores: { 'everyday-chic': 3 } },
      { text: 'Kombinasi unik & sentuhan vintage artsy', scores: { 'the-dreamer': 3, 'bold-statement': 1 } },
    ],
  },
  {
    id: 'q3',
    question: 'Palet warna yang paling dominan di koleksimu...',
    answers: [
      { text: 'Hitam, charcoal, dan dark tones', scores: { 'quiet-luxe': 3 } },
      { text: 'Putih, krem, dan neutral contrast', scores: { 'bold-statement': 2, 'everyday-chic': 1 } },
      { text: 'Earth tone, olive, dan sage green', scores: { 'everyday-chic': 3 } },
      { text: 'Transparan, pastel, atau champagne metallic', scores: { 'the-dreamer': 3, 'bold-statement': 1 } },
    ],
  },
  {
    id: 'q4',
    question: 'Referensi gaya visual yang paling menginspirasimu...',
    answers: [
      { text: 'Old money aesthetic & timeless luxury', scores: { 'quiet-luxe': 3 } },
      { text: 'Modern streetwear & metropolitan chic', scores: { 'bold-statement': 2, 'everyday-chic': 1 } },
      { text: 'Korean effortless look & Scandinavian clean', scores: { 'everyday-chic': 3 } },
      { text: 'Indie cinema, retro 90s, & artistic design', scores: { 'the-dreamer': 3, 'bold-statement': 1 } },
    ],
  },
  {
    id: 'q5',
    question: 'Saat berada di ruang publik atau acara sosial, kamu adalah...',
    answers: [
      { text: 'Pengamat tenang dengan kehadiran berwibawa', scores: { 'quiet-luxe': 3 } },
      { text: 'Percaya diri dan mudah memulai percakapan', scores: { 'bold-statement': 2, 'everyday-chic': 1 } },
      { text: 'Fokus pada agenda dan mobilitas aktif', scores: { 'everyday-chic': 3 } },
      { text: 'Pendengar empati yang penuh ide kreatif', scores: { 'the-dreamer': 3, 'bold-statement': 1 } },
    ],
  },
];
