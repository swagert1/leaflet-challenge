let timeFrame = "week"; //user can enter hour, day, week, or month as the timeframe

let baseUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_"

let extension = timeFrame + ".geojson"

let quakeUrl = baseUrl + extension;

let plateUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

earthQuakeData = [];
plateData = [];

d3.json(quakeUrl).then(function (response) {
    // Once we get a response, send the data.features object to 
    earthQuakeData = response.features;
    
    getPlateData();
});

function getPlateData(){
  d3.json(plateUrl).then(function (response) {
  // Once we get a response, send the data.features object to 
  plateData = response.features;
  
  mapData(earthQuakeData, plateData);
});

};

function selectColor(value){
    if (value > 90){
        return "crimson"
    }
    else if (value >= 70){
        return "orangered"
    }
    else if (value >= 50){
        return "orange"
    }
    else if (value >=30){
        return "gold"
    }
    else if (value >= 10){
        return "yellow"
    }
    else {
        return "lawngreen"
    };
};

function mapData(earthQuakeData, plateData){

    let earthquakes = [];

    console.log(earthQuakeData);
    
    //Loop through all events and extract relvant information, setup interactivity, and push to earthquakes array
    //Note: the earthquake information is displayed when the mouse cursor hovers over the marker, if this functionality
    //is removed, the information will appear when the marker is clicked
    for (let i = 0; i < earthQuakeData.length; i++) {
        let location = [];
        let depth = earthQuakeData[i].geometry.coordinates[2];
        location = [earthQuakeData[i].geometry.coordinates[1], earthQuakeData[i].geometry.coordinates[0]]; //lat and long are flipped
        let magnitude = earthQuakeData[i].properties.mag * 25000;
        let place = earthQuakeData[i].properties.place;
    if (magnitude > 0){
      //Creating circular markers by location, magnitude, and depth (note: some magnitudes are negative, so those values are excluded)
      earthquakes.push(
        L.circle(location, {
          stroke: true,
          weight: 1,
          fillOpacity: 0.5,
          color: "black",
          fillColor: selectColor(depth),
          colorscale: "Earth",
          radius: magnitude
        }).on({
          // Make the circle darker when mouse touches it
          mouseover: function(event) {
            layer = event.target;
            this.openPopup();
            layer.setStyle({
              fillOpacity: 0.75
            });
          },
          // Make the circle lighter when mouse leaves it
          mouseout: function(event) {
            layer = event.target;
            this.closePopup()
            layer.setStyle({
              fillOpacity: 0.5
            });
          }
        }).bindPopup(`<h3>Location: ${place}</h3><h3>Magnitude: ${magnitude/25000}</h3><h3>Depth: ${depth}<h3>`)
      );
    }
    }
  
  //Creating boundaries of tectonic plates
  
  let plateBounds = [];

  for (let i = 0; i < plateData.length; i++) {
      
    plateBounds.push(
      L.geoJson(plateData[i], {
        style: function(feature) {
          return {
            color: "orange",
            weight: 3
          };
        }
      })
    )
  };

//Importing basemaps from url's

let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Create layer groups for the data to be added to the basemap
let quakes = L.layerGroup(earthquakes);
let plates = L.layerGroup(plateBounds);

// Create a baseMaps object.
let baseMaps = {
  "Street Map": street,
  "Topographic Map": topo,
  "Satelite": satelite
};

// Create an overlay object.
let overlayMaps = {
  "Earthquakes": quakes,
  "Tectonic Plates": plates
};

// Define a map object.
let myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [street, quakes, plates]
});

// Pass our map layers to our layer control.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

//Adding legend to map

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 30, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + selectColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

};


