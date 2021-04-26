import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow, } from "@react-google-maps/api";
import usePlacesAutocomplete, { getGeocode, getLatLng, } from "use-places-autocomplete";
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption,} from "@reach/combobox";
import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";
import * as venueData from "./data/Museums_and_Galleries.json";
import { Container, InputGroup, Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button'
import Box from '@material-ui/core/Box';
import FavoriteIcon from '@material-ui/icons/Favorite';
import StyledRating from '@material-ui/lab/Rating'
import 'bootstrap/dist/css/bootstrap.min.css';
// import axios from 'axios';

const libraries = ["places"];
const mapContainerStyle = {
  height: "100vh",
  width: "100vw",
};

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};

const center = {
  lat: 43.255203,
  lng: -79.843826,
};

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDoH3oyYR5nzERWlIBQ4XLVZLtm63ZoIzc&callback=initMap&libraries=&v=weekly",
    libraries,
  });

  let [markers, setMarkers] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);


  const [comments, setComments] = useState('');

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

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = React.useCallback((e) => {
    setMarkers((current) => [
      ...current,
      {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        time: new Date(),
      },
    ]);
  }, [] 
  );

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(15);
  }, []);

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";

  return (
    <div className="">
        <Row className="navigation">
          <Col md={4} sm={3} xs={1}><h1><span className="title p-3">Galleries and Musuems</span> {" "}<span role="img" aria-label="tent">🏛️</span></h1></Col>
          <Col md={4}sm={3} xs={1} className="m-2" ><Search panTo={panTo} autoFocus /></Col>
          <Col md={4} sm={3} xs={1}><Locate panTo={panTo} /></Col>
        </Row>
     

      <GoogleMap id="map" mapContainerStyle={mapContainerStyle} zoom={11} center={center} options={options} onClick={onMapClick} onLoad={onMapLoad} >
        {venueData.features.map(venue => (
        <Marker key={venue.properties.OBJECTID} position={{ lng: venue.geometry.coordinates[0], lat: venue.geometry.coordinates[1] }}
            onClick={() => { setSelectedVenue(venue); }} icon={{ url: `/art.svg`, scaledSize: new window.google.maps.Size(25, 25) }} /> ))} 
          {selectedVenue ?  <InfoWindow  onCloseClick={() => { setSelectedVenue(null); }} position={{ lng: selectedVenue.geometry.coordinates[0], lat: selectedVenue.geometry.coordinates[1] }} >
              <div>
                <h2>{selectedVenue.properties.NAME}</h2>
                <p>{selectedVenue.properties.ADDRESS}</p>
                <p>{selectedVenue.properties.URL}</p>
                <Box component="fieldset" mb={2} borderColor="transparent">
                  <StyledRating name="customized-color" defaultValue={3}
                    getLabelText={(value) => `${value} Heart${value !== 1 ? 's' : ''}`} 
                    precision={1} icon={<FavoriteIcon fontSize="inherit" />}>
                  </StyledRating>
                </Box>
                <InputGroup className="col-sm-12 commentBox">                      
                  {<textarea className="col-sm-12 form-control-lg" placeholder="Please leave a comment!" rows="3" 
                  /** onChange={(e)=>{setComments(e.target.value)}} */ />}
                </InputGroup>
                <br />
                <div className="text-center">
                  <Button block variant="warning" size="sm" /**onClick={setComments}*/>Post</Button>
                </div>
              </div>
            </InfoWindow>
            : null
          }
        </GoogleMap>
    </div>
  );
}

function Locate({ panTo }) {
  return (
    <button
      className="locate"
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => null
        );
      }}
    >
      <img src="./compass.svg" alt="Locate me!"/>
    </button>
  );
}

function Search({ panTo }) {
  const {
    ready,
    value,
    suggestions: { status, data, },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 43.255203, lng: () => 	-79.843826 },
      radius: 100 * 1000,
    },
  });

  const handleEntry = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      panTo({ lat, lng });
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  return (
    <div className="search">
      <Combobox onSelect={handleSelect}>
        <ComboboxInput value={value} onChange={handleEntry} disabled={!ready} placeholder="Search your location!" />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
