import { DaysInARowReport } from "./days-in-a-row.report";
import { IntradayVolume } from "./intraday-volume.report";
import { PercentChangeReport } from "./percent-change.report";
import { AvailableReports, Report } from "./report.model";

export function getDefaultReport(reportType: AvailableReports): Report{
        switch(reportType) {
            case AvailableReports.DaysInARow:
                return new DaysInARowReport();
            case AvailableReports.IntradayVolume:
                return new IntradayVolume();
            case AvailableReports.PercentChange:
                return new PercentChangeReport();
            default:
                throw new Error(`The report ${reportType} has not been implemented.`);
        }
}