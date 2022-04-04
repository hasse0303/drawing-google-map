import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {

  apiUrl: string = 'http://localhost:3000/overlays';

  constructor(private http: HttpClient) { }

  saveShapes(shape: any): Observable<any> {
    let API_URL = `${this.apiUrl}`;
    return this.http.post(API_URL, shape);
  }

  getAllShape() {
    return this.http.get<any[]>(`${this.apiUrl}`)
  }

  deleteShape(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`)
  }

  updateShape(id: number, shape: any){
    return this.http.put(`${this.apiUrl}/${id}`, shape)
  }
}
