import { NumericStudyChartType, StudyValueType } from "../charting.enums";
import { MarketDataType } from "../market-data.enums";
import { ChartStyleData, EnumParameterInfo, NumericParameterInfo, Parameter, Study } from "../study.model";

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
    public override chartStyleData: ChartStyleData[] = this.createChartStyleData();
    public override name: string = 'MovingAverage';
    public override get fullName(): string {
        return `MovingAverage(${this.length.value}, ${this.averageType.value}, ${this.marketDataType.value}, ${this.displace.value})`;
    }
    protected override createChartStyleData(): ChartStyleData[] {
        return  [
            new ChartStyleData('MovingAverage', this._values.columns[0], '#FFFF00', StudyValueType.Numeric, NumericStudyChartType.Line, NumericStudyChartType)
        ];
    }
    protected override updateChartStyleData(): void {
        this.chartStyleData[0].value = this._values.columns[0];
    }
}