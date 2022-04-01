import { Component, OnInit, ViewChild } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'google-map-draw';

  map!: google.maps.Map;
  @ViewChild('googleMap', {static: true}) googleMap!: any;
  all_overlay: any[] = [];
  overlay: any;
  selectedShape: any;

  ngOnInit(): void {
      this.initMap();
      this.drawShape();
      this.createSymbolAndPolyline()
  }
  initMap() {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: { lat: 10.650070644094976, lng: 103.52405604576701},
        zoom: 12
      }
    )
    const clearBtn = document.getElementById('clear')
    this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(clearBtn)
  }

  drawShape() {
    var drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.MARKER,
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.RECTANGLE,
          google.maps.drawing.OverlayType.POLYLINE
        ]
      },
      markerOptions: {
        icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
        draggable: true
      },
      circleOptions: {
        fillColor: '#3d3d3d',
        strokeWeight: 2,
        fillOpacity: 0.5,
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1
      },
      polygonOptions: {
        clickable: true,
        editable: true,
        draggable: true,
        fillOpacity: 0.2,
        fillColor: '#3d3d3d',
      },
      rectangleOptions: {
        clickable: true,
        editable: true,
        draggable: true,
        fillColor: '#3d3d3d',
        fillOpacity: 0.2
      },
      polylineOptions: {
        clickable: true,
        editable: true,
        strokeWeight: 2,
        draggable: true
      }
    });
    drawingManager.setMap(this.map)
    google.maps.event.addListener(drawingManager, 'polygoncomplete', function(event: any) {

      event.getPath().getLength();
      google.maps.event.addListener(event.getPath(), 'insert_at', function() {

        var len = event.getPath().getLength();
        for (var i = 0; i < len; i++) {
          // console.log(event.getPath().getAt(i).toUrlValue(5));
        }
      });
      google.maps.event.addListener(event.getPath(), 'set_at', function() {
        var len = event.getPath().getLength();
          for (var i = 0; i < len; i++) {
              // console.log(event.getPath().getAt(i).toUrlValue(5));
          }
      });
  });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {

      this.all_overlay.push(event);
      if ( event.type !== google.maps.drawing.OverlayType.MARKER) {
        drawingManager.setDrawingMode(null);
        //select the newly selected object

        var newShape = event.overlay;
        newShape.type = event.type;
        google.maps.event.addListener(newShape, 'click', () => {
          this.setSelection(newShape)
        })
        this.setSelection(newShape)
      }

    })

  }

  clearSelection() {
    if(this.selectedShape) {
      this.selectedShape.setEditable(false)
      this.selectedShape = null
    }
  }

  setSelection(shape: any) {
    this.clearSelection();
    this.selectedShape = shape;
    shape.setEditable(true)
    console.log(this.selectedShape);
    const center = this.selectedShape.getMap();
    console.log(center);

  }

  deleteSelectedShape() {
    if(this.selectedShape) {
      this.selectedShape.setMap(null)
    }
  }

  createSymbolAndPolyline() {
    const lineSymbol: google.maps.Symbol = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 3,
      strokeColor: '#393'
    }
    //create polyline
    const line = new google.maps.Polyline({
      path: [
        {lat: 10.663647635748918, lng: 103.50049069112644},
        {lat: 10.658755387679808, lng: 103.50383808797703},
        {lat: 10.660104981208208, lng: 103.51207783407078},
        {lat: 10.660358029328648, lng: 103.51679852193699},
        {lat: 10.655297026955814, lng: 103.5131078023325},
        {lat: 10.654369167396075, lng: 103.5046963948618},
        {lat: 10.65361000747186, lng: 103.49894573873387},
        {lat: 10.661707615751283, lng: 103.49619915670262},
        {lat: 10.663647635748918, lng: 103.50049069112644}
      ],
      icons: [
        {
          icon: lineSymbol,
          offset: '100%'
        }
      ],
      strokeWeight: 0.1,
      map: this.map
    });
    this.animationSymbol(line)
  }

  animationSymbol(line: google.maps.Polyline) {
    let count = 0;

    setInterval(() => {
      count = (count + 1) % 200;

      const icons = line.get('icons');

      icons[0].offset = count / 2 + '%';
      line.set('icons', icons)
    }, 200)
  }
}
