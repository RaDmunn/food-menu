"use client";

import { useState, type FormEvent } from "react";
import Header from "@/components/main-page/Header";
import Footer from "@/components/main-page/Footer";

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true); setFeedback("");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send your message.");
      setFeedback(result.message); setSent(true); form.reset();
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Could not send your message."); }
    finally { setSending(false); }
  };
  return <><Header /><main className="editorial-page"><div className="container editorial-page__intro"><span className="site-eyebrow">Get in touch</span><h1>Let’s make room for <em>better menus.</em></h1><p>Tell us about your venue and how you work. We’ll reply with the next steps when access is available.</p></div><div className="container contact-layout"><aside><span className="editorial-page__index">01 / A CONVERSATION</span><h2>A thoughtful place to start.</h2><p>FoodMenu is currently a university project with a view toward real restaurant use. We welcome questions and early interest.</p><div className="contact-layout__details"><div><span>Email · demo contact</span><a href="mailto:hello@foodmenu.example">hello@foodmenu.example</a></div><div><span>Phone · demo contact</span><a href="tel:+40000000000">+40 000 000 000</a></div></div></aside><form onSubmit={submit} className="contact-form"><span className="editorial-page__index">02 / YOUR MESSAGE</span><h2>Tell us about your restaurant.</h2><div className="contact-form__row"><label>Your name <input name="name" required maxLength={100} placeholder="Name" /></label><label>Work email <input name="email" type="email" required maxLength={200} placeholder="you@restaurant.com" /></label></div><div className="contact-form__row"><label>Restaurant <input name="restaurant" maxLength={120} placeholder="Venue name (optional)" /></label><label>Phone <input name="phone" type="tel" maxLength={50} placeholder="Phone (optional)" /></label></div><label>Your message <textarea name="message" required maxLength={2000} rows={5} placeholder="A little about your venue and what you need…" /></label><input className="contact-form__trap" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" /><button type="submit" disabled={sending}>{sending ? "Sending…" : "Send enquiry"} <span aria-hidden="true">↗</span></button>{feedback && <p role="status" className={sent ? "is-success" : "is-error"}>{feedback}</p>}</form></div></main><Footer /></>;
}
