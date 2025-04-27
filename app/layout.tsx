import type { Metadata } from "next";
import "./globals.css";
//import "./slick.css";
import "./tailwind.css";
import Provider from '@/components/Provider';
import { Toaster } from '@/components/ui/toaster';


export const metadata: Metadata = {
  title: "Anti-Corruption",
  description: "E-learning anti corruption",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="assets/sgec.jpeg" type="image/png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <Provider>
        {children}
        <Toaster/>
        </Provider>
      </body>
    </html>
  );
}
