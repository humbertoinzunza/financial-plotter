import { FormControlData } from "../form-control-data.model"
import { Report } from "./report.model"
import { ChartData } from "../chart-data.interface";
import { ChartValueType, NumericChartType } from "../charting.enums";

export class PercentChangeReport extends Report {
    public override needsTimeframeData: boolean = true;
    public override reportInputs: FormControlData<any>[] = [
        new FormControlData({
            key: 'symbol',
            label: 'Symbol',
            required: true,
            order: 1,
            controlType: 'textbox',
            type: 'text'
        }),
        new FormControlData({
            key: 'analysisType',
            label: 'Analysis Type',
            required: true,
            order: 2,
            controlType: 'radio',
            options: [
                { key: 'openToClose', value: 'Open to Close' },
                { key: 'prevCloseToOpen', value: 'Previous Close to Open' },
                { key: 'prevCloseToClose', value: 'Previous Close to Close' }
            ]
        })
    ];
    override chartData: ChartData[] = [
        new ChartData({color: '#02D8E9', chartValueType: ChartValueType.Numeric, chartType: NumericChartType.Histogram})
    ];
}