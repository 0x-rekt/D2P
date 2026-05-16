import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ repoId: string }>;
};

const RepoPage = async ({ params }: PageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const { repoId } = await params;
  redirect(`/dashboard/repos/${repoId}/security`);
};

export default RepoPage;
