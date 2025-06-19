import Feature from 'ol/Feature.js';
import Geolocation from 'ol/Geolocation.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Point from 'ol/geom/Point.js';
import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';
import OSM from 'ol/source/OSM.js';
import VectorSource from 'ol/source/Vector.js';
import CircleStyle from 'ol/style/Circle.js';
import Fill from 'ol/style/Fill.js';
import Stroke from 'ol/style/Stroke.js';
import Style from 'ol/style/Style.js';
import {fromLonLat} from 'ol/proj.js';

// Pontos de exemplo em Maceió
/*const pontos = [
  // Exemplo de conversão: 09°40’24,83”S; 035°42’57,66”W → [-35.716016, -9.673564]
  { nome: "Praia do Pontal do Peba", status: "proprio", coordenadas: [-36.30153, -10.34516] },
  { nome: "Rio São Francisco/Piaçabuçú – Rua Coronel José Leonel", status: "proprio", coordenadas: [-36.43490, -10.40829] },
  { nome: "Praia de Feliz Deserto", status: "proprio", coordenadas: [-36.29067, -10.29973] },
  { nome: "Praia de Miai de Baixo", status: "proprio", coordenadas: [-36.21588, -10.22061] },
  { nome: "Praia de Miai de Cima", status: "proprio", coordenadas: [-36.18935, -10.20198] },
  { nome: "Praia do Pontal de Coruripe", status: "proprio", coordenadas: [-36.13637, -10.15833] },
  { nome: "Praia da Lagoa do Pau", status: "proprio", coordenadas: [-36.10948, -10.12913] },
  { nome: "Praia de Duas Barras", status: "proprio", coordenadas: [-36.03177, -10.04927] },
  { nome: "Praia de Lagoa Azeda", status: "proprio", coordenadas: [-35.97976, -9.97111] },
  { nome: "Praia do Gunga", status: "proprio", coordenadas: [-35.90471, -9.86125] },
  { nome: "Praia de Atalaia", status: "proprio", coordenadas: [-35.90661, -9.84443] },
  { nome: "Praia da Barra de São Miguel", status: "proprio", coordenadas: [-35.88886, -9.83883] },
  { nome: "Praia do Francês", status: "proprio", coordenadas: [-35.84170, -9.77166] },
  { nome: "Praia do Saco", status: "proprio", coordenadas: [-35.82011, -9.74408] },
  { nome: "Praia do Pontal da Barra", status: "proprio", coordenadas: [-35.77688, -9.69760] },
  { nome: "Praia da Avenida", status: "improprio", coordenadas: [-35.74039, -9.67000] },
  { nome: "Praia da Pajuçara", status: "improprio", coordenadas: [-35.71546, -9.66579] },
  { nome: "Praia da Ponta Verde", status: "improprio", coordenadas: [-35.69928, -9.66443] },
  { nome: "Praia de Jatiúca", status: "improprio", coordenadas: [-35.69314, -9.64253] },
  { nome: "Praia de Cruz das Almas", status: "proprio", coordenadas: [-35.67820, -9.63850] },
  { nome: "Praia de Jacarecica", status: "improprio", coordenadas: [-35.68768, -9.61349] },
  { nome: "Praia de Guaxuma", status: "proprio", coordenadas: [-35.66809, -9.59229] },
  { nome: "Praia de Garça Torta", status: "proprio", coordenadas: [-35.60979, -9.58340] },
  { nome: "Praia do Mirante da Sereia", status: "proprio", coordenadas: [-35.64407, -9.56542] },
  { nome: "Praia de Ipioca", status: "proprio", coordenadas: [-35.60485, -9.53108] },
  { nome: "Praia de Paripueira", status: "proprio", coordenadas: [-35.54882, -9.47132] },
];*/
const view = new View({
  center: fromLonLat([-35.7350, -9.66599]), // Centraliza em Maceió
  zoom: 12,
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: view,
});

const geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

function el(id) {
  return document.getElementById(id);
}

el('track').addEventListener('change', function () {
  geolocation.setTracking(this.checked);
});

// update the HTML page when the position changes.
geolocation.on('change', function () {
  el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
  el('altitude').innerText = geolocation.getAltitude() + ' [m]';
  el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
  el('heading').innerText = geolocation.getHeading() + ' [rad]';
  el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
});

// handle geolocation error.
geolocation.on('error', function (error) {
  const info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});

const accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  }),
);

geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
});

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [accuracyFeature, positionFeature],
  }),
});

// Adiciona os pontos das praias com cores conforme status

fetch('http://localhost:8080/api/praias')
  .then(response => response.json())
  .then(pontos => {
    const features = pontos.map(ponto => {
      return new Feature({
        geometry: new Point(fromLonLat(ponto.coordenadas)),
        nome: ponto.nome,
        status: ponto.status,
      });
    });

    const styleFunction = feature => {
      const status = feature.get('status');
      return new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({
            color: status === 'proprio' ? 'green' : 'red',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      });
    };

    const pontosLayer = new VectorLayer({
      source: new VectorSource({
        features: features,
      }),
      style: styleFunction,
    });

    map.addLayer(pontosLayer);
  })
  .catch(error => {
    console.error('Erro ao buscar pontos:', error);
  });