import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ServerConnectionService {
  constructor(private http: HttpClient) { }

  getRastreamento(objeto: string): Observable<any> {
    return this.http.get('http://' + environment.apiUrl + ':' + environment.apiPort + '/rastrio/tracking=' + objeto);
  }

  getAPIStatus(): Observable<any> {
    return this.http.get('http://' + environment.apiUrl + ':' + environment.apiPort + '/');
  }

  syncFromServer(): Observable<any> {
    return this.http.get('http://' + environment.apiUrl + ':' + environment.apiPort + '/rastrio/syncFromServer');
  }

  syncToServer(listaObj: any): Observable<any> {
    return this.http.post('http://' + environment.apiUrl + ':' + environment.apiPort + '/rastrio/syncToServer', listaObj);
  }
}
