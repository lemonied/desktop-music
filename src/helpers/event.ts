import { Observable } from 'rxjs';

interface Callback {
  (...args: any): void;
}
interface Listeners {
  [prop: string]: Callback[];
}

export class EventManager {
  private listeners: Listeners;

  constructor() {
    this.listeners = {};
  }

  off = (eventName?: string, callback?: Callback) => {
    if (!eventName) {
      this.listeners = {};
    } else if (!callback) {
      this.listeners[eventName] = [];
    } else {
      for (let i = 0; i < this.listeners[eventName].length; i++) {
        if (this.listeners[eventName][i] === callback) {
          this.listeners[eventName].splice(i, 1);
          break;
        }
      }
    }
  }
  on = (eventName: string, callback: Callback) => {
    if (this.listeners[eventName]) {
      this.listeners[eventName].push(callback);
    } else {
      this.listeners[eventName] = [callback];
    }
    return (): void => {
      this.off(eventName, callback);
    };
  }
  emit = (eventName: string, ...args: any[]) => {
    this.listeners[eventName]?.forEach(item => {
      item(...args);
    });
  }
  observe = (eventName: string): Observable<any> => {
    return new Observable((observer) => {
      const off = this.on(eventName, (...args) => {
        observer.next(...args);
      });
      return {
        unsubscribe(): void {
          off();
        }
      };
    });
  }
}

export const globalEvent = new EventManager();
