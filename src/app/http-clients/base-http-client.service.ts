import { environment } from '@environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { BaseApiResponse } from '@models/base.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BaseHttpClientService {
  private readonly baseUrl = environment.baseApiUri;
  private readonly defaultHeaders = {
    'Content-Type': 'application/json'
  }

  constructor(private httpClient: HttpClient) {}

  get<T>(
    endpointPath: string,
    params?:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        },
    headers?: {
          [header: string]: string | string[];
      }
  ): Observable<T> {
    const fullUrl = `${this.baseUrl}/${endpointPath}`;
    const fullHeaders = headers ? {...this.defaultHeaders, ...headers} : this.defaultHeaders
    
    return this.httpClient
      .get<BaseApiResponse>(fullUrl, {
        headers: fullHeaders,
        params,
      })
      .pipe(map((response: BaseApiResponse) => response.data));
  }
}
