import type { Metadata } from "next";
import "../styles/main.scss";

export const metadata: Metadata = {
  title: "FoodMenu | Digital menus for restaurants",
  description: "Create and manage polished digital restaurant menus with QR access for every table.",
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
