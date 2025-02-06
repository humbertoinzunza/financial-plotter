import { Pipe, PipeTransform } from '@angular/core';
import { BooleanStudyChartType, ConstantStudyChartType, NumericStudyChartType, ParameterType, StudyValueType } from "./charting.enums";
import { Column } from "./column.model";
import { Table } from "./table.model";
import { StudyDto } from '../dtos/studiesDto';

export abstract class Study {
    protected _values: Table = new Table();
    protected _booleanValues: Table = new Table();
    public abstract isLowerStudy: boolean;
    // The data containers for the parameters
    public displace: Parameter = new Parameter(0, new NumericParameterInfo('Displace', true, 0));
    // This is necessary to know how to display the study's parameters to the user
    public abstract parameters: Parameter[];
    // This is necessary to know how to display the chart's parameters to the user
    public abstract chartStyleData: ChartStyleData[];
    public abstract name: string;
    public abstract get fullName(): string;
    public get values(): Table {
        return this._values;
    }
    public set values(value: Table) {
        this._values = value;
        this.updateChartStyleData();
    }
    public set booleanValues(value: Table) {
        this._booleanValues = value;
        this.updateChartStyleData();
    }
    public setValues(studyDto: StudyDto): void{
        console.log(typeof studyDto);
        const columns: Column[] = Array(studyDto.columns.length);
        for (let i = 0; i < columns.length; i++)
            columns[i] = new Column(studyDto.columns[i].name, studyDto.columns[i].values);
        this._values = new Table(columns);
        const booleanColumns: Column[] = Array(studyDto.booleanColumns.length);
        for (let i = 0; i < booleanColumns.length; i++)
            booleanColumns[i] = new Column(studyDto.booleanColumns[i].name, studyDto.booleanColumns[i].values);
        this._booleanValues = new Table(booleanColumns);
        this.updateChartStyleData();
    }
    protected abstract createChartStyleData(): ChartStyleData[];
    protected abstract updateChartStyleData(): void;
    public getMinChartValue(): number {
        let currentMin: number = Number.POSITIVE_INFINITY;
        for (let i = 0; i < this.chartStyleData.length; i++) {
            if (this.chartStyleData[i].studyValueType === StudyValueType.Constant) {
                const value: number = (this.chartStyleData[i].value as Parameter).value;
                currentMin = Math.min(currentMin, value);
            }
            else if (this.chartStyleData[i].studyValueType === StudyValueType.Numeric) {
                const columnValues: any[] = (this.chartStyleData[i].value as Column).values;
                currentMin = Math.min(currentMin, ...columnValues);
                const numericChartType: NumericStudyChartType = this.chartStyleData[i].studyChartType as NumericStudyChartType;
                if (numericChartType === NumericStudyChartType.Bar || numericChartType === NumericStudyChartType.Histogram) {
                    currentMin = Math.min(currentMin, 0);
                }
            }
        }
        return currentMin;
    }
    public getMaxChartValue(): number {
        let currentMax: number = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < this.chartStyleData.length; i++) {
            if (this.chartStyleData[i].studyValueType === StudyValueType.Constant) {
                const value: number = (this.chartStyleData[i].value as Parameter).value;
                currentMax = Math.max(currentMax, value);
            }
            else if (this.chartStyleData[i].studyValueType === StudyValueType.Numeric) {
                const columnValues: any[] = (this.chartStyleData[i].value as Column).values;
                currentMax = Math.max(currentMax, ...columnValues);
            }
        }
        return currentMax;
    }
}

// Used to link the parameter data to the form
export class Parameter {
    constructor(public value: any, public info: ParameterInfo) { }
}
export abstract class ParameterInfo{
    constructor(public name: string, public type: ParameterType) { }
    public get camelCaseName(): string {
        return (this.name[0].toLowerCase() + this.name.slice(1)).split(' ').join('');
    }
}
// Used for both integer and decimal parameters
export class NumericParameterInfo extends ParameterInfo {
    constructor(parameterName: string, isInteger: boolean, public minValue: number, public maxValue: number | null = null) {
        super(parameterName, isInteger ? ParameterType.Integer : ParameterType.Decimal);
    }
}
// Used for enum parameters
export class EnumParameterInfo extends ParameterInfo {
    constructor(parameterName: string, public enumType: object) {
        super(parameterName, ParameterType.Enum);
    }
    public getEnumValues(): any[] {
       return Object.values(this.enumType);
    }
}
// Used for string parameters
export class StringParameterInfo extends ParameterInfo {
    constructor(parameterName: string) {
        super(parameterName, ParameterType.String);
    }
}
export class ChartStyleData {
    constructor(
        public name: string,
        public value: Column | Parameter,
        public color: string,
        public studyValueType: StudyValueType,
        public studyChartType: BooleanStudyChartType | ConstantStudyChartType | NumericStudyChartType,
        public availableChartTypes: object) {};

    public getAvailableChartTypes(): any[] {
        return Object.values(this.availableChartTypes);
    }
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