import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  footerHref: string;
  footerText: string;
  children: ReactNode;
};

function AuthCard({ title, description, footerHref, footerText, children }: AuthCardProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-12">
      <Card className="w-full max-w-md shadow-2xl shadow-black/20">
        <CardHeader className="space-y-3 p-8 pb-5">
          <p className="text-sm font-bold tracking-tight text-primary">mailcloud</p>
          <CardTitle className="font-display text-3xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {children}
          <Link className="mt-5 block text-center text-sm text-primary hover:underline" to={footerHref}>{footerText}</Link>
        </CardContent>
      </Card>
    </main>
  );
}

export { AuthCard };
