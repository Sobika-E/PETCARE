import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function SearchCenters() {
  const [city, setCity] = useState("");
  const [center, setCenter] = useState([12.9716, 77.5946]); // default Bangalore
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null); // for modal

  const handleSearch = async () => {
    if (!city.trim()) return alert("Please enter a city!");

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
      );
      const geoData = await geoRes.json();
      if (geoData.length === 0) {
        alert("City not found!");
        return;
      }

      const { lat, lon } = geoData[0];
      const cityLat = parseFloat(lat);
      const cityLng = parseFloat(lon);
      setCenter([cityLat, cityLng]);

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="veterinary"](around:5000,${cityLat},${cityLng});
          way["amenity"="veterinary"](around:5000,${cityLat},${cityLng});
          relation["amenity"="veterinary"](around:5000,${cityLat},${cityLng});
        );
        out center;
      `;
      const overpassRes = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const overpassData = await overpassRes.json();

      const fetchedPlaces = overpassData.elements.map((el) => {
        let latLng =
          el.type === "node" ? [el.lat, el.lon] : [el.center.lat, el.center.lon];
        return {
          name: el.tags.name || "Unnamed Vet Clinic",
          lat: latLng[0],
          lng: latLng[1],
          contact: el.tags.phone || "No contact info", // optional phone tag
          address: el.tags["addr:full"] || el.tags["addr:street"] || "Address not available",
        };
      });

      if (fetchedPlaces.length === 0) {
        alert("No pet care centers found nearby!");
      }

      setPlaces(fetchedPlaces);
    } catch (err) {
      console.error(err);
      alert("Error fetching data!");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "50px", color: "black" }}>
      <h1>Find PetCare Centers Near You 🐾</h1>

      <div style={{ margin: "20px 0" }}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter any city"
          style={{ padding: "10px", width: "300px", borderRadius: "10px" }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "10px 20px",
            marginLeft: "10px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {/* Map */}
      <div
        style={{
          height: "500px",
          width: "80%",
          margin: "0 auto 30px auto",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {places.map((place, i) => (
            <Marker key={i} position={[place.lat, place.lng]}>
              <Popup>{place.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Centers list in grid */}
<div
  className="centers-list"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  }}
>
  {places.length > 0 ? (
    places.map((place, i) => (
      <div
        key={i}
        style={{
          padding: "20px",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "15px",
          color: "black",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <h3>{place.name}</h3>
        <p>Latitude: {place.lat.toFixed(5)}</p>
        <p>Longitude: {place.lng.toFixed(5)}</p>
        <button
          style={{
            padding: "10px 15px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#A8D5BA",
            color: "creamy white",
            fontWeight: "bold",
            alignSelf: "flex-start",
          }}
          onClick={() => setSelectedPlace(place)}
        >
          Book Now
        </button>
      </div>
    ))
  ) : (
    <p>No centers found yet 😔</p>
  )}
</div>


      {/* Modal */}
      {selectedPlace && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setSelectedPlace(null)}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "15px",
              minWidth: "300px",
              textAlign: "left",
              color: "black",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            <h2>{selectedPlace.name}</h2>
            <p><strong>Contact:</strong> {selectedPlace.contact}</p>
            <p><strong>Address:</strong> {selectedPlace.address}</p>
            <button
              onClick={() => setSelectedPlace(null)}
              style={{
                padding: "8px 15px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                backgroundColor: "#f44336",
                color: "white",
                fontWeight: "bold",
                position: "absolute",
                top: "10px",
                right: "10px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchCenters;
