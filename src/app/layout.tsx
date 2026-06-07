import type { Metadata } from "next";
import "../styles/main.scss";

export const metadata: Metadata = {
  title: "FoodMenu - Online Restaurant Menus",
  description:
    "Discover the best restaurants, explore their menus, and leave reviews. Your gateway to culinary experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="wrapper">
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
