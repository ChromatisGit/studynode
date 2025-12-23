import { getLibraryStub } from "@/data/library";

type PageParams = {
  params: {
    segments: string[];
  };
};

export default function LibraryStubPage({ params }: PageParams) {
  const path = params.segments.join(" / ");
  const stub = getLibraryStub();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Library</h1>
      <p>Route: {path}</p>
      <p>{stub.message}</p>
    </main>
  );
}
