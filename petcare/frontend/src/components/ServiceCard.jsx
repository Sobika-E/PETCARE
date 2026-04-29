import React from "react";
import { Link } from "react-router-dom";

function ServiceCard({ image, icon, title, description }) {
  // slug for URL (example: "dog grooming" → "dog-grooming")
  const serviceId = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link to={`/services/${serviceId}`}>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 duration-300 p-6 text-center cursor-pointer">
        {image && (
          <img
            src={image}
            alt={title}
            className="w-full h-40 object-cover rounded-xl mb-4"
          />
        )}
        {icon && <img src={icon} alt="" className="mx-auto w-12 h-12 mb-3" />}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}

export default ServiceCard;
