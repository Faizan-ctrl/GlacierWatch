const OVERVIEW_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const TERRAIN_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const TERRAIN_TILES = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const IMAGERY_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

function hasMapLibre() {
  return typeof window !== 'undefined' && Boolean(window.maplibregl);
}

function addDemSource(map) {
  if (map.getSource('gw-dem')) return;
  map.addSource('gw-dem', {
    type: 'raster-dem',
    tiles: [TERRAIN_TILES],
    encoding: 'terrarium',
    tileSize: 256,
    attribution: 'Terrain: Mapzen / AWS',
    maxzoom: 15,
  });
}

export function initOverviewMap(container, { lakes, onSelect }) {
  const loading = document.getElementById('overview-map-loading');
  const fallback = document.getElementById('overview-map-fallback');

  if (!hasMapLibre()) {
    loading?.remove();
    if (fallback) fallback.hidden = false;
    return null;
  }

  const map = new window.maplibregl.Map({
    container,
    style: OVERVIEW_STYLE,
    center: [74.35, 36.18],
    zoom: 6.7,
    pitch: 62,
    bearing: -18,
    maxPitch: 78,
    attributionControl: true,
  });

  map.addControl(new window.maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

  const markerElements = new Map();
  let ready = false;
  let terrainOn = true;

  const watchdog = window.setTimeout(() => {
    if (ready) return;
    loading?.remove();
    if (fallback) fallback.hidden = false;
  }, 15000);

  const selectMarker = (id) => {
    markerElements.forEach((el, key) => el.classList.toggle('selected', key === id));
  };

  const fitToLakes = () => {
    const bounds = new window.maplibregl.LngLatBounds();
    lakes.forEach((lake) => bounds.extend([lake.lng, lake.lat]));
    map.fitBounds(bounds, { padding: { top: 40, bottom: 40, left: 40, right: 40 }, maxZoom: 7.9, duration: 0 });
  };

  map.on('load', () => {
    ready = true;
    window.clearTimeout(watchdog);
    if (fallback) fallback.hidden = true;
    addDemSource(map);
    map.addLayer({
      id: 'gw-hillshade',
      type: 'hillshade',
      source: 'gw-dem',
      layout: { visibility: 'visible' },
      paint: {
        'hillshade-shadow-color': 'rgba(23, 55, 75, .55)',
        'hillshade-highlight-color': 'rgba(255, 255, 255, .26)',
        'hillshade-accent-color': 'rgba(46, 98, 120, .32)',
        'hillshade-exaggeration': 0.62,
      },
    });

    map.setTerrain({ source: 'gw-dem', exaggeration: 1.6 });
    if (typeof map.setFog === 'function') {
      map.setFog({
        range: [0.6, 9],
        color: '#eef4f8',
        'horizon-blend': 0.2,
        'high-color': '#dfe9f0',
        'space-color': '#f2f6fa',
        'star-intensity': 0,
      });
    }

    fitToLakes();
    map.setPitch(62);
    map.setBearing(-18);

    lakes.forEach((lake) => {
      const el = document.createElement('div');
      el.className = `lake-marker ${lake.tier}`;
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `${lake.name}, risk score ${lake.total} out of 100, ${lake.tier === 'moderate' ? 'watch' : lake.tier}`);

      if (lake.tier !== 'low') {
        const label = document.createElement('span');
        label.className = 'marker-label';
        label.innerHTML = `${lake.name.replace(' Lake', '')} <em class="${lake.tier}">${lake.total}</em>`;
        el.appendChild(label);
      }

      const popup = new window.maplibregl.Popup({ offset: 18, closeButton: false, closeOnClick: false })
        .setHTML(
          `<strong>${lake.name}</strong><span>${lake.tier === 'moderate' ? 'Watch' : lake.tier === 'high' ? 'High risk' : 'Stable'} · ${lake.total}/100 · ${lake.district}</span>`,
        );

      el.addEventListener('mouseenter', () => popup.setLngLat([lake.lng, lake.lat]).addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        popup.remove();
        onSelect(lake.id);
      });
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(lake.id);
        }
      });

      new window.maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lake.lng, lake.lat])
        .addTo(map);

      markerElements.set(lake.id, el);
    });

    loading?.remove();
  });

  map.on('error', (event) => {
    if (ready) return;
    const message = event?.error?.message ?? '';
    if (/style|sprite|glyphs|Failed to fetch|load/i.test(message)) {
      window.setTimeout(() => {
        if (ready) return;
        loading?.remove();
        if (fallback) fallback.hidden = false;
      }, 2500);
    }
  });

  const setTerrain = (on) => {
    if (!ready) return terrainOn;
    terrainOn = on;
    if (on) {
      map.setTerrain({ source: 'gw-dem', exaggeration: 1.6 });
      if (map.getLayer('gw-hillshade')) {
        map.setLayoutProperty('gw-hillshade', 'visibility', 'visible');
      }
      map.easeTo({ pitch: 62, bearing: -18, duration: 900 });
    } else {
      map.setTerrain(null);
      if (map.getLayer('gw-hillshade')) {
        map.setLayoutProperty('gw-hillshade', 'visibility', 'none');
      }
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
    }
    return terrainOn;
  };

  return {
    map,
    selectMarker,
    focusLake(id) {
      const lake = lakes.find((item) => item.id === id);
      if (!lake) return;
      selectMarker(id);
      map.flyTo({ center: [lake.lng, lake.lat], zoom: 9.4, duration: 1100 });
    },
    toggleTerrain: () => setTerrain(!terrainOn),
    isTerrainOn: () => terrainOn,
    resize: () => map.resize(),
  };
}

