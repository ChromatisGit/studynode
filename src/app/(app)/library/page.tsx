import { getLibraryStub } from "@/data/library";

export default function LibraryPage() {
  const stub = getLibraryStub();
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Library</h1>
      <p>{stub.message}</p>
    </main>
  );
}
