'use client';

import React, { useEffect, useRef } from 'react';
import { Store, Menu, Star, MapPin } from 'lucide-react';

const features = [
  {
    id: 1,
    title: "Restaurant Directory",
    description: "Comprehensive database of restaurants with detailed information about cuisine, atmosphere, and specialties",
    icon: Store,
    side: "left"
  },
  {
    id: 2,
    title: "Live Menus",
    description: "Always up-to-date menus with prices, dish descriptions, and ingredient information",
    icon: Menu,
    side: "right"
  },
  {
    id: 3,
    title: "Authentic Reviews",
    description: "Real customer reviews with food photos and detailed dining experiences",
    icon: Star,
    side: "left"
  },
  {
    id: 4,
    title: "Real-time Info",
    description: "Opening hours, contacts, promotions and special offers updated in real-time",
    icon: MapPin,
    side: "right"
  }
];

const leftTrayDishes = [
  { name: "Стейк", image: "🥩", rotation: -15, x: 20, y: 30 },
  { name: "Салат", image: "🥗", rotation: 25, x: 60, y: 20 },
  { name: "Паста", image: "🍝", rotation: -10, x: 40, y: 60 },
  { name: "Суп", image: "🍲", rotation: 20, x: 70, y: 50 },
  { name: "Хлеб", image: "🥖", rotation: -30, x: 15, y: 70 }
];

const rightTrayDishes = [
  { name: "Пицца", image: "🍕", rotation: 15, x: 25, y: 25 },
  { name: "Бургер", image: "🍔", rotation: -20, x: 65, y: 35 },
  { name: "Десерт", image: "🍰", rotation: 30, x: 45, y: 65 },
  { name: "Кофе", image: "☕", rotation: -25, x: 20, y: 55 },
  { name: "Вино", image: "🍷", rotation: 10, x: 75, y: 60 }
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftTrayRef = useRef<HTMLDivElement>(null);
  const rightTrayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !leftTrayRef.current || !rightTrayRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));

      // Только легкое движение подносов без вращения
      const leftY = scrollProgress * 50;
      const rightY = -scrollProgress * 40;

      leftTrayRef.current.style.transform = `translateY(${leftY}px)`;
      rightTrayRef.current.style.transform = `translateY(${rightY}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="features-section">
      {/* Левый поднос */}
      <div className="tray tray--left">
        <div ref={leftTrayRef} className="tray__container">
          <div className="tray__plate">
            {leftTrayDishes.map((dish, index) => (
              <div
                key={index}
                className="dish"
                style={{
                  left: `${dish.x}%`,
                  top: `${dish.y}%`,
                  transform: `rotate(${dish.rotation}deg)`,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <span className="dish__emoji">{dish.image}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Правый поднос */}
      <div className="tray tray--right">
        <div ref={rightTrayRef} className="tray__container">
          <div className="tray__plate">
            {rightTrayDishes.map((dish, index) => (
              <div
                key={index}
                className="dish"
                style={{
                  left: `${dish.x}%`,
                  top: `${dish.y}%`,
                  transform: `rotate(${dish.rotation}deg)`,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <span className="dish__emoji">{dish.image}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Центральный роадмеп */}
      <div className="roadmap">
        <div className="roadmap__path">
          <svg className="roadmap__line" viewBox="0 0 400 800" preserveAspectRatio="none">
            <path
              d="M200 0 Q300 100 200 200 Q100 300 200 400 Q300 500 200 600 Q100 700 200 800"
              stroke="url(#gradient)"
              strokeWidth="4"
              fill="none"
              strokeDasharray="10,5"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="50%" stopColor="#d32f2f" />
                <stop offset="100%" stopColor="#ffc107" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={feature.id}
              className={`feature-card feature-card--${feature.side}`}
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              <div className="feature-card__icon">
                <IconComponent size={48} strokeWidth={1.5} />
              </div>
              <div className="feature-card__content">
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">{feature.description}</p>
              </div>
              <div className="feature-card__number">{feature.id}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
