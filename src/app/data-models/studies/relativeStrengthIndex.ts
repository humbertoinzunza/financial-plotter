import { ConstantStudyChartType, NumericStudyChartType, StudyValueType } from "../charting.enums";
import { MarketDataType } from "../market-data.enums";
import { ChartStyleData, EnumParameterInfo, NumericParameterInfo, Parameter, Study } from "../study.model";
import { AverageType } from "./movingAverage";

export class RelativeStrengthIndex extends Study {
    public length: Parameter = new Parameter(14, new NumericParameterInfo('Length', true, 1));
    public averageType: Parameter = new Parameter(AverageType.Wilders, new EnumParameterInfo('Average Type', AverageType));
    public marketDataType: Parameter = new Parameter(MarketDataType.Close, new EnumParameterInfo('Market Data Type', MarketDataType));
    public overboughtLevel: Parameter = new Parameter(70, new NumericParameterInfo('Overbought Level', false, 0, 100));
    public oversoldLevel: Parameter = new Parameter(30, new NumericParameterInfo('Oversold Level', false, 0, 100));
    public override isLowerStudy: boolean = true;
    public override parameters: Parameter[] = [this.length, this.averageType, this.marketDataType, this.overboughtLevel, this.oversoldLevel, this.displace];
    public override chartStyleData: ChartStyleData[] = this.createChartStyleData();
    public override name: string = 'RelativeStrengthIndex';
    public override get fullName(): string {
        return `RelativeStrengthIndex(${this.length.value}, ${this.overboughtLevel.value}, ${this.oversoldLevel.value}, ${this.marketDataType.value},
        ${this.averageType.value}, ${this.displace.value})`;
    }
    
    protected override createChartStyleData(): ChartStyleData[] {
        return  [
            new ChartStyleData('RSI', this._values.columns[0], '#808080', StudyValueType.Numeric, NumericStudyChartType.Line, NumericStudyChartType),
            new ChartStyleData('Overbought', this.overboughtLevel, '#FFFF00', StudyValueType.Constant, ConstantStudyChartType.Line, ConstantStudyChartType),
            new ChartStyleData('Oversold', this.oversoldLevel, '#FFFF00', StudyValueType.Constant, ConstantStudyChartType.Line, ConstantStudyChartType)
        ];
    }
    protected override updateChartStyleData(): void {
        this.chartStyleData[0].value = this._values.columns[0];
    }
}