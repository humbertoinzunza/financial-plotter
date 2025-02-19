import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CrosshairService {
    private _x: number = -1;
    public newCoordinate$: Subject<number> = new Subject<number>;
    public get x(): number {
        return this.x;
    }
    public set xCoordinate(value: number) {
        this._x = value;
        this.newCoordinate$.next(this._x);
    }
}