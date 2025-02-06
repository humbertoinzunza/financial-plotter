export class Column {
    public name: string = "";
    public values: any[];

    constructor(name: string, values: any[] = []) {
        this.name = name;
        this.values = values;
    }


}