import { Menu, MapPin, Star, Store } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Restaurant Directory",
    description:
      "Structured restaurant profiles with cuisine, atmosphere, contacts, and location details.",
    icon: Store,
    side: "left",
  },
  {
    id: 2,
    title: "Live Menus",
    description:
      "Publish menu changes instantly across dishes, descriptions, availability, and labels.",
    icon: Menu,
    side: "right",
  },
  {
    id: 3,
    title: "Guest Signals",
    description:
      "Collect useful feedback and highlight the dishes guests care about most.",
    icon: Star,
    side: "left",
  },
  {
    id: 4,
    title: "Real-time Info",
    description:
      "Keep hours, promotions, and restaurant details current without reprinting anything.",
    icon: MapPin,
    side: "right",
  },
];

export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-section__inner">
        <div className="features-section__header">
          <span className="features-section__eyebrow">Platform features</span>
          <h2>Everything a modern menu needs</h2>
          <p>
            Keep operations simple with menu publishing, guest-facing details,
            and restaurant information in one focused interface.
          </p>
        </div>

        <div className="features-section__grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;

            return (
              <div
                key={feature.id}
                className={`feature-card feature-card--${feature.side}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="feature-card__icon">
                  <IconComponent size={30} strokeWidth={1.8} />
                </div>
                <div className="feature-card__content">
                  <h3 className="feature-card__title">{feature.title}</h3>
                  <p className="feature-card__description">
                    {feature.description}
                  </p>
                </div>
                <div className="feature-card__number">{feature.id}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
