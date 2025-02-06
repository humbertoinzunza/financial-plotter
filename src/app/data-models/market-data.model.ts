import { Candle } from "./candle.model";
import { Column } from "./column.model";
import { Table } from "./table.model";

export class MarketData {
    private table: Table = new Table([
        new Column("Open"),
        new Column("High"),
        new Column("Low"),
        new Column("Close"),
        new Column("Volume"),
        new Column("Datetime")
    ]);

    constructor(candles: Candle[] = []) {
        for (let i = 0; i < this.table.columns.length; i++) {
            this.table.columns[i].values = new Array(candles.length);
        }
        for(let i = 0; i < candles.length; i++) {
            this.open.values[i] = candles[i].open;
            this.high.values[i] = candles[i].high;
            this.low.values[i] = candles[i].low;
            this.close.values[i] = candles[i].close;
            this.volume.values[i] = candles[i].volume;
            this.datetime.values[i] = candles[i].datetime;
        }
    }

    get open(): Column {
        return this.table.columns[0];
    }
    get high(): Column {
        return this.table.columns[1];
    }
    get low(): Column {
        return this.table.columns[2];
    }
    get close(): Column {
        return this.table.columns[3];
    }
    get volume(): Column {
        return this.table.columns[4];
    }
    get datetime(): Column {
        return this.table.columns[5];
    }
    get length(): number {
        return this.table.length;
    }
}