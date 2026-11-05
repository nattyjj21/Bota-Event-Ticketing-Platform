import "./globals.css";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata = {
  title: "BOTA — Ethiopia's Event Marketplace. Claim Your Spot.",
  description: "Discover nightlife, concerts, festivals and gatherings near you — buy your ticket, get your QR code, walk in.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${space.variable}`}>
      <body className="antialiased bg-[#0A0908] text-[#F5F1EA] pb-[72px] md:pb-0">
        <StoreProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <MobileNav />
        </StoreProvider>
      </body>
    </html>
  );
}
