import type { Book, Chapter, Favorite, Genre, User, UserProgress } from "@/types";

export const A11Y_FIXTURE_BOOK_ID = "a11y-fixture-book";
export const A11Y_FIXTURE_USER_ID = "a11y-fixture-user";

export function isA11yFixtureMode(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_A11Y_FIXTURES === "1"
  );
}

export const a11yFixtureUser: User = {
  id: A11Y_FIXTURE_USER_ID,
  email: "a11y@example.com",
  full_name: "A11Y Tester",
  created_at: "2026-01-01T00:00:00.000Z",
};

export const a11yFixtureGenres: Genre[] = [
  { id: "a11y-genre-fiction", name: "Көркем әдебиет" },
  { id: "a11y-genre-history", name: "Тарих" },
];

export const a11yFixtureBooks: Book[] = [
  {
    id: A11Y_FIXTURE_BOOK_ID,
    title: "Жарыққа жол",
    author: "Айша Нұрлан",
    narrator: "Дана Қали",
    description:
      "Экран оқу бағдарламалары мен пернетақта тексерістеріне арналған қысқа аудиокітап.",
    genre_id: a11yFixtureGenres[0].id,
    genre: a11yFixtureGenres[0],
    total_duration: 20,
    total_chapters: 2,
    is_new: true,
    is_popular: true,
    language: "kk",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "a11y-fixture-book-2",
    title: "Дыбыс пен сөз",
    author: "Мұрат Әлім",
    narrator: "Ерке Сейт",
    description: "Каталог пен іздеу беттерін толтыруға арналған қосымша кітап.",
    genre_id: a11yFixtureGenres[1].id,
    genre: a11yFixtureGenres[1],
    total_duration: 18,
    total_chapters: 2,
    is_new: false,
    is_popular: true,
    language: "kk",
    created_at: "2026-01-02T00:00:00.000Z",
  },
];

export const a11yFixtureChapters: Chapter[] = [
  {
    id: "a11y-fixture-chapter-1",
    book_id: A11Y_FIXTURE_BOOK_ID,
    chapter_number: 1,
    title: "Бастау",
    audio_url: "/a11y/silence.mp3",
    duration: 10,
  },
  {
    id: "a11y-fixture-chapter-2",
    book_id: A11Y_FIXTURE_BOOK_ID,
    chapter_number: 2,
    title: "Жалғасы",
    audio_url: "/a11y/silence.mp3",
    duration: 10,
  },
];

export const a11yFixtureProgress: UserProgress = {
  id: "a11y-fixture-progress",
  user_id: A11Y_FIXTURE_USER_ID,
  book_id: A11Y_FIXTURE_BOOK_ID,
  chapter_id: a11yFixtureChapters[0].id,
  chapter_number: 1,
  position: 2,
  updated_at: "2026-01-03T00:00:00.000Z",
  book: a11yFixtureBooks[0],
};

export const a11yFixtureFavorites: Favorite[] = [
  {
    id: "a11y-fixture-favorite",
    user_id: A11Y_FIXTURE_USER_ID,
    book_id: A11Y_FIXTURE_BOOK_ID,
    created_at: "2026-01-03T00:00:00.000Z",
    book: a11yFixtureBooks[0],
  },
];

export function getA11yFixtureBook(bookId: string): Book | null {
  return a11yFixtureBooks.find((book) => book.id === bookId) ?? null;
}

export function getA11yFixtureChapters(bookId: string): Chapter[] {
  return bookId === A11Y_FIXTURE_BOOK_ID ? a11yFixtureChapters : [];
}

export function searchA11yFixtureBooks(query: string): Book[] {
  const q = query.trim().toLocaleLowerCase("kk-KZ");
  if (!q) return [];

  return a11yFixtureBooks.filter((book) =>
    [book.title, book.author, book.narrator, book.genre?.name]
      .filter(Boolean)
      .some((value) => value!.toLocaleLowerCase("kk-KZ").includes(q))
  );
}
