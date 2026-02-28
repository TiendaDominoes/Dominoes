import { Toaster } from 'sonner';
import type { Metadata } from "next";

import { Work_Sans } from 'next/font/google';
import "./globals.css";
import { ConvexClientProvider } from '@/providers/convex-provider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { EdgeStoreProvider } from '@/utils/edgestore';
import SearchCommand from '@/components/Search';
import { CartProvider } from '@/providers/cart-provider';
import { AuthSync } from '@/context/AuthSync';
import Head from 'next/head';
import Whatsapp from '@/components/Whatsapp';

const workSans = Work_Sans({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Dominoes | Mesas de Juegos",
  description: "La mesa que hará legendarias tus noches con amigos.",
  other: {
    'mercadopago-sdk': 'v2',
  },
  icons: {
    icon: [
      {
        url: "/logo-cropped.jpg",
        href:"/logo-cropped.jpg"
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self' https://*.mercadopago.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.mercadopago.com; style-src 'self' 'unsafe-inline'; frame-src https://*.mercadopago.com;" />
      </Head>
      
      <body className={workSans.className}>
        <ConvexClientProvider>
          <EdgeStoreProvider>
            <CartProvider>
              <AuthSync/>
              <Toaster position='bottom-center'/>
              <ScrollToTop/>
              <Navbar/>
              <SearchCommand/>
              {children}
              <Whatsapp/>
              <Footer/>
            </CartProvider>
          </EdgeStoreProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
