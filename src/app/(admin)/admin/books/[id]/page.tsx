import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookForm } from "@/components/admin/BookForm";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const [{ data: book }, { data: chapters }, { data: genres }] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).single(),
    supabase
      .from("chapters")
      .select("*")
      .eq("book_id", id)
      .order("chapter_number", { ascending: true }),
    supabase.from("genres").select("*").order("name"),
  ]);
  if (!book) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Өңдеу: {book.title}</h1>
      <BookForm genres={genres ?? []} book={book} chapters={chapters ?? []} />
    </div>
  );
}
