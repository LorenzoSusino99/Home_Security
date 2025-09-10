import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxUiLoaderModule, NgxUiLoaderConfig, SPINNER, PB_DIRECTION } from 'ngx-ui-loader';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withInterceptors } from '@angular/common/http';
import { TokenInterceptor } from './shared/token-interceptor/token.interceptor';
import { MenuItems } from './shared/menu/menu-items';
import { provideNativeDateAdapter } from '@angular/material/core';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  text: "Caricamento...",
  textColor: "#FFFFFF",
  pbColor: "blue",
  bgsColor: "blue",
  fgsColor: "blue",
  fgsType: SPINNER.ballSpinClockwise,
  fgsSize: 100,
  pbDirection: PB_DIRECTION.leftToRight,
  pbThickness: 5
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), provideAnimationsAsync(), provideNativeDateAdapter(),
  provideHttpClient(
    withInterceptorsFromDi(),
  ),
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  },
    MenuItems,
  importProvidersFrom(NgxUiLoaderModule.forRoot(ngxUiLoaderConfig))]
};