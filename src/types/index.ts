export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  narrator?: string;
  description?: string;
  cover_url?: string;
  genre_id?: string;
  genre?: Genre;
  total_duration?: number;
  total_chapters?: number;
  is_new?: boolean;
  is_popular?: boolean;
  language?: string;
  created_at: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  audio_url: string;
  duration: number;
}

export interface Genre {
  id: string;
  name: string;
  icon?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  book_id: string;
  chapter_id: string;
  chapter_number: number;
  position: number;
  updated_at: string;
  book?: Book;
}

export interface Favorite {
  id: string;
  user_id: string;
  book_id: string;
  created_at: string;
  book?: Book;
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  photoUrl?: string | null;
  social?: {
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
}
