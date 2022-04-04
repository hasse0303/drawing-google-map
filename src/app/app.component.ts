import { Component, OnInit, ViewChild } from '@angular/core';
import { OverlayService } from './overlay.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'google-map-draw';

  map!: google.maps.Map;
  @ViewChild('googleMap', {static: true}) googleMap!: any;
  all_overlay:any[] = [];
  overlay: any;
  selectedShape: any;
  polygonPaths: any [] = [];
  selectedShapeId: number | any;
  polylinePaths: any[] = [];

  constructor(private overlayService: OverlayService) {}

  ngOnInit(): void {
      this.initMap();
      this.getAllOverlay()
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
  getAllOverlay() {
    this.overlayService.getAllShape().subscribe((res: any[]) => {
      this.all_overlay = res;
      if(this.all_overlay) {
        for (let overlay of this.all_overlay){
          const polygon = new google.maps.Polygon({
            paths: overlay.paths,
            editable: overlay.editable,
            draggable: overlay.draggable,
            fillOpacity: overlay.fillOpacity,
            fillColor: overlay.fillColor,
            clickable: overlay.clickable,
            zIndex: overlay.zIndex
          })
          polygon.setMap(this.map)
          const rectangle = new google.maps.Rectangle({
            bounds: overlay.bounds,
            editable: overlay.editable,
            draggable: overlay.draggable,
            fillOpacity: overlay.fillOpacity,
            fillColor: overlay.fillColor,
            clickable: overlay.clickable,
            zIndex: overlay.zIndex
          })
          rectangle.setMap(this.map)
          const circle = new google.maps.Circle({
            radius: overlay.radius,
            center: overlay.center,
            editable: overlay.editable,
            draggable: overlay.draggable,
            fillOpacity: overlay.fillOpacity,
            fillColor: overlay.fillColor,
            clickable: overlay.clickable,
            zIndex: overlay.zIndex
          })
          circle.setMap(this.map)
          const polyline = new google.maps.Polyline({
            editable: overlay.editable,
            draggable: overlay.draggable,
            clickable: overlay.clickable,
            zIndex: overlay.zIndex,
            strokeWeight: overlay.strokeWeight,
            path: overlay.paths
          })
          polyline.setMap(this.map)
          this.addListenerOnPolygon(polygon, overlay.id)
          this.addListenerOnPolygon(rectangle, overlay.id)
          this.addListenerOnPolygon(circle, overlay.id)
          this.addListenerOnPolygon(polyline, overlay.id)
        }
      }
    })

  }

  addListenerOnPolygon(polygon: any, id:number) {
    google.maps.event.addListener(polygon, 'click', (event: any) => {
      this.setSelection(polygon, id)
    })
  }

  drawShape() {
    var drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
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
          // console.log(event.getPath().getAt(i).toJSON());
        }
      });
      google.maps.event.addListener(event.getPath(), 'set_at', function() {
        var len = event.getPath().getLength();
          for (var i = 0; i < len; i++) {
              const latLngs = {lat: event.getPath().getAt(i).lat() , lng: event.getPath().getAt(i).lng()};
              console.log(latLngs);

          }
      });
  });

    google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
      if ( event.type !== google.maps.drawing.OverlayType.MARKER) {
        this.saveShape(event);

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

  saveShape(event: any) {
    if(event.type === google.maps.drawing.OverlayType.POLYGON){
      this.savePolygon(event);
      return;
    }
    if(event.type === google.maps.drawing.OverlayType.RECTANGLE){
      this.saveRectangle(event);
      return;
    }
    if(event.type === google.maps.drawing.OverlayType.CIRCLE){
      this.saveCircle(event);
      return;
    }
    if(event.type === google.maps.drawing.OverlayType.POLYLINE){
      this.savePolyline(event);
      return;
    }

  }

  savePolygon(event: any){
    var len = event.overlay.getPath().getLength();
        for (var i = 0; i < len; i++) {
          const latLngs = {lat: event.overlay.getPath().getAt(i).lat(), lng: event.overlay.getPath().getAt(i).lng()}
          this.polygonPaths.push(latLngs);
        }
        const newPolygon = {
          paths: this.polygonPaths,
          clickable: event.overlay.clickable,
          draggable: event.overlay.draggable,
          editable: event.overlay.editable,
          fillColor: event.overlay.fillColor,
          fillOpacity: event.overlay.fillOpacity,
          zIndex: event.overlay.zIndex,
          type: event.type
        }
        this.overlayService.saveShapes(newPolygon).subscribe();
  }
  saveRectangle(event: any){
    const bound = event.overlay.getBounds();
    const bounds: google.maps.LatLngBoundsLiteral = {
      north: bound.zb.j,
      south: bound.zb.h,
      east: bound.Ua.j,
      west: bound.Ua.h
    }
    const newRectangle = {
      clickable: event.overlay.clickable,
      draggable: event.overlay.draggable,
      editable: event.overlay.editable,
      fillColor: event.overlay.fillColor,
      fillOpacity: event.overlay.fillOpacity,
      zIndex: event.overlay.zIndex,
      bounds,
      type: event.type
    }
    this.overlayService.saveShapes(newRectangle).subscribe();
  }
  saveCircle(event: any) {
    const newCircle = {
      clickable: event.overlay.clickable,
      draggable: event.overlay.draggable,
      editable: event.overlay.editable,
      fillColor: event.overlay.fillColor,
      fillOpacity: event.overlay.fillOpacity,
      zIndex: event.overlay.zIndex,
      center: event.overlay.center.toJSON(),
      radius: event.overlay.getRadius(),
      type: event.type
    }
    this.overlayService.saveShapes(newCircle).subscribe()


  }
  savePolyline(event: any) {
    var len = event.overlay.getPath().getLength();
    for (var i = 0; i < len; i++) {
      const latLngs = {lat: event.overlay.getPath().getAt(i).lat(), lng: event.overlay.getPath().getAt(i).lng()}
      this.polylinePaths.push(latLngs);
      const newPolyline = {
        clickable: event.overlay.clickable,
        draggable: event.overlay.draggable,
        editable: event.overlay.editable,
        strokeWeight: event.overlay.strokeWeight,
        paths: this.polylinePaths,
        type: event.type
      }
      this.overlayService.saveShapes(newPolyline).subscribe()
    }

  }
  clearSelection() {
    if(this.selectedShape) {
      this.selectedShape.setEditable(false)
      this.selectedShape = null
    }
  }

  setSelection(shape: any, id?: number) {
    this.clearSelection();
    this.selectedShape = shape;
    this.selectedShapeId = id;
    shape.setEditable(true)
  }

  deleteSelectedShape() {
    if(this.selectedShape) {
      if(confirm('Are you sure to delete this shape?')) {
        this.overlayService.deleteShape(this.selectedShapeId).subscribe()
        this.selectedShape.setMap(null)
      }
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
