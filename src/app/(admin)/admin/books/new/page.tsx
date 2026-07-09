import { createSupabaseServerClient } from "@/lib/supabase/server";
import { BookForm } from "@/components/admin/BookForm";

export default async function NewBookPage() {
  const supabase = await createSupabaseServerClient();
  const { data: genres } = await supabase.from("genres").select("*").order("name");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Жаңа кітап</h1>
      <BookForm genres={genres ?? []} />
    </div>
  );
}
