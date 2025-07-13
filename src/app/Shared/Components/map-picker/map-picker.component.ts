import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

interface MapStyle {
  name: string;
  url: string;
  attribution: string;
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-picker.component.html',
  styleUrls: ['./map-picker.component.css'],
})
export class MapPickerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  @Input() latitude: number = 30.0444; // Default to Cairo
  @Input() longitude: number = 31.2357;
  @Input() height: string = '500px'; // Increased default height
  @Input() width: string = '100%';
  @Input() readonly: boolean = false;

  @Output() locationSelected = new EventEmitter<{ lat: number; lng: number }>();

  private map!: L.Map;
  private marker!: L.Marker;
  private isInitialized = false;
  private mapInitialized = false;
  private currentTileLayer!: L.TileLayer;

  // Available map styles
  mapStyles: MapStyle[] = [
    {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
    },
    {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri, Maxar, Earthstar Geographics',
    },
    {
      name: 'Terrain',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap contributors',
    },
    {
      name: 'Streets',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '© OpenStreetMap contributors, © CartoDB',
    },
  ];

  selectedMapStyle: MapStyle = this.mapStyles[0];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Don't initialize map here, wait for AfterViewInit
  }

  ngAfterViewInit() {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeMap();
    }, 100);

    // Handle window resize for responsive design
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
    // Remove resize listener
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize() {
    if (this.map && this.mapInitialized) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }
  }

  private initializeMap() {
    if (this.mapInitialized) return;

    try {
      // Create map with better configuration
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [this.latitude, this.longitude],
        zoom: 15, // Closer zoom for better precision
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true,
        attributionControl: true,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
      });

      // Add initial map tiles
      this.addTileLayer(this.selectedMapStyle);

      // Create a custom marker icon for better visibility
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-pin"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      // Add marker with custom icon
      this.marker = L.marker([this.latitude, this.longitude], {
        draggable: !this.readonly,
        icon: customIcon,
        zIndexOffset: 1000,
      }).addTo(this.map);

      // Handle marker drag events
      if (!this.readonly) {
        this.marker.on('dragstart', () => {
          this.marker.getElement()?.classList.add('dragging');
        });

        this.marker.on('dragend', (event) => {
          this.marker.getElement()?.classList.remove('dragging');
          const position = event.target.getLatLng();
          this.latitude = position.lat;
          this.longitude = position.lng;
          this.locationSelected.emit({
            lat: this.latitude,
            lng: this.longitude,
          });
          this.cdr.detectChanges();
        });

        // Handle map click events with better UX
        this.map.on('click', (event) => {
          const position = event.latlng;
          this.marker.setLatLng(position);
          this.latitude = position.lat;
          this.longitude = position.lng;
          this.locationSelected.emit({
            lat: this.latitude,
            lng: this.longitude,
          });
          this.cdr.detectChanges();
        });

        // Add a popup to guide users
        this.marker
          .bindPopup(
            '<div class="marker-popup">' +
              '<strong>Masjid Location</strong><br>' +
              'Drag this marker or click on the map to set the location' +
              '</div>',
            { closeButton: false }
          )
          .openPopup();
      }

      // Force map to refresh after initialization
      setTimeout(() => {
        this.map.invalidateSize();
        this.mapInitialized = true;
        this.isInitialized = true;
        this.cdr.detectChanges();
      }, 200);
    } catch (error) {
      console.error('Error initializing map:', error);
      // Fallback to basic map if there's an error
      this.initializeFallbackMap();
    }
  }

  private addTileLayer(style: MapStyle) {
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    this.currentTileLayer = L.tileLayer(style.url, {
      attribution: style.attribution,
      subdomains: 'abc',
      maxZoom: 19,
      minZoom: 3,
    }).addTo(this.map);
  }

  onMapStyleChange(style: MapStyle) {
    this.selectedMapStyle = style;
    this.addTileLayer(style);
  }

  private initializeFallbackMap() {
    try {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [this.latitude, this.longitude],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      this.marker = L.marker([this.latitude, this.longitude], {
        draggable: !this.readonly,
      }).addTo(this.map);

      if (!this.readonly) {
        this.marker.on('dragend', (event) => {
          const position = event.target.getLatLng();
          this.latitude = position.lat;
          this.longitude = position.lng;
          this.locationSelected.emit({
            lat: this.latitude,
            lng: this.longitude,
          });
        });

        this.map.on('click', (event) => {
          const position = event.latlng;
          this.marker.setLatLng(position);
          this.latitude = position.lat;
          this.longitude = position.lng;
          this.locationSelected.emit({
            lat: this.latitude,
            lng: this.longitude,
          });
        });
      }

      setTimeout(() => {
        this.map.invalidateSize();
        this.mapInitialized = true;
        this.isInitialized = true;
        this.cdr.detectChanges();
      }, 200);
    } catch (error) {
      console.error('Error initializing fallback map:', error);
    }
  }

  // Method to update marker position programmatically
  updateLocation(lat: number, lng: number) {
    if (this.isInitialized) {
      this.latitude = lat;
      this.longitude = lng;
      this.marker.setLatLng([lat, lng]);
      this.map.setView([lat, lng], this.map.getZoom());
      this.cdr.detectChanges();
    }
  }

  // Method to get current coordinates
  getCurrentLocation(): { lat: number; lng: number } {
    return { lat: this.latitude, lng: this.longitude };
  }

  // Method to refresh map (useful for responsive design)
  refreshMap() {
    if (this.map && this.mapInitialized) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    }
  }
}
