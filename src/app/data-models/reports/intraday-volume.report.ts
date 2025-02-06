import { FormControlData } from "../form-control-data.model";
import { Report } from "./report.model";

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
            key: 'days',
            label: 'Days',
            required: true,
            order: 2,
            controlType: 'textbox',
            type: 'number',
            min: 1
        })
    ];
}