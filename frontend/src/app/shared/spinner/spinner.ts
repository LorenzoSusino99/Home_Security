/**
 * @description Questo modulo permette l'implementazione di uno spinner di caricamento di terze parti
 */

import { NgModule } from '@angular/core';
import { NgxUiLoaderModule, NgxUiLoaderConfig, SPINNER, PB_DIRECTION } from 'ngx-ui-loader';

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

@NgModule({
    imports: [
        NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)
    ],
    exports: [
        NgxUiLoaderModule
    ]
})
export class SpinnerModule { }