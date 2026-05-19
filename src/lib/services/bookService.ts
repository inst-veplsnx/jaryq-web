import { getSupabaseClient } from "@/lib/supabase/client";
import { Book, Chapter, Favorite, Genre, UserProgress } from "@/types";

export const bookService = {
  async getNewArrivals(limit = 100): Promise<Book[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("books")
        .select("*, genre:genres(*)")
        .eq("is_new", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error("Error fetching new arrivals:", (error as Error).message);
      return [];
    }
  },

  async getPopular(limit = 50): Promise<Book[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("books")
        .select("*, genre:genres(*)")
        .eq("is_popular", true)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error("Error fetching popular books:", (error as Error).message);
      return [];
    }
  },

  async getAllBooks(offset = 0, pageSize = 50): Promise<Book[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("books")
        .select("*, genre:genres(*)")
        .order("author", { ascending: true })
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error("Error fetching all books:", (error as Error).message);
      return [];
    }
  },

  async getBookById(bookId: string): Promise<Book | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("books")
        .select("*, genre:genres(*)")
        .eq("id", bookId)
        .single();
      if (error) throw error;
      return data;
    } catch (error: unknown) {
      console.error("Error fetching book:", (error as Error).message);
      return null;
    }
  },

  async getBooksByGenre(genreId: string): Promise<Book[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("books")
        .select("*, genre:genres(*)")
        .eq("genre_id", genreId)
        .order("title", { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error(
        "Error fetching books by genre:",
        (error as Error).message
      );
      return [];
    }
  },

  async searchBooks(query: string): Promise<Book[]> {
    const safe = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("books")
        .select("*, genre:genres(*)")
        .or(
          `title.ilike.%${safe}%,author.ilike.%${safe}%,narrator.ilike.%${safe}%`
        )
        .limit(50);
      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error("Error searching books:", (error as Error).message);
      return [];
    }
  },

  async getChapters(bookId: string): Promise<Chapter[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("book_id", bookId)
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error("Error fetching chapters:", (error as Error).message);
      return [];
    }
  },

  async getGenres(): Promise<Genre[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("genres")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error("Error fetching genres:", (error as Error).message);
      return [];
    }
  },

  async getGenreById(genreId: string): Promise<Genre | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("genres")
        .select("*")
        .eq("id", genreId)
        .single();
      if (error) throw error;
      return data;
    } catch (error: unknown) {
      console.error("Error fetching genre:", (error as Error).message);
      return null;
    }
  },

  async saveProgress(
    userId: string,
    bookId: string,
    chapterId: string,
    chapterNumber: number,
    position: number
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          book_id: bookId,
          chapter_id: chapterId,
          chapter_number: chapterNumber,
          position,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,book_id" }
      );
    } catch (error: unknown) {
      console.error("Error saving progress:", (error as Error).message);
    }
  },

  async getProgress(
    userId: string,
    bookId: string
  ): Promise<UserProgress | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error: unknown) {
      console.error("Error fetching progress:", (error as Error).message);
      return null;
    }
  },

  async getAllProgress(userId: string): Promise<UserProgress[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("user_progress")
        .select("*, book:books(*, genre:genres(*))")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error("Error fetching all progress:", (error as Error).message);
      return [];
    }
  },

  async getFavorites(userId: string): Promise<Favorite[]> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("favorites")
        .select("*, book:books(*, genre:genres(*))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error: unknown) {
      console.error("Error fetching favorites:", (error as Error).message);
      return [];
    }
  },

  async addFavorite(userId: string, bookId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, book_id: bookId });
    if (error) throw error;
  },

  async removeFavorite(userId: string, bookId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("book_id", bookId);
    if (error) throw error;
  },

  async isFavorite(userId: string, bookId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .maybeSingle();
      return !!data;
    } catch {
      return false;
    }
  },

  async clearAllProgress(userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", userId);
    if (error) throw error;
  },
};
