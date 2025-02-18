import { Pipe, PipeTransform } from '@angular/core';
import { NumericChartType, ChartValueType } from "./charting.enums";
import { ChartData, EnumParameterInfo, IChartData, NumericParameterInfo, Parameter, ParameterInfo } from './chart-data.interface';
import { Column } from "./column.model";
import { Table } from "./table.model";
import { StudyDto } from '../dtos/studiesDto';

export abstract class Study implements IChartData {
    protected _values: Table = new Table();
    public abstract isLowerStudy: boolean;
    // The data containers for the parameters
    public displace: Parameter = new Parameter(0, new NumericParameterInfo('Displace', true, 0));
    // This is necessary to know how to display the study's parameters to the user
    public abstract parameters: Parameter[];
    // This is necessary to know how to display the chart's parameters to the user
    abstract chartData: ChartData[];
    public abstract name: string;
    public abstract get fullName(): string;
    public get values(): Table {
        return this._values;
    }
    public set values(value: Table) {
        this._values = value;
        this.updateChartData();
    }
    public setValues(studyDto: StudyDto): void{
        const columns: Column[] = Array(studyDto.columns.length);
        for (let i = 0; i < columns.length; i++)
            columns[i] = new Column(studyDto.columns[i].name, studyDto.columns[i].values);
        this._values = new Table(columns);
        this.updateChartData();
    }
    abstract updateChartData(): void;
}

// Custom pipes to use polymorphism in the HTML template
@Pipe({
  name: 'numericParameterInfoConverter',
  standalone: true
})
export class NumericParameterInfoConverter implements PipeTransform {
  transform(value: ParameterInfo): NumericParameterInfo {
    return value as NumericParameterInfo;
  }
}

@Pipe({
    name: 'enumParameterInfoConverter',
    standalone: true
  })
  export class EnumParameterInfoConverter implements PipeTransform {
    transform(value: ParameterInfo): EnumParameterInfo {
      return value as EnumParameterInfo;
    }
  }