import { environment } from '@environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { BaseApiResponse } from '@models/base.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface Endpoint {
  type: 'GET' | 'POST' | 'DELETE' | 'PUT'
  path: string
}

@Injectable({
  providedIn: 'root'
})
export class BaseHttpClientService {
  private readonly baseUrl = environment.baseApiUri;
  private readonly mockServerBaseUrl = environment.mockServerUri;
  private readonly defaultHeaders = {
    'Content-Type': 'application/json'
  }

  public migratedEndpoints: Endpoint[] = [];

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
    const fullUrl = this.getFullEndpointUrl('GET', endpointPath);
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
    const fullUrl = this.getFullEndpointUrl('POST', endpointPath);
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
    const fullUrl = this.getFullEndpointUrl('DELETE', endpointPath);
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
    const fullUrl = this.getFullEndpointUrl('PUT', endpointPath);
    const fullHeaders = headers ? {...this.defaultHeaders, ...headers} : this.defaultHeaders

    return this.httpClient
      .put<BaseApiResponse<T>>(fullUrl, body, {
        headers: fullHeaders,
        params,
      })
      .pipe(map((response: BaseApiResponse<T>) => response?.data));
  }

  getFullEndpointUrl(type: string, path: string) {
    const isEndpointMigrated = this.migratedEndpoints.find((e) => e.path === path && e.type === type) != null;
    return `${isEndpointMigrated ? this.baseUrl : this.mockServerBaseUrl}/${path}`;
  }
}
