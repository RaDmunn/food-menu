import Header from "@/components/main-page/Header";
import Footer from "@/components/main-page/Footer";

export default function ContactPage() {
  return (
    <>
      <Header />
      <section className="simple-page">
        <div className="container">
          <span className="simple-page__eyebrow">Contact</span>
          <h1>Contact DOMAIN</h1>
          <p>
            Send a request and we will help you set up a clean digital menu for
            your restaurant.
          </p>
          <a className="simple-page__link" href="mailto:hello@domain.com">
            hello@domain.com
          </a>
        </div>
      </section>
      <Footer />
    </>
  );
}
