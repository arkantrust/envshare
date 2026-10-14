"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Share", href: "/" },
  { name: "Unseal", href: "/unseal" },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="size-2.5 rounded-full bg-primary shadow-[0_0_12px] shadow-primary" />
          <span className="hidden min-[420px]:inline">EnvShare</span>
          <span className="sr-only min-[420px]:hidden">EnvShare</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-0.5 sm:gap-1">
          {navigation.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              nativeButton={false}
              render={<Link href={item.href} />}
              className={cn(pathname === item.href ? "text-primary" : "text-muted-foreground")}
            >
              {item.name}
            </Button>
          ))}
          <Button
            variant="ghost"
            nativeButton={false}
            render={
              <Link
                href="https://github.com/arkantrust/envshare"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="text-muted-foreground"
          >
            GitHub
          </Button>
        </nav>
      </div>
    </header>
  );
};
