import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { theme } from '../constants/theme';
import { PolygonPoint } from '../types/CropArea';
import { buildGeoJsonPolygon, geoJsonToString } from '../utils/geoJsonHelpers';

interface MapPolygonPickerProps {
  initialPoints?: PolygonPoint[];
  onConfirm: (points: PolygonPoint[], geoJson: string) => void;
}

// ─── Leaflet HTML ────────────────────────────────────────────────────────────
function getMapHtml(initialCenter: [number, number], initialZoom: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; background: #1a1a2e; }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  (function() {
    var map = L.map('map', {
      center: [${initialCenter[0]}, ${initialCenter[1]}],
      zoom: ${initialZoom},
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    var points = [];
    var markers = [];
    var polygon = null;
    var searchMarker = null;

    function postMessage(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    function createNumberedIcon(number) {
      return L.divIcon({
        className: 'custom-marker',
        html: '<div style="'
          + 'width:28px;height:28px;border-radius:50%;'
          + 'background:#00C16A;border:2.5px solid #fff;'
          + 'display:flex;align-items:center;justify-content:center;'
          + 'color:#fff;font-weight:700;font-size:13px;'
          + 'box-shadow:0 2px 6px rgba(0,0,0,0.35);'
          + '">' + number + '</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    }

    function redraw() {
      // Remove existing polygon
      if (polygon) {
        map.removeLayer(polygon);
        polygon = null;
      }
      // Draw polygon if 3+ points
      if (points.length >= 3) {
        polygon = L.polygon(points, {
          color: '#00C16A',
          weight: 2.5,
          fillColor: '#00C16A',
          fillOpacity: 0.18,
        }).addTo(map);
      }
    }

    function syncPoints() {
      var data = points.map(function(p, i) {
        return { latitude: p[0], longitude: p[1], index: i + 1 };
      });
      postMessage({ type: 'points', points: data });
    }

    map.on('click', function(e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      points.push([lat, lng]);
      var marker = L.marker([lat, lng], {
        icon: createNumberedIcon(points.length),
      }).addTo(map);
      markers.push(marker);
      redraw();
      syncPoints();
    });

    // Receive commands from React Native
    window.handleRNMessage = function(msg) {
      if (msg.type === 'removeLastPoint') {
        if (points.length > 0) {
          points.pop();
          var m = markers.pop();
          if (m) map.removeLayer(m);
          // Re-create markers with correct numbers
          markers.forEach(function(mk) { map.removeLayer(mk); });
          markers = [];
          points.forEach(function(p, i) {
            var mk = L.marker(p, { icon: createNumberedIcon(i + 1) }).addTo(map);
            markers.push(mk);
          });
          redraw();
          syncPoints();
        }
      } else if (msg.type === 'clearAll') {
        points = [];
        markers.forEach(function(mk) { map.removeLayer(mk); });
        markers = [];
        if (polygon) { map.removeLayer(polygon); polygon = null; }
        syncPoints();
      } else if (msg.type === 'flyTo') {
        map.flyTo([msg.lat, msg.lng], msg.zoom || 16, { duration: 1.2 });
        if (searchMarker) map.removeLayer(searchMarker);
        searchMarker = L.marker([msg.lat, msg.lng], {
          icon: L.divIcon({
            className: 'search-marker',
            html: '<div style="'
              + 'width:14px;height:14px;border-radius:50%;'
              + 'background:#2563EB;border:2.5px solid #fff;'
              + 'box-shadow:0 2px 8px rgba(37,99,235,0.5);'
              + '"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        }).addTo(map);
      } else if (msg.type === 'setInitialPoints') {
        points = [];
        markers.forEach(function(mk) { map.removeLayer(mk); });
        markers = [];
        if (polygon) { map.removeLayer(polygon); polygon = null; }
        msg.points.forEach(function(p) {
          points.push([p.latitude, p.longitude]);
          var mk = L.marker([p.latitude, p.longitude], {
            icon: createNumberedIcon(points.length),
          }).addTo(map);
          markers.push(mk);
        });
        redraw();
        syncPoints();
        if (points.length > 0) {
          var group = L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.3));
        }
      }
    };

    // Listen for messages from React Native (injected via injectJavaScript)
    document.addEventListener('message', function(e) {
      try { window.handleRNMessage(JSON.parse(e.data)); } catch(err) {}
    });
    window.addEventListener('message', function(e) {
      try { window.handleRNMessage(JSON.parse(e.data)); } catch(err) {}
    });
  })();
</script>
</body>
</html>
`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function MapPolygonPicker({ initialPoints, onConfirm }: MapPolygonPickerProps) {
  const webViewRef = useRef<WebView>(null);
  const [points, setPoints] = useState<PolygonPoint[]>(initialPoints ?? []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Initial center: Mogi das Cruzes, SP
  const CENTER: [number, number] = [-23.5228, -46.1884];
  const INITIAL_ZOOM = 13;

  const sendToWebView = useCallback(
    (msg: object) => {
      if (webViewRef.current) {
        const script = `
          try { window.handleRNMessage(${JSON.stringify(msg)}); } catch(e) {}
          true;
        `;
        webViewRef.current.injectJavaScript(script);
      }
    },
    [],
  );

  const handleWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'points') {
          const pts: PolygonPoint[] = data.points.map(
            (p: { latitude: number; longitude: number }) => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }),
          );
          setPoints(pts);
        }
      } catch {
        // Ignore non-JSON messages
      }
    },
    [],
  );

  const handleWebViewLoad = useCallback(() => {
    if (initialPoints && initialPoints.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      setTimeout(() => {
        sendToWebView({ type: 'setInitialPoints', points: initialPoints });
      }, 500);
    }
  }, [initialPoints, sendToWebView]);

  // ── Search ──
  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchResult(null);
    setSearchError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'AgroOrbitMobile/1.0' },
      });
      const results = await response.json();
      if (results && results.length > 0) {
        const r = results[0];
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        const displayName: string = r.display_name ?? `${lat}, ${lng}`;
        setSearchResult(displayName);
        sendToWebView({ type: 'flyTo', lat, lng, zoom: 16 });
      } else {
        setSearchError(
          'Local não encontrado. Tente pesquisar por cidade, rua ou referência próxima.',
        );
      }
    } catch {
      setSearchError('Erro ao buscar localização. Verifique sua conexão.');
    } finally {
      setSearching(false);
    }
  }, [searchQuery, sendToWebView]);

  // ── Actions ──
  const handleRemoveLast = useCallback(() => {
    sendToWebView({ type: 'removeLastPoint' });
  }, [sendToWebView]);

  const handleClearAll = useCallback(() => {
    sendToWebView({ type: 'clearAll' });
  }, [sendToWebView]);

  const handleConfirm = useCallback(() => {
    if (points.length < 3) return;
    const geoJson = buildGeoJsonPolygon(points);
    onConfirm(points, geoJsonToString(geoJson));
  }, [points, onConfirm]);

  const html = getMapHtml(CENTER, INITIAL_ZOOM);

  return (
    <View style={styles.wrapper}>
      {/* ── Search Bar ── */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar cidade, rua, fazenda ou região"
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          disabled={searching}
          activeOpacity={0.7}
        >
          {searching ? (
            <ActivityIndicator size="small" color={theme.background} />
          ) : (
            <Text style={styles.searchBtnText}>Buscar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search result card */}
      {searchResult && (
        <View style={styles.resultCard}>
          <Text style={styles.resultIcon}>📍</Text>
          <Text style={styles.resultText} numberOfLines={2}>
            {searchResult}
          </Text>
        </View>
      )}
      {searchError && (
        <View style={[styles.resultCard, styles.resultCardError]}>
          <Text style={styles.resultText}>{searchError}</Text>
        </View>
      )}

      {/* ── Map ── */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={styles.map}
          onMessage={handleWebViewMessage}
          onLoad={handleWebViewLoad}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          mixedContentMode="always"
          scrollEnabled={false}
          nestedScrollEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.mapLoadingText}>Carregando mapa…</Text>
            </View>
          )}
          // Prevent zoom gestures from being captured by parent scroll
          {...(Platform.OS === 'android' ? { overScrollMode: 'never' as const } : {})}
        />
      </View>

      {/* Point count badge */}
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsBadgeText}>
          {points.length} {points.length === 1 ? 'ponto' : 'pontos'} marcado{points.length !== 1 ? 's' : ''}
        </Text>
        {points.length > 0 && points.length < 3 && (
          <Text style={styles.pointsHint}>
            Marque pelo menos 3 pontos para formar o polígono
          </Text>
        )}
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionOutline]}
          onPress={handleRemoveLast}
          disabled={points.length === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionBtnText, styles.actionOutlineText, points.length === 0 && styles.actionDisabled]}>
            Remover último
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionDanger]}
          onPress={handleClearAll}
          disabled={points.length === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionBtnText, styles.actionDangerText, points.length === 0 && styles.actionDisabled]}>
            Limpar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionPrimary, points.length < 3 && styles.actionBtnDisabled]}
          onPress={handleConfirm}
          disabled={points.length < 3}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionBtnText, styles.actionPrimaryText]}>
            Confirmar
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  // Search
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.surfaceLight,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    color: theme.text,
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  searchBtnText: {
    color: theme.background,
    fontWeight: '700',
    fontSize: 14,
  },
  // Result card
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.primary}18`,
    borderWidth: 1,
    borderColor: `${theme.primary}44`,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
  },
  resultCardError: {
    backgroundColor: `${theme.red}18`,
    borderColor: `${theme.red}44`,
  },
  resultIcon: {
    fontSize: 16,
  },
  resultText: {
    color: theme.text,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  // Map
  mapContainer: {
    height: 340,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: theme.border,
    backgroundColor: theme.surfaceLight,
  },
  map: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  mapLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLoadingText: {
    color: theme.textMuted,
    marginTop: 10,
    fontSize: 13,
  },
  // Points badge
  pointsBadge: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pointsBadgeText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '600',
  },
  pointsHint: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDisabled: {
    opacity: 0.45,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionOutline: {
    borderWidth: 1.5,
    borderColor: theme.primary,
    backgroundColor: 'transparent',
  },
  actionOutlineText: {
    color: theme.primary,
  },
  actionDanger: {
    borderWidth: 1.5,
    borderColor: theme.red,
    backgroundColor: 'transparent',
  },
  actionDangerText: {
    color: theme.red,
  },
  actionPrimary: {
    backgroundColor: theme.primary,
  },
  actionPrimaryText: {
    color: theme.background,
  },
  actionDisabled: {
    opacity: 0.4,
  },
});
