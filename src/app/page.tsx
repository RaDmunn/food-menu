import React from "react";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero__content">
          <h1 className="hero__title">
            Discover Amazing <span>Restaurants</span>
          </h1>
          <p className="hero__subtitle">
            Explore menus from the best local restaurants, read authentic reviews,
            and find your next favorite dining experience. From cozy cafes to fine dining,
            we've got your culinary journey covered.
          </p>
          <div className="hero__buttons">
            <a href="/restaurants" className="btn btn--primary">
              🍽️ Explore Restaurants
            </a>
            <a href="/user" className="btn btn--secondary">
              👥 Join Community
            </a>
          </div>
        </div>
        <div className="hero__image">
          <div className="image-container">
            <img
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
              alt="Delicious gourmet food platter with various dishes"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
