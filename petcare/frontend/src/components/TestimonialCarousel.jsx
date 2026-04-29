import React, { useState } from "react";

const testimonials = [
  { name: "Emily", text: "Amazing service! My dog loved it ❤️" },
  { name: "Raj", text: "Very friendly staff, highly recommend 🐶" },
  { name: "Sophia", text: "Professional care for my cat 🐱" },
];

function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="carousel">
      <p>“{testimonials[index].text}”</p>
      <h4>- {testimonials[index].name}</h4>
      <div className="carousel-buttons">
        <button onClick={prev}>⟨</button>
        <button onClick={next}>⟩</button>
      </div>
    </div>
  );
}
export default TestimonialCarousel;
