import React, { useState } from "react";
import "./LandingPage.css";

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const message = e.target.message.value;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        alert("Thank you for contacting us!");
        e.target.reset();
      } else {
        alert("Failed to send. Please try again later.");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="contact-section page-section">
      <h2>Contact Us</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input name="name" type="text" placeholder="Your Name" required />
        <input name="email" type="email" placeholder="Your Email" required />
        <textarea name="message" placeholder="Your Message" required />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
      <div className="contact-info">
        <p>
          Email:{" "}
          <a href="mailto:codewithfriends19@gmail.com">
            codewithfriends19@gmail.com
          </a>
        </p>
        <p>
          Follow us:
          <a href="#" className="contact-social">
            Twitter
          </a>{" "}
          |{" "}
          <a href="#" className="contact-social">
            Instagram
          </a>
        </p>
      </div>
    </div>
  );
};

export default Contact;