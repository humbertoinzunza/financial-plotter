import { FormControlData } from "../form-control-data.model";
import { Table } from "../table.model";

export enum AvailableReports {
    IntradayVolume = 'IntradayVolume',
    PercentChange = 'PercentChange'
}
export abstract class Report {
    public values: Table = new Table();
    public abstract reportInputs: FormControlData<string>[];
}