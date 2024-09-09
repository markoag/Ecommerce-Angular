import { HttpClient } from '@angular/common/http';
import { Injectable, afterNextRender } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import { URL_SERVICIOS } from '../../../config/config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  token: string = '';
  private userSubject: BehaviorSubject<any>;
  public user: Observable<any>;

  constructor(public http: HttpClient, public router: Router) {
    this.userSubject = new BehaviorSubject<any>(null);
    this.user = this.userSubject.asObservable();

    afterNextRender(() => {
      this.initAuth();
    });
  }

  initAuth() {
    if (localStorage.getItem('token')) {
      this.token = localStorage.getItem('token') || '';
      const user = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') ?? '')
        : {};
      this.userSubject.next(user);
    }
  }

  login(email: string, password: string) {
    let URL = URL_SERVICIOS + '/auth/login_ecommerce';
    return this.http.post(URL, { email, password }).pipe(
      map((resp: any) => {
        console.log(resp);
        const result = this.saveLocalStorage(resp);
        return result;
      }),
      catchError((err: any) => {
        console.log(err);
        return of(err);
      })
    );
  }

  saveLocalStorage(resp: any) {
    if (resp?.access_token) {
      localStorage.setItem('token', resp.access_token);
      localStorage.setItem('user', JSON.stringify(resp?.user));
      this.userSubject.next(resp?.user);
      return true;
    }
    return false;
  }

  register(data: any) {
    let URL = URL_SERVICIOS + '/auth/register';
    return this.http.post(URL, data);
  }

  verifiedAuth(data: any) {
    let URL = URL_SERVICIOS + '/auth/verified_auth';
    return this.http.post(URL, data);
  }

  verifiedMail(data: any) {
    let URL = URL_SERVICIOS + '/auth/verified_email';
    return this.http.post(URL, data);
  }

  verifiedCode(data: any) {
    let URL = URL_SERVICIOS + '/auth/verified_code';
    return this.http.post(URL, data);
  }

  verifiedNewPass(data: any) {
    let URL = URL_SERVICIOS + '/auth/new_password';
    return this.http.post(URL, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token = '';
    this.userSubject.next(null);

    setTimeout(() => {
      this.router.navigateByUrl('/login');
    }, 500);
  }
}
