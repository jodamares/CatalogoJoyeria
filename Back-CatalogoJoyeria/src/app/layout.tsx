import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Back Catalogo Joyeria",
  description: "Backend en Next.js para auth y APIs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
