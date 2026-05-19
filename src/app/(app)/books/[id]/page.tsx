import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookDetail } from "@/components/books/BookDetail";
import { Book, Chapter } from "@/types";

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
  const [book, chapters] = await Promise.all([getBook(id), getChapters(id)]);
  if (!book) notFound();
  return <BookDetail book={book} chapters={chapters} />;
}
