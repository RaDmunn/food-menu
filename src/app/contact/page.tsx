import Header from "@/components/main-page/Header";
import Footer from "@/components/main-page/Footer";

export default function ContactPage() {
  return (
    <>
      <Header />
      <section className="simple-page">
        <div className="container">
          <span className="simple-page__eyebrow">Contact</span>
          <h1>Contact FoodMenu</h1>
          <p>
            FoodMenu is currently a university project. Contact details for
            commercial enquiries will be added before launch.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
