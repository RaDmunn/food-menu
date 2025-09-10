import React from "react";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">Welcome to <span>DOMAIN</span></h1>
          <p className="hero__subtitle">
            Discover the best restaurants, explore their menus, and leave reviews.
          </p>
          <div className="hero__buttons">
            <a href="/restaurants" className="btn btn--primary">Explore Restaurants</a>
            <a href="/user" className="btn btn--secondary">My Account</a>
          </div>
        </div>
        <div className="hero__image">
          <img src="/hero-food.jpg" alt="Delicious food" />
        </div>
      </section>
    </main>
  );
}
