import { Toaster } from 'sonner';
import type { Metadata } from "next";

import { Work_Sans } from 'next/font/google';
import "./globals.css";
import { ConvexClientProvider } from '@/providers/convex-provider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { EdgeStoreProvider } from '@/utils/edgestore';
import SearchCommand from '@/components/Search';
import { CartProvider } from '@/providers/cart-provider';
import { AuthSync } from '@/context/AuthSync';
import Head from 'next/head';
import Whatsapp from '@/components/Whatsapp';

const workSans = Work_Sans({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Dominoes | Mesas de Juegos",
  description: 'Mesas de juego profesionales para tu hogar. Calidad superior, diseño exclusivo y envíos a todo México.', 
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
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Mesas de Juego Profesionales',
    description: 'Mesas de juego profesionales para tu hogar.',
    url: 'https://www.mesasdejuego.com',
    siteName: 'Mesas de Juego',
    images: [
      {
        url: 'https://www.mesasdejuego.com/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Mesas de Juego Profesionales',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.mesasdejuego.com',
  },
  category: 'ecommerce',
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
