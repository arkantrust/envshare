import { redirect } from "next/navigation";

// This page is here for backwards compatibility with old links.
// Old links were of the form /{compositeKey} and now they are of the form /unseal#{compositeKey}
export default async function Page(props: { params: Promise<{ compositeKey: string }> }) {
  const { compositeKey } = await props.params;
  return redirect(`/unseal#${compositeKey}`);
}
