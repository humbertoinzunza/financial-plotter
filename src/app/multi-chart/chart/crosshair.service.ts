import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CrosshairService {
    private _xCoordinate: number = -1;
    public newCoordinate$: Subject<number> = new Subject<number>;
    public get xCoordinate(): number {
        return this._xCoordinate;
    }
    public set xCoordinate(value: number) {
        this._xCoordinate = value;
        this.newCoordinate$.next(this._xCoordinate);
    }
}