import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import LivingBackground from "@/components/dashboard/living-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Atlas Global Payments — Orquestração Financeira",
    template: "%s | Atlas GP",
  },
  description: "Plataforma de orquestração financeira B2B2C. Non-custodial payment routing, gestão de tesouraria, câmbio FX e liquidação global em tempo real.",
  keywords: ["fintech", "payments", "forex", "treasury", "B2B", "financial", "crypto", "banking"],
  authors: [{ name: "NeXFlowX" }],
  creator: "NeXFlowX",
  publisher: "Atlas Global Payments",
  icons: {
    icon: [
      { url: "/logo-circular.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-circular.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo-circular.png", sizes: "180x180", type: "image/png" },
      { url: "/logo-circular-lg.png", sizes: "1024x1024", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Atlas GP",
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },
  openGraph: {
    type: "website",
    siteName: "Atlas Global Payments",
    title: "Atlas Global Payments — Orquestração Financeira",
    description: "Plataforma de orquestração financeira B2B2C",
    images: [
      {
        url: "/logo-circular-lg.png",
        width: 1024,
        height: 1024,
        alt: "Atlas Global Payments Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atlas Global Payments",
    description: "Plataforma de orquestração financeira B2B2C",
    images: ["/logo-circular-lg.png"],
  },
  applicationName: "Atlas GP",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080a0f" },
    { media: "(prefers-color-scheme: light)", color: "#f5f3ef" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="pt-BR" 
      suppressHydrationWarning 
      className="bg-background dark"
    >
      <head>
        {/* PWA meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Atlas GP" />
        <meta name="application-name" content="Atlas GP" />
        <meta name="msapplication-TileColor" content="#080a0f" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* iOS splash screens */}
        <meta name="apple-touch-fullscreen" content="yes" />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://s3.tradingview.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://s3.tradingview.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <LivingBackground />
          {children}
        </Providers>
        <Toaster />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered: ', registration);
                    },
                    function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
