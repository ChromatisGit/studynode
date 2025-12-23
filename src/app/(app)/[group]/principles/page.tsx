"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useMockAuth } from "@/contexts/MockAuthContext";
import { isAdmin } from "@/schema/auth";

type PageParams = {
  params: {
    group: string;
  };
};

export default function GroupPrinciplesPage({ params }: PageParams) {
  const router = useRouter();
  const { user, isAuthenticated } = useMockAuth();
  const isUserAdmin = user ? isAdmin(user) : false;
  const primaryGroupId = user && !isUserAdmin ? user.groupId : null;
  const isAllowed = Boolean(
    isAuthenticated && primaryGroupId && primaryGroupId === params.group
  );

  useEffect(() => {
    if (!isAllowed) {
      router.replace("/");
    }
  }, [isAllowed, router]);

  if (!isAllowed) {
    return null;
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Group principles</h1>
      <p>Group: {params.group}</p>
      <p>This route is stubbed until the principles page is integrated.</p>
    </main>
  );
}
