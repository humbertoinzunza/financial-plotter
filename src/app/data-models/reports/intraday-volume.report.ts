import { FormControlData } from "../form-control-data.model";
import { Report } from "./report.model";
import { ChartData } from "../chart-data.interface";
import { ChartValueType, NumericChartType } from "../charting.enums";

export class IntradayVolume extends Report {
    public override needsTimeframeData: boolean = false;
    public override reportInputs: FormControlData<any>[] = [
        new FormControlData<string>({
            key: 'symbol',
            label: 'Symbol',
            required: true,
            order: 1,
            controlType: 'textbox',
            type: 'text'
        }),
        new FormControlData<number>({
            key: 'daysBack',
            label: 'Days Back',
            required: true,
            order: 2,
            controlType: 'textbox',
            type: 'number',
            min: 1
        }),
        new FormControlData<number>({
            key: 'frequency',
            label: 'Frequency',
            required: true,
            order: 3,
            controlType: 'dropdown',
            options: [
                { key: '1m', value: '1 Min'},
                { key: '2m', value: '2 Min'},
                { key: '3m', value: '3 Min'},
                { key: '4m', value: '4 Min'},
                { key: '5m', value: '5 Min'},
                { key: '10m', value: '10 Min'},
                { key: '15m', value: '15 Min'},
                { key: '20m', value: '20 Min'},
                { key: '30m', value: '30 Min'},
                { key: '1h', value: '1 Hr'},
                { key: '2h', value: '2 Hr'},
                { key: '4h', value: '4 Hr'}
            ]
        })
    ];
    override chartData: ChartData[] = [
        new ChartData({color: '#02D8E9', chartValueType: ChartValueType.Numeric, chartType: NumericChartType.Bar})
    ];
}