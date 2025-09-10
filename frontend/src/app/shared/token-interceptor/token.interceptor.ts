/**
 * @description Questo servizio interecetta le chiamate Http e allega all'header il token di autenticazione
 */

import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { catchError, throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor {
  constructor(private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {

    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          //console.log(err.url);
          if (err.status === 401 || err.status === 403) {
            if (this.router.url === '/') { }
            else {
              localStorage.clear();
              this.router.navigate(['/']);
            }
          }
        }
        return throwError(() => err);
      })
    );
  }
}