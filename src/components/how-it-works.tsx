import { DatabaseIcon, KeyRoundIcon, LockKeyholeIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: LockKeyholeIcon,
    title: "Encrypted in your browser",
    description: "A fresh AES key is generated on your device. Your plaintext never leaves it.",
  },
  {
    icon: DatabaseIcon,
    title: "Only ciphertext is stored",
    description: "The server keeps the encrypted blob until it expires or hits its read limit.",
  },
  {
    icon: KeyRoundIcon,
    title: "The key stays in the link",
    description: "It lives after the # in the URL, which browsers never send to the server.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="mx-auto w-full max-w-4xl px-6">
      <h2 id="how-it-works" className="mb-6 text-center text-2xl font-semibold tracking-tight">
        How it works
      </h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, description }, i) => (
          <li key={title}>
            <Card size="sm" className="h-full">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </section>
  );
}
