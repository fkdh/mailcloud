import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { ToastProvider } from "../components/ui/toast";
import { ThemeProvider } from "../components/theme-provider";
import "../styles/index.css";

export const Route = createRootRoute({
  notFoundComponent: NotFoundPage,
  head: () => ({
    meta: [
      { title: "Mailcloud" },
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { if (localStorage.getItem("mailcloud-theme") === "dark") document.documentElement.classList.add("dark"); } catch (_) {} })();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider><ToastProvider><Outlet /></ToastProvider></ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you requested does not exist.</p>
        <Link className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" to="/">Back to home</Link>
      </div>
    </main>
  );
}
