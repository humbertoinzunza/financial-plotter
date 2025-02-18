import { ConstantChartType, NumericChartType, ChartValueType } from "../charting.enums";
import { MarketDataType } from "../market-data.enums";
import { Study } from "../study.model";
import { ChartData, EnumParameterInfo, NumericParameterInfo, Parameter, ParameterInfo } from "../chart-data.interface";
import { AverageType } from "./movingAverage";

export class RelativeStrengthIndex extends Study {
    public length: Parameter = new Parameter(14, new NumericParameterInfo('Length', true, 1));
    public averageType: Parameter = new Parameter(AverageType.Wilders, new EnumParameterInfo('Average Type', AverageType));
    public marketDataType: Parameter = new Parameter(MarketDataType.Close, new EnumParameterInfo('Market Data Type', MarketDataType));
    public overboughtLevel: Parameter = new Parameter(70, new NumericParameterInfo('Overbought Level', false, 0, 100));
    public oversoldLevel: Parameter = new Parameter(30, new NumericParameterInfo('Oversold Level', false, 0, 100));
    public override isLowerStudy: boolean = true;
    public override parameters: Parameter[] = [this.length, this.averageType, this.marketDataType, this.overboughtLevel, this.oversoldLevel, this.displace];
    public override name: string = 'RelativeStrengthIndex';
    public override get fullName(): string {
        return `RelativeStrengthIndex(${this.length.value}, ${this.overboughtLevel.value}, ${this.oversoldLevel.value}, ${this.marketDataType.value},
        ${this.averageType.value}, ${this.displace.value})`;
    }
    override chartData: ChartData[] =  [
        new ChartData({name: 'RSI', color: '#808080', chartValueType: ChartValueType.Numeric, 
            chartType: NumericChartType.Line, availableChartTypes: NumericChartType}),
        new ChartData({name: 'Overbought', yValues: new Parameter(70, new NumericParameterInfo('Overbought Level', false, 0, 100)),
            color: '#FFFF00', chartValueType: ChartValueType.Constant, chartType: ConstantChartType.Line, availableChartTypes: ConstantChartType}),
        new ChartData({name: 'Oversold', yValues: new Parameter(30, new NumericParameterInfo('Overbought Level', false, 0, 100)),
            color: '#FFFF00', chartValueType: ChartValueType.Constant, chartType: ConstantChartType.Line, availableChartTypes: ConstantChartType})
    ];
    override updateChartData(): void {
        this.chartData[0].yValues = this._values.columns[0];
    }
}