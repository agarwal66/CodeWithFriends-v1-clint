import React from "react";
import "./LandingPage.css";

const Contact = () => (
  <div className="contact-section page-section">
    <h2>Contact Us</h2>
    <form
      className="contact-form"
      onSubmit={e => {
        e.preventDefault();
        alert("Thank you for contacting us!");
      }}
    >
      <input type="text" placeholder="Your Name" required />
      <input type="email" placeholder="Your Email" required />
      <textarea placeholder="Your Message" required />
      <button type="submit">Send Message</button>
    </form>
    <div className="contact-info">
      <p>Email: <a href="mailto:codewithfriends@example.com">codewithfriends@example.com</a></p>
      <p>Follow us:
        <a href="#" className="contact-social">Twitter</a> |
        <a href="#" className="contact-social">Instagram</a>
      </p>
    </div>
  </div>
);

export default Contact;