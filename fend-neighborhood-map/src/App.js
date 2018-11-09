import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import List from './components/List';
import Map from './components/Map'
import axios from 'axios'
import iconMarkerRed from './red-dot.png';
import iconMarkerBlue from './blue-dot.png';

class App extends Component {
  state = {
  venues: [],
  map: {},
  markers: [],
  infoWindow: [],
  query:''
  }

componentDidMount(){
  this.getVenues()
}


  renderMap = () => {
  this.loadMap("https://maps.googleapis.com/maps/api/js?key=your-api-key&callback=initMap")
window.initMap = this.initMap
}



getVenues = () => {
  const endPoint = "https://api.foursquare.com/v2/venues/explore?"
  const parameters = {
    client_id: "B3PKMEDFQYW4M5E3DUNRXFRDWTWO52IIBXC3SRXYCQ0TU5W0",
    client_secret: "MYEBGCK3KDKUC22BFUKJISSESR5Q3FEQMOX4WTDIJ2S0W0V4",
    query: "hospital",
    near: "Atlanta",
    v: "20182507"
  }

  axios.get(endPoint + new URLSearchParams(parameters))
  .then(response => {
    this.setState({
      venues: response.data.response.groups[0].items
    }, this.renderMap())
    //console.log(response)
  })
  .catch(error => {
    alert("Error!!! " + error)
  })
}

openInfoWindow = (marker, place) => {
  let contentString = `<div id="window" tabindex="1">
  <div class="header">${place.venue.name}</div>
  <div class="content">${place.venue.location.formattedAddress}</div>
  </div>`;

    this.state.infoWindow.setContent(contentString);
    this.state.infoWindow.open( this.state.map, marker);
  }

  //https://developers.google.com/maps/documentation/javascript/adding-a-google-map
  initMap = () => {

     //create a map
        this.map = new window.google.maps.Map(document.getElementById('map'), {
          center:{ lat: 33.749249 ,lng:-84.387314},
          zoom: 11

      })
      this.setState({ map: this.map })
      //create an infoWindow
      let infoWindow = new window.google.maps.InfoWindow()
      this.setState({ infoWindow })

      //display dynamic markers
      let markers = this.state.venues.map(myVenue => {

      //create a marker
      //https://developers.google.com/maps/documentation/javascript/markers
        let marker = new window.google.maps.Marker({
          position: { lat: myVenue.venue.location.lat, lng: myVenue.venue.location.lng },
          map: this.map,
          title: myVenue.venue.name,
          icon: iconMarkerRed,
          //id: myVenue.venue.name
          id: myVenue.venue.id
        })

        let contentString = `<div id="window" tabindex="1">
        <div class="header">${myVenue.venue.name}</div>
        <div class="content">${myVenue.venue.location.formattedAddress}</div>
        </div>`;

        marker.addListener('mouseover', function() {
              marker.setIcon(iconMarkerBlue)
              marker.setAnimation(window.google.maps.Animation.BOUNCE)
            })

        marker.addListener('mouseout', function() {
          marker.setIcon(iconMarkerRed)
            marker.setAnimation(null);
            })

        marker.addListener('click', function() {
      for (let i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
              }

        //change the content
        infoWindow.setContent(contentString)
        //open an infowindow
                infoWindow.open(this.map, marker);
              })
      return marker;
      })
        this.setState({ markers: markers })
        };

      updateQuery = (query) => {
          this.state.infoWindow.close()
          this.setState({ query })
          this.setAppropriateMarker(query)
        }

      //set appropriate marker
      //The setVisible method for the google.maps.Marker
      //http://eyecatchup.github.io/2011/06/03/the-setvisible-method-for-the-google-maps-marker-class-or-how-to-toggle-marker-icons-with-the-google-maps-v3-javascript-api
      //https://stackoverflow.com/questions/36698002/setvisible-on-google-map-markers?rq=1
      setAppropriateMarker =(query) => {
        if (query.trim() === "") {
          this.state.markers.forEach(marker => marker.setVisible(true))
          return true;
        } else {
          let newVenues = this.state.venues.filter(myVenue => {
                return myVenue.venue.name.toLowerCase().indexOf(query.toLowerCase()) > -1
            })
          //newVenues.forEach(myVenue => this.state.markers.filter(marker => marker.title === myVenue.venue.name).map(marker => marker.setVisible(true)))
          newVenues.forEach(myVenue => this.state.markers.filter(marker => marker.title !== myVenue.venue.name).map(marker => marker.setVisible(false)))
          newVenues.forEach(myVenue => this.state.markers.filter(marker => marker.title === myVenue.venue.name).map(marker => marker.setVisible(true)))
        }
        }

       loadMap = (url) => {
        let script = window.document.createElement('script')
        script.src = url
        script.async = true
        script.defer = true
        //script.setAttribute('onerror', 'errorMapLoad()')//
        window.gm_authFailure = () => {
     alert('ERROR!! \nFailed to get Google map.')
     console.log('ERROR!! \nFailed to get Google map.');
    };
        document.body.appendChild(script)
      }



render() {
         //console.log(this.venues)

          return (
            <div className="App">
              <List state={ this.state } venues={this.state.venues} query={this.state.query} markers={this.state.markers} updateQuery={ this.updateQuery } openInfoWindow = {this.openInfoWindow} infoWindow={this.state.infoWindow} map={this.state.map}/>
              <Map state={ this.state } />
            </div>

          );
        }

      }

      export default App;
