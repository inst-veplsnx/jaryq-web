import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookDetail } from "@/components/books/BookDetail";
import { Book, Chapter, UserProgress } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

async function getBook(id: string): Promise<Book | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("books")
    .select("*, genre:genres(*)")
    .eq("id", id)
    .single();
  return data;
}

async function getChapters(bookId: string): Promise<Chapter[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .eq("book_id", bookId)
    .order("chapter_number", { ascending: true });
  return data || [];
}

async function getBookUserData(
  bookId: string
): Promise<{ isFavorite: boolean; progress: UserProgress | null }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { isFavorite: false, progress: null };

    const [favResult, progressResult] = await Promise.all([
      supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .maybeSingle(),
      supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .maybeSingle(),
    ]);

    return {
      isFavorite: !!favResult.data,
      progress: progressResult.data ?? null,
    };
  } catch {
    return { isFavorite: false, progress: null };
  }
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) return { title: "Кітап табылмады" };
  return {
    title: `${book.title} — ${book.author} | JARYQ`,
    description: book.description?.slice(0, 160) || `${book.title} аудиокітабы`,
    openGraph: {
      title: book.title,
      description: book.description?.slice(0, 160),
      images: book.cover_url ? [book.cover_url] : [],
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  const [book, chapters, userData] = await Promise.all([
    getBook(id),
    getChapters(id),
    getBookUserData(id),
  ]);
  if (!book) notFound();
  return (
    <BookDetail
      book={book}
      chapters={chapters}
      initialFavorite={userData.isFavorite}
      initialProgress={userData.progress}
    />
  );
}
