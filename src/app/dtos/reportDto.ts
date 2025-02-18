import { ColumnDto } from "./column.dto";

export class ReportDto {
    constructor(public symbolFound: boolean, public dataFound: boolean, public columns: ColumnDto[]) { }
}