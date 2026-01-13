type PageParams = {
  params: Promise<{
    group: string;
  }>;
};

export default async function GroupOverviewPage({ params }: PageParams) {
  const { group } = await params;

  return (
    <main>
      <h1>Group overview</h1>
      <p>Group: {group}</p>
      <p>This route is stubbed until the group overview UI is integrated.</p>
    </main>
  );
}
