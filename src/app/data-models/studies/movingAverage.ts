import { NumericChartType, ChartValueType } from "../charting.enums";
import { MarketDataType } from "../market-data.enums";
import { Study } from "../study.model";
import { ChartData, EnumParameterInfo, NumericParameterInfo, Parameter } from "../chart-data.interface";

export enum AverageType {
    Exponential = 'Exponential',
    Hull = 'Hull',
    Simple = 'Simple',
    Weighted = 'Weighted',
    Wilders = 'Wilders'
}

export class MovingAverage extends Study {
    public length: Parameter = new Parameter(9, new NumericParameterInfo('Length', true, 1));
    public averageType: Parameter = new Parameter(AverageType.Simple, new EnumParameterInfo('Average Type', AverageType));
    public marketDataType: Parameter = new Parameter(MarketDataType.Close, new EnumParameterInfo('Market Data Type', MarketDataType));
    public override isLowerStudy: boolean = false;
    public override parameters: Parameter[] = [this.length, this.averageType, this.marketDataType, this.displace];
    public override name: string = 'MovingAverage';
    public override get fullName(): string {
        return `MovingAverage(${this.length.value}, ${this.averageType.value}, ${this.marketDataType.value}, ${this.displace.value})`;
    }
    override chartData: ChartData[] = [
        new ChartData({name: 'MovingAverage', color: '#FFFF00', chartValueType: ChartValueType.Numeric, chartType: NumericChartType.Line, availableChartTypes: NumericChartType})
    ];
    override updateChartData(): void {
        this.chartData[0].yValues = this._values.columns[0];
    }
}