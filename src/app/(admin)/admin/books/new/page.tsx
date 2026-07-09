import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookForm } from "@/components/admin/BookForm";

export default async function NewBookPage() {
  const supabase = await createSupabaseServerClient();
  const { data: genres } = await supabase.from("genres").select("*").order("name");

  return (
    <div className="jaryq-reveal space-y-8">
      <header className="space-y-3">
        <span className="inline-block rounded-full bg-jaryq-primary-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-jaryq-primary">
          Жаңа
        </span>
        <h1 className="font-display text-3xl font-bold tracking-tight text-jaryq-text-primary sm:text-4xl">
          Жаңа кітап
        </h1>
      </header>
      <BookForm genres={genres ?? []} />
    </div>
  );
}
