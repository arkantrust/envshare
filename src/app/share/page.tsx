import { redirect } from "next/navigation";

// The share form now lives on the landing page. Kept for backwards compatibility with old links.
export default function Page() {
  return redirect("/");
}
