import { AxiosRequestConfig } from "axios";

type Subscriber = (error: any, request?: AxiosRequestConfig) => void;

// https://refactoring.guru/design-patterns/observer
class Observer {
    private subscribers: Subscriber[] = [];

    subscribe(subscriber: Subscriber) {
        this.subscribers.push(subscriber);
    }

    unsubscribe(subscriber: Subscriber) {
        this.subscribers = this.subscribers.filter(elem => elem !== subscriber);
    }

    notify(error: any) {
        console.log("notify:\n" + error);
        this.subscribers.forEach(subscriber => {
            subscriber(error)
        });
    }
}

export const observer = new Observer();