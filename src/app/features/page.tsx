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
            Manage live menus, restaurant details, multilingual content, and
            guest-facing updates from one focused platform.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
