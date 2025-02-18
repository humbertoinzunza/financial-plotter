import { ReportDto } from "../../dtos/reportDto";
import { ChartData, IChartData } from "../chart-data.interface";
import { Column } from "../column.model";
import { FormControlData } from "../form-control-data.model";
import { Table } from "../table.model";
import { ColumnDto } from "../../dtos/column.dto";

export enum AvailableReports {
    DaysInARow = 'DaysInARow',
    IntradayVolume = 'IntradayVolume',
    PercentChange = 'PercentChange'
}
export abstract class Report implements IChartData {
    public values: Table = new Table();
    public get columnTableNames(): string[] {
        return this.values.columns.map((column: Column) => this.camelCaseName(column.name));
    }
    public abstract reportInputs: FormControlData<any>[];
    public abstract needsTimeframeData: boolean;
    abstract chartData: ChartData[];
    public setValues(reportDto: ReportDto): void {
        this.values = new Table();
        // Set the columns in order, because the first one must be the x-axis
        for (let i = 0; i < reportDto.columns.length; i++) {
            const currentColumn: ColumnDto = reportDto.columns[i];
            this.values.columns.push(new Column(
                currentColumn.name,
                currentColumn.values
            ));
        }
        this.updateChartData();
    }
    updateChartData(): void {
        for (let i = 0; i <  this.values.columns.length - 1; i++) {
            // i + 1 to skip the first column because it is the x-axis
            this.chartData[i].name = this.values.columns[i + 1].name;
            // x-axis is always the first column
            this.chartData[i].xValues = this.values.columns[0];
            this.chartData[i].yValues = this.values.columns[i + 1];
        }
    }
    private camelCaseName(name: string): string {
        return name.split(' ').map((value: string, index: number) => {
            if (index == 0) return value.toLowerCase();
            else {
                const temp: string = value.toLowerCase();
                return temp[0].toUpperCase() + temp.slice(1);
            }
        }).join('');
    }
}