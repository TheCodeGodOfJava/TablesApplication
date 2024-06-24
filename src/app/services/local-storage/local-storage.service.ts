import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private appPrefix = 'table-app-';

  setItem(itemName: string, data: string) {
    localStorage.setItem(this.getItemName(itemName), data);
  }

  removeItem(itemName: string) {
    localStorage.removeItem(this.getItemName(itemName));
  }

  getItem(name: string) {
    return localStorage.getItem(this.getItemName(name));
  }

  getItemName(name: string) {
    return `${this.appPrefix}-${name}`;
  }
}
