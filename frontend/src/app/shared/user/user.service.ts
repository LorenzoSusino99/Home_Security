/**
 * @description Questo servizio fornisce funzioni per la gestione delle chiamate all'API del Backend relative agli utenti del sistema
 */

import { Injectable } from '@angular/core';
import { envirorment } from '../../../envirorment/envirorment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url = envirorment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  signup(data: any) {
    return this.httpClient.post(`${this.url}/user/signup`, data, {
      headers: new HttpHeaders().set('Content-Type', "application/json")
    })
  }
  login(data: any) {
    return this.httpClient.post(`${this.url}/user/login`, data, {
      headers: new HttpHeaders().set('Content-Type', "application/json")
    })
  }
  forgotPassword(data: any) {
    return this.httpClient.post(`${this.url}/user/forgotPassword`, data, {
      headers: new HttpHeaders().set('Content-Type', "application/json")
    })
  }
  checkToken() {
    return this.httpClient.get(`${this.url}/user/checkToken`);
  }
  getProfile() {
    return this.httpClient.get(`${this.url}/user/me`);
  }

  updateProfile(userData: any) {
    return this.httpClient.patch(`${this.url}/user/update`, userData, {
      headers: new HttpHeaders().set('Content-Type', "application/json")
    });
  }

  resetPassword(token: string, newPassword: string) {
    return this.httpClient.post(`${this.url}/user/reset-password`, {
      token,
      newPassword
    }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

}