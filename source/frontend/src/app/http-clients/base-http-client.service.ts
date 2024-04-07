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
      .get<BaseApiResponse<T>>(fullUrl, {
        headers: fullHeaders,
        params,
      })
      .pipe(map((response: BaseApiResponse<T>) => response?.data));
  }

  post<T>(
    endpointPath: string,
    body?: any,
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
      .post<BaseApiResponse<T>>(fullUrl, body, {
        headers: fullHeaders,
        params,
      })
      .pipe(map((response: BaseApiResponse<T>) => response?.data));
  }

  delete<T>(
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
      .delete<BaseApiResponse<T>>(fullUrl, {
        headers: fullHeaders,
        params,
      })
      .pipe(map((response: BaseApiResponse<T>) => response?.data));
  }

  put<T>(
    endpointPath: string,
    body?: any,
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
      .put<BaseApiResponse<T>>(fullUrl, body, {
        headers: fullHeaders,
        params,
      })
      .pipe(map((response: BaseApiResponse<T>) => response?.data));
  }
}
