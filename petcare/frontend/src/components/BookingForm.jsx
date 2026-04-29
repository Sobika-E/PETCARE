import React from "react";

function BookingForm() {
  return (
    <form className="booking-form">
      <h2>Book a Service</h2>
      <label>Service</label>
      <select>
        <option>Pet Grooming</option>
        <option>Pet Sitting</option>
        <option>Vet Visit</option>
        <option>Pet Training</option>
      </select>

      <label>Date</label>
      <input type="date" />

      <label>Time</label>
      <input type="time" />

      <label>Name</label>
      <input type="text" placeholder="Your name" />

      <label>Email</label>
      <input type="email" placeholder="Your email" />

      <label>Phone</label>
      <input type="tel" placeholder="Your phone" />

      <button type="submit">Confirm Booking</button>
    </form>
  );
}
export default BookingForm;
