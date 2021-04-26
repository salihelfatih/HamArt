import React, { useState, useEffect } from 'react';
import { withGoogleMap, withScriptjs, GoogleMap, Marker, InfoWindow } from "react-google-maps";
import * as venueData from "./data/Live_Music_Venues.json";
import mapStyles from "./mapStyles";

function Map() {
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    const listener = e => {
      if (e.key === "Escape") {
        setSelectedVenue(null);
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <GoogleMap
      defaultZoom={10}
      defaultCenter={{ lat: 43.255722, lng: -79.871101 }}
      defaultOptions={{ styles: mapStyles }}
    >
      {venueData.features.map(venue => (
        <Marker
          key={venue.properties.OBJECTID}
          position={{
            lat: venue.geometry.coordinates[1],
            lng: venue.geometry.coordinates[0]
          }}
          onClick={() => {
            setSelectedVenue(venue);
          }}
          icon={{
            url: `/art.svg`,
            scaledSize: new window.google.maps.Size(25, 25)
          }}
        />
      ))}

      {selectedVenue && (
        <InfoWindow
          onCloseClick={() => {
            setSelectedVenue(null);
          }}
          position={{
            lng: selectedVenue.geometry.coordinates[0],
            lat: selectedVenue.geometry.coordinates[1]
          }}
        >
          <div>
            <h2>{selectedVenue.properties.NAME}</h2>
            <p>{selectedVenue.properties.URL}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

const MapWrapped = withScriptjs(withGoogleMap(Map));

export default function showMap() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <MapWrapped
        googleMapURL={"https://maps.googleapis.com/maps/api/js?key=AIzaSyDoH3oyYR5nzERWlIBQ4XLVZLtm63ZoIzc&callback=initMap&libraries=&v=weekly"}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `100%` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    </div>
  );
}
