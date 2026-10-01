import Header from "@/components/main-page/Header";
import Footer from "@/components/main-page/Footer";

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <section className="simple-page">
        <div className="container">
          <span className="simple-page__eyebrow">Features</span>
          <h1>Tools for modern digital menus</h1>
          <p>
            Manage restaurants, menus, sections and dishes in one workspace.
            Share each published menu through its link or QR code.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
