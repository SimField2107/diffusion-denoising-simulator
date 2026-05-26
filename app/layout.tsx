import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Diffusion Model Denoising Simulator",
  description:
    "Interactive visualization of the diffusion model denoising process. Scrub through timesteps and watch noise resolve into coherent images.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
