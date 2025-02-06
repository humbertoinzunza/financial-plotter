import { Column } from "./column.model";

export class Table {
    public columns: Column[];

    constructor(columns: Column[] = []) {
        this.columns = columns;
        for (let i = 1; i < columns.length; i++) {
            if (columns[i].values.length != columns[i - 1].values.length)
                throw new Error("Error: Tables with different-sized columns are not allowed.");
        }
    }

    get length(): number {
        if (this.columns.length == 0) return 0;
        return this.columns[0].values.length;
    }
}