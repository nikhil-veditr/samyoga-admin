import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import Script from "next/script";
import { AppProviders } from "@/shared/providers/app-providers";
import { BRANDING } from "@/shared/config/branding";
import { createRootMetadata } from "@/shared/config/site-metadata";
import "./globals.css";

const themeBootstrap = `
(function(){
  try {
    var raw = localStorage.getItem("samyoga-ui-store");
    var pref = "system";
    if (raw) {
      var o = JSON.parse(raw);
      var st = o.state || o;
      if (st.themePreference === "light" || st.themePreference === "dark" || st.themePreference === "system") {
        pref = st.themePreference;
      }
    }
    var dark =
      pref === "dark" ||
      (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  } catch (e) {}
})();`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...createRootMetadata(),
  icons: {
    icon: [{ url: BRANDING.logoMarkSvg, type: "image/svg+xml" }, { url: BRANDING.logoMarkRaster, type: "image/webp" }],
    apple: BRANDING.logoMarkRaster,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased" suppressHydrationWarning>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
