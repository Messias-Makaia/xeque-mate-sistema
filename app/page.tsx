import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  session ? redirect("/dashboard") : redirect("/login");
  
}
