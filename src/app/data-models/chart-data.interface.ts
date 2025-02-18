import { BooleanChartType, ChartValueType, ConstantChartType, NumericChartType, ParameterType } from "./charting.enums";
import { Column } from "./column.model";

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
export class ChartData {
    public name: string;
    public xValues: Column | null;
    private _yValues: Column | Parameter;
    public minValue: number;
    public maxValue: number;
    public color: string;
    public chartValueType: ChartValueType;
    public studyChartType: BooleanChartType | ConstantChartType | NumericChartType;
    public availableChartTypes: object | undefined;

    constructor(options: {
        name?: string,
        xValues?: Column,
        yValues?: Column | Parameter,
        color: string,
        chartValueType: ChartValueType,
        chartType: BooleanChartType | ConstantChartType | NumericChartType,
        availableChartTypes?: object
    }) {
        this.name = options.name || '';
        this.xValues = options.xValues || new Column();
        this._yValues = options.yValues || new Column();
        this.color = options.color;
        this.chartValueType = options.chartValueType;
        this.studyChartType = options.chartType;
        this.availableChartTypes = options.availableChartTypes;
        if (this._yValues instanceof Column && (this._yValues as Column).values.length > 0) {
            const yValuesColumn: Column = this._yValues as Column;
            this.maxValue = Math.max(...yValuesColumn.values);
            this.minValue = Math.min(...yValuesColumn.values);
        }
        else {
            this.maxValue = 0;
            this.minValue = 0;
        }
    };

    set yValues(value: Column | Parameter) {
        this._yValues = value;
        if (this._yValues instanceof Column && (this._yValues as Column).values.length > 0) {
            const yValuesColumn: Column = this._yValues as Column;
            this.maxValue = Math.max(...yValuesColumn.values);
            this.minValue = Math.min(...yValuesColumn.values);
        }
        else {
            this.maxValue = 0;
            this.minValue = 0;
        }
    }
    get yValues(): Column | Parameter {
        return this._yValues;
    }

    public getAvailableChartTypes(): any[] {
        if (this.availableChartTypes)
            return Object.values(this.availableChartTypes);
        throw new Error("Error: The are no available chart types to in this instance of ChartData.");
    }
}

export interface IChartData {
    chartData: ChartData[];
    updateChartData(): void;
}