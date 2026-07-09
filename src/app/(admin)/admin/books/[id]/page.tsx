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
    <div className="jaryq-reveal space-y-8">
      <header className="space-y-3">
        <span className="inline-block rounded-full bg-jaryq-primary-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-jaryq-primary">
          Өңдеу
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-jaryq-text-primary sm:text-4xl">
          {book.title}
        </h1>
      </header>
      <BookForm genres={genres ?? []} book={book} chapters={chapters ?? []} />
    </div>
  );
}
