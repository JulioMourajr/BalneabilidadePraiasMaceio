// Usando OpenLayers global (sem imports)
const { Map, View, Feature, Geolocation } = ol;
const { Point } = ol.geom;
const { Tile: TileLayer, Vector: VectorLayer } = ol.layer;
const { OSM, Vector: VectorSource } = ol.source;
const { Style, Fill, Stroke, Circle } = ol.style;
const { fromLonLat } = ol.proj;

// Função para detectar a URL da API baseada no ambiente
function getApiUrl() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('amazonaws') || hostname.includes('elb') || 
      (!hostname.includes('localhost') && !hostname.includes('127.0.0.1'))) {
    console.log('🚀 Modo produção: usando AWS');
    return 'http://balneabilidade-alb-1128086229.us-east-1.elb.amazonaws.com/api/praias';
  } else {
    console.log('🔧 Modo desenvolvimento: usando localhost');
    return 'http://localhost:8080/api/praias';
  }
}

// Mostrar mensagem de status
function showMessage(text, type = 'success', duration = 3000) {
  const existing = document.querySelector('.status-message');
  if (existing) existing.remove();
  
  const msg = document.createElement('div');
  msg.className = `status-message ${type}`;
  msg.textContent = text;
  document.body.appendChild(msg);
  
  setTimeout(() => {
    if (msg.parentNode) msg.remove();
  }, duration);
}

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

// Verificar se elementos existem antes de adicionar listeners
const trackElement = el('track');
if (trackElement) {
  trackElement.addEventListener('change', function () {
    geolocation.setTracking(this.checked);
    if (this.checked) {
      showMessage('📍 Rastreamento GPS ativado', 'loading');
    } else {
      showMessage('📍 Rastreamento GPS desativado', 'success');
    }
  });
}

// Atualizar informações de posição
geolocation.on('change', function () {
  const accuracy = el('accuracy');
  const altitude = el('altitude');
  const speed = el('speed');
  
  if (accuracy) accuracy.innerText = Math.round(geolocation.getAccuracy()) + ' m';
  if (altitude) altitude.innerText = (geolocation.getAltitude() || 0).toFixed(1) + ' m';
  if (speed) speed.innerText = (geolocation.getSpeed() || 0).toFixed(1) + ' m/s';
});

// Tratar erros de geolocalização
geolocation.on('error', function (error) {
  console.error('Erro de geolocalização:', error);
  showMessage('❌ Erro no GPS: ' + error.message, 'error');
  const info = el('info');
  if (info) {
    info.innerHTML = error.message;
    info.style.display = 'block';
  }
});

// Feature para mostrar precisão da localização
const accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

// Feature para mostrar posição atual
const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 3,
      }),
    }),
  }),
);

geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
  if (coordinates) {
    showMessage('📍 Posição GPS atualizada', 'success', 2000);
  }
});

// Adicionar layer de geolocalização
new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [accuracyFeature, positionFeature],
  }),
});

// Carregar pontos das praias
console.log('🔗 Carregando pontos de:', getApiUrl());
console.log('🌐 Hostname atual:', window.location.hostname);

async function carregarPontos() {
  showMessage('📡 Carregando dados das praias...', 'loading');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(getApiUrl(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const pontos = await response.json();
    console.log(`✅ ${pontos.length} pontos carregados da API`);
    
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
        image: new Circle({
          radius: 10,
          fill: new Fill({
            color: status === 'proprio' ? '#4CAF50' : '#f44336',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 3,
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
    
    // Adicionar popup ao clicar nos pontos
    map.on('click', function (evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
      });
      
      if (feature && feature.get('nome')) {
        const nome = feature.get('nome');
        const status = feature.get('status');
        const statusText = status === 'proprio' ? 'PRÓPRIA' : 'IMPRÓPRIA';
        const statusColor = status === 'proprio' ? '#4CAF50' : '#f44336';
        
        showMessage(`🏖️ ${nome} - ${statusText}`, status === 'proprio' ? 'success' : 'error', 4000);
      }
    });
    
    showMessage(`✅ ${pontos.length} praias carregadas`, 'success');
    
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ Erro ao buscar pontos:', error);
    
    let errorMessage = '❌ Erro ao carregar dados das praias';
    
    if (error.name === 'AbortError') {
      errorMessage = '⏱️ Timeout: API demorou muito para responder';
    } else if (error.message.includes('504')) {
      errorMessage = '🚫 API temporariamente indisponível (504)';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = '🌐 Erro de conexão com a API';
    }
    
    showMessage(errorMessage, 'error', 8000);
  }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
  console.log('🌊 Sistema de Balneabilidade inicializado');
  carregarPontos();
});