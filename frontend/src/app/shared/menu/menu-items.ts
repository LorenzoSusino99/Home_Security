import { Injectable } from "@angular/core";

export interface Menu {
    state: string;
    name: string;
    icon: string;
    role: string;
}

const MENUITEMS = [
    //{ state: 'dashboard', name: 'Dashboard', icon: 'dashboard', role: '' },
    { state: 'house', name: 'Casa', icon: 'home', role: '' },
    { state: 'profile', name: 'Profilo', icon: 'account_box', role: '' },
];

@Injectable()
export class MenuItems {
    getMenuItem(): Menu[] {
        return MENUITEMS;
    }

}