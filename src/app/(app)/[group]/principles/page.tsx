type PageParams = {
  params: Promise<{
    group: string;
  }>;
};

export default async function GroupPrinciplesPage({ params }: PageParams) {
  const { group } = await params;

  return (
    <main>
      <h1>Group principles</h1>
      <p>Group: {group}</p>
      <p>This route is stubbed until the group principles UI is integrated.</p>
    </main>
  );
}
