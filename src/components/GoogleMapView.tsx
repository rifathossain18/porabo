import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, DollarSign, BookOpen, Send, Heart, X, Sparkles, ExternalLink, Layers, Globe } from 'lucide-react';
import { TuitionPost } from '../lib/types';
import { formatDistanceAnnotation } from '../lib/geo';

interface GoogleMapViewProps {
  posts: TuitionPost[];
  userLat: number;
  userLng: number;
  radiusKm: number;
  onRadiusChange?: (newRadius: number) => void;
  appliedPostIds?: string[];
  onApply: (post: TuitionPost) => void;
  onBookmarkToggle: (postId: string, e: React.MouseEvent) => void;
}

// Custom dark mode JSON style for Google Maps matching Porabo's Black & Electric Blue palette
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#090E18' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#090E18' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#748AA6' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38BDF8' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3B82F6' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0F172A' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#2563EB' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1E293B' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0F172A' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748B' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1E3A8A' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0F172A' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#93C5FD' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#111827' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38BDF8' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#030712' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1D4ED8' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#030712' }]
  }
];

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  posts,
  userLat,
  userLng,
  radiusKm,
  onRadiusChange,
  appliedPostIds = [],
  onApply,
  onBookmarkToggle,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userCircleRef = useRef<google.maps.Circle | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const [selectedPost, setSelectedPost] = useState<TuitionPost | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');

  const handleToggleMapType = (newType: 'roadmap' | 'hybrid') => {
    setMapType(newType);
    if (!mapInstanceRef.current || !window.google?.maps) return;
    if (newType === 'hybrid') {
      mapInstanceRef.current.setOptions({
        mapTypeId: google.maps.MapTypeId.HYBRID,
        styles: null, // Clear dark mode styles so real satellite photography & landmark labels are visible
      });
      try {
        mapInstanceRef.current.setTilt(45);
      } catch {}
    } else {
      mapInstanceRef.current.setOptions({
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: DARK_MAP_STYLE,
      });
    }
  };


  
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  if (!apiKey) {
    console.error(
      '[Porabo] VITE_GOOGLE_MAPS_API_KEY is missing. Please add it to your .env file.'
    );
  }


  // Load Google Maps API script
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => setMapError('Failed to load Google Maps SDK. Please check your internet connection.');
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener('load', () => setMapLoaded(true));
    }
  }, [apiKey]);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.google?.maps) return;

    try {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: userLat, lng: userLng },
        zoom: radiusKm <= 1 ? 15 : radiusKm <= 3 ? 14 : radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : 11,
        styles: DARK_MAP_STYLE,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        backgroundColor: '#070A12',
        // Mandatory solution tracking ID per Google Maps Platform rules
        // @ts-ignore
        internalUsageAttributionIds: ['gmp_git_agentskills_v1'],
      };

      const map = new google.maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Add User Location Beacon Marker
      const userMarker = new google.maps.Marker({
        position: { lat: userLat, lng: userLng },
        map,
        title: 'Your Real-Time Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#38BDF8',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2.5,
        },
        zIndex: 999,
      });
      userMarkerRef.current = userMarker;

      // Draw Radius Circle
      if (radiusKm < 9000) {
        const circle = new google.maps.Circle({
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 1.5,
          fillColor: '#2563EB',
          fillOpacity: 0.08,
          map,
          center: { lat: userLat, lng: userLng },
          radius: radiusKm * 1000,
        });
        userCircleRef.current = circle;
      }
    } catch (err: any) {
      console.error('Error initializing map:', err);
      setMapError('Error initializing Google Maps.');
    }
  }, [mapLoaded, userLat, userLng]);

  // Update Markers when posts or radius change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Update radius circle
    if (userCircleRef.current) {
      if (radiusKm < 9000) {
        userCircleRef.current.setRadius(radiusKm * 1000);
        userCircleRef.current.setCenter({ lat: userLat, lng: userLng });
        userCircleRef.current.setVisible(true);
      } else {
        userCircleRef.current.setVisible(false);
      }
    }

    // Add tuition post markers
    posts.forEach(post => {
      const isApplied = appliedPostIds.includes(post.id);

      const marker = new google.maps.Marker({
        position: { lat: post.latitude, lng: post.longitude },
        map: mapInstanceRef.current!,
        title: post.title,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: isApplied ? '#10B981' : '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#070A12',
          strokeWeight: 1.5,
          scale: 1.6,
          anchor: new google.maps.Point(12, 22),
        },
      });

      marker.addListener('click', () => {
        setSelectedPost(post);
        mapInstanceRef.current?.panTo({ lat: post.latitude, lng: post.longitude });
      });

      markersRef.current.push(marker);
    });
  }, [posts, radiusKm, userLat, userLng, appliedPostIds]);

  return (
    <div className="relative w-full h-[520px] sm:h-[620px] rounded-3xl overflow-hidden border border-blue-900/40 shadow-2xl bg-[#090E18]">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading or Error Overlay */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-[#090E18] flex flex-col items-center justify-center text-slate-300 gap-3 z-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-blue-400">Loading Google Maps Interactive Feed...</p>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 bg-[#090E18] flex flex-col items-center justify-center p-6 text-center z-20">
          <MapPin className="w-10 h-10 text-rose-500 mb-2" />
          <h3 className="text-base font-bold text-white">Map View Unavailable</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">{mapError}</p>
        </div>
      )}

      {/* Top Floating Map Info Badge */}
      <div className="absolute top-4 left-4 z-10 bg-[#0B0F19]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-blue-900/60 text-xs flex items-center gap-2.5 shadow-xl">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
        <span className="font-semibold text-white">Live Radar Map</span>
        <span className="text-slate-400 font-mono text-[11px]">
          ({posts.length} tuition markers within {radiusKm >= 9000 ? 'District' : `${radiusKm} km`})
        </span>
      </div>

      {/* Dynamic Radius Slider (1km to 5km) */}
      <div className="absolute top-16 left-4 z-10 bg-[#0B0F19]/95 backdrop-blur-md p-3 rounded-2xl border border-blue-900/70 shadow-2xl space-y-2 w-64 max-w-[calc(100vw-3rem)]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Radar Range:</span>
          </span>
          <span className="font-mono font-bold text-cyan-400 text-xs">
            {radiusKm >= 9000 ? 'District' : `${radiusKm} km`}
          </span>
        </div>

        {onRadiusChange && (
          <>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={radiusKm >= 9000 ? 5 : Math.min(Math.max(radiusKm, 1), 5)}
              onChange={(e) => onRadiusChange(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>1 km</span>
              <span>2.5 km</span>
              <span>5 km</span>
            </div>
            <div className="flex items-center gap-1 pt-1 border-t border-slate-800/80">
              {[1, 2, 3, 5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onRadiusChange(preset)}
                  className={`flex-1 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                    radiusKm === preset
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {preset}km
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Top Right Action Controls: Map Style Toggle & Recenter */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Satellite / Hybrid / 3D Toggle */}
        <div className="bg-[#0B0F19]/95 backdrop-blur-md p-1 rounded-2xl border border-blue-900/60 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleToggleMapType('roadmap')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapType === 'roadmap'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Standard Dark Cyber Map"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Standard</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleMapType('hybrid')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapType === 'hybrid'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Satellite & Landmarks Hybrid 3D View"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Satellite / 3D</span>
          </button>
        </div>

        {/* Recenter Button */}
        <button
          type="button"
          onClick={() => {
            mapInstanceRef.current?.panTo({ lat: userLat, lng: userLng });
            mapInstanceRef.current?.setZoom(radiusKm <= 2 ? 15 : 14);
          }}
          title="Recenter on your GPS location"
          className="bg-[#0B0F19]/90 hover:bg-[#111827] text-blue-400 p-2.5 rounded-2xl border border-blue-900/60 shadow-xl transition-all"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Marker Bottom Card Popup */}
      {selectedPost && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 bg-[#111827]/95 backdrop-blur-xl border border-blue-500/50 rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 text-[11px] font-mono border border-blue-800/60 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>
                {selectedPost.distanceKm !== undefined
                  ? formatDistanceAnnotation(selectedPost.distanceKm).badgeText
                  : 'Nearby'}
              </span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => onBookmarkToggle(selectedPost.id, e)}
                className="p-1.5 rounded-full bg-[#0B0F19] hover:bg-slate-800 text-slate-400 hover:text-rose-400"
              >
                <Heart className={`w-4 h-4 ${selectedPost.isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="p-1.5 rounded-full bg-[#0B0F19] hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h4 className="font-bold text-sm text-white line-clamp-1">{selectedPost.title}</h4>
          <p className="text-xs text-blue-400 font-medium mt-0.5">
            {selectedPost.subject} &bull; {selectedPost.gradeLevel} ({selectedPost.curriculum})
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{selectedPost.areaName}, {selectedPost.district}</span>
          </p>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Budget</span>
              <span className="text-base font-extrabold text-emerald-400">
                ৳ {selectedPost.salaryBudget.toLocaleString()} / mo
              </span>
            </div>

            {appliedPostIds.includes(selectedPost.id) ? (
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                Applied
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onApply(selectedPost);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
