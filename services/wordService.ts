import { Kamus } from '../types';

class WordService {
  private words: Kamus = {};
  private selectedWords: string[] = [];
  private wordsByLength: Map<number, string[]> = new Map();
  private lastWord: string | null = null;
  private currentSelectedWordIndex = 0;

  async initialize(): Promise<void> {
    try {
      const [kamusResponse, kosakataResponse] = await Promise.all([
        fetch('/data/kamus.json'),
        fetch('/data/kosakata.json')
      ]);

      if (!kamusResponse.ok) {
        throw new Error('Gagal memuat kamus');
      }
      if (kosakataResponse.ok) {
        this.selectedWords = (await kosakataResponse.json()).filter((word: string) => word.length === 5 && /^[a-z]+$/.test(word));
      } else {
        console.warn('File kosakata.json tidak ditemukan atau gagal dimuat.');
      }

      this.words = await kamusResponse.json();
      this.prepareWords();
    } catch (error) {
      console.error("Gagal menginisialisasi WordService:", error);
    }
  }

  private prepareWords(): void {
    const allWords = Object.keys(this.words);
    const filteredWords = allWords.filter(word => word.length === 5 && /^[a-z]+$/.test(word));
    this.wordsByLength.set(5, filteredWords);
  }

  private getWordsByLength(length: number): string[] {
    return this.wordsByLength.get(length) || [];
  }

  private getRandomWord(length: number): string {
    const wordList = this.getWordsByLength(length);
    if (wordList.length === 0) {
      console.error(`Tidak ada kata dengan panjang ${length}.`);
      return 'GAGAL';
    }

    if (wordList.length === 1) {
      return wordList[0].toUpperCase();
    }

    let newWord: string;
    do {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      newWord = wordList[randomIndex].toUpperCase();
    } while (newWord === this.lastWord);

    this.lastWord = newWord;
    return newWord;
  }

  private getNextSelectedWord(): string {
    if (this.selectedWords.length === 0) {
      console.warn("Daftar kosakata pilihan kosong, menggunakan kata acak.");
      return this.getRandomWord(5);
    }
    const word = this.selectedWords[this.currentSelectedWordIndex];
    this.currentSelectedWordIndex = (this.currentSelectedWordIndex + 1) % this.selectedWords.length;
    return word.toUpperCase();
  }

  getNewWord(mode: 'random' | 'selected', length: number): string {
    if (mode === 'selected') {
      return this.getNextSelectedWord();
    }
    return this.getRandomWord(length);
  }

  getBotGuess(currentSolution: string): string {
    const wordList = this.getWordsByLength(5);
    if (wordList.length < 2) {
      // Tidak cukup kata untuk memilih yang berbeda
      const fallback = 'ACAK';
      return fallback === currentSolution.toUpperCase() ? 'KATA' : fallback;
    }

    let guess: string;
    let attempts = 0;
    const maxAttempts = 50; // Mencegah infinite loop
    do {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      guess = wordList[randomIndex].toUpperCase();
      attempts++;
    } while (guess === currentSolution.toUpperCase() && attempts < maxAttempts);

    return guess;
  }

  isValidWord(word: string): boolean {
    return this.words.hasOwnProperty(word.toLowerCase());
  }

  getWordDefinition(word: string): { submakna: string[], contoh: string[], bahasa?: string } | null {
      const entry = this.words[word.toLowerCase()];
      if (entry) {
          return {
              submakna: entry.submakna || [],
              contoh: entry.contoh || [],
              bahasa: entry.bahasa
          };
      }
      return null;
  }
}

const wordService = new WordService();
export default wordService;