import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-24 text-center sm:py-32">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist. If you followed a link to a secret, it may have
        been moved to the unseal page.
      </p>
      <div className="mt-2 flex gap-3">
        <Button nativeButton={false} render={<Link href="/" />}>
          Share a .env
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/unseal" />}>
          Unseal a document
        </Button>
      </div>
    </div>
  );
}
