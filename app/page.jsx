import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MappaApplicativa from "@/components/MappaApplicativa";

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/signin");
  return <MappaApplicativa userEmail={session.user?.email} />;
}