export function initTerrainMap(container, { routes, onRouteSelect }) {
  const loading = document.getElementById('terrain-map-loading');
  const fallback = document.getElementById('terrain-map-fallback');
  const layerNote = document.getElementById('layer-note');

  if (!hasMapLibre()) {
    loading?.remove();
    if (fallback) fallback.hidden = false;
    return null;
  }

  const map = new window.maplibregl.Map({
    container,
    style: TERRAIN_STYLE,
    center: routes[0]?.center ?? [74.606, 36.447],
    zoom: 12.6,
    pitch: 62,
    bearing: -18,
    maxPitch: 82,
    attributionControl: true,
  });

  map.addControl(new window.maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

  let ready = false;
  let activeLayer = 'optical';

  const watchdog = window.setTimeout(() => {
    if (ready) return;
    loading?.remove();
    if (fallback) fallback.hidden = false;
  }, 15000);

  const firstLabelLayer = () => {
    const layers = map.getStyle()?.layers ?? [];
    return layers.find((layer) => layer.type === 'symbol')?.id;
  };

  map.on('load', () => {
    ready = true;
    window.clearTimeout(watchdog);
    if (fallback) fallback.hidden = true;
    const beforeLabels = firstLabelLayer();

    map.addSource('esri-imagery', {
      type: 'raster',
      tiles: [IMAGERY_TILES],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Imagery: Esri, Maxar, Earthstar Geographics',
    });

    map.addLayer(
      {
        id: 'optical-layer',
        type: 'raster',
        source: 'esri-imagery',
        paint: { 'raster-opacity': 0.9, 'raster-saturation': 0.02 },
      },
      beforeLabels,
    );

    map.addLayer(
      {
        id: 'sar-layer',
        type: 'raster',
        source: 'esri-imagery',
        layout: { visibility: 'none' },
        paint: {
          'raster-opacity': 0.94,
          'raster-saturation': -1,
          'raster-contrast': 0.22,
          'raster-brightness-max': 0.6,
        },
      },
      beforeLabels,
    );

    addDemSource(map);
    map.addLayer(
      {
        id: 'terrain-shade',
        type: 'hillshade',
        source: 'gw-dem',
        paint: {
          'hillshade-shadow-color': 'rgba(10, 28, 40, .42)',
          'hillshade-highlight-color': 'rgba(255, 255, 255, .28)',
          'hillshade-accent-color': 'rgba(35, 80, 100, .2)',
          'hillshade-exaggeration': 0.5,
        },
      },
      beforeLabels,
    );

    map.setTerrain({ source: 'gw-dem', exaggeration: 1.45 });

    const routeCollection = {
      type: 'FeatureCollection',
      features: routes.map((route) => ({
        type: 'Feature',
        properties: { id: route.id },
        geometry: { type: 'LineString', coordinates: route.coordinates },
      })),
    };

    map.addSource('evac-routes', { type: 'geojson', data: routeCollection });

    map.addLayer({
      id: 'evac-casing',
      type: 'line',
      source: 'evac-routes',
      paint: { 'line-color': 'rgba(4, 35, 24, .55)', 'line-width': 9, 'line-opacity': 0.55 },
      layout: { 'line-cap': 'round', 'line-join': 'round' },
    });

    map.addLayer({
      id: 'evac-line',
      type: 'line',
      source: 'evac-routes',
      paint: {
        'line-color': '#34e0a1',
        'line-width': 3.2,
        'line-dasharray': [1.4, 1.4],
        'line-opacity': 0.98,
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' },
    });

    routes.forEach((route) => {
      const startEl = document.createElement('div');
      startEl.className = 'evac-marker start';
      startEl.setAttribute('aria-hidden', 'true');

      new window.maplibregl.Marker({ element: startEl, anchor: 'center' })
        .setLngLat(route.startCoord)
        .addTo(map);

      const safeEl = document.createElement('div');
      safeEl.className = 'evac-marker safe';
      const label = document.createElement('span');
      label.className = 'evac-marker-label';
      label.textContent = `Safe ground · +${route.elevationEnd - route.elevationStart} m`;
      safeEl.appendChild(label);

      new window.maplibregl.Marker({ element: safeEl, anchor: 'center' })
        .setLngLat(route.safeCoord)
        .addTo(map);
    });

    loading?.remove();
    map.flyTo({
      center: routes[0].center,
      zoom: routes[0].zoom,
      pitch: 62,
      bearing: -18,
      duration: 0,
    });
  });

  map.on('error', () => {
    if (ready) return;
    window.setTimeout(() => {
      if (ready) return;
      loading?.remove();
      if (fallback) fallback.hidden = false;
    }, 3500);
  });

  return {
    map,
    isReady: () => ready,
    resize: () => map.resize(),
    setLayer(layer) {
      if (!ready) return activeLayer;
      activeLayer = layer;
      map.setLayoutProperty('optical-layer', 'visibility', layer === 'optical' ? 'visible' : 'none');
      map.setLayoutProperty('sar-layer', 'visibility', layer === 'sar' ? 'visible' : 'none');
      map.setLayoutProperty('terrain-shade', 'visibility', 'visible');
      if (layerNote) {
        layerNote.textContent =
          layer === 'sar'
            ? 'Simulated radar texture · production streams Sentinel-1'
            : 'Optical imagery · illustrative demo basemap';
      }
      return activeLayer;
    },
    getLayer: () => activeLayer,
    focusRoute(id) {
      const route = routes.find((item) => item.id === id);
      if (!route) return;
      onRouteSelect?.(id);
      map.flyTo({
        center: route.center,
        zoom: route.zoom,
        pitch: 60,
        bearing: -22,
        duration: 1100,
      });
    },
  };
}
