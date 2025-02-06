import { Component } from "@angular/core";
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from "@angular/material/input"; 
import { FrequencyType, PeriodType } from "../data-models/market-data.enums";
import { MatSelectModule } from "@angular/material/select";
import { AvailableReports } from "../data-models/reports/report.model";
import { Report } from "../data-models/reports/report.model";
import { FormControlComponent } from "../form-control/form-control.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { FormControlData } from "../data-models/form-control-data.model";
import { MatFormFieldModule } from "@angular/material/form-field";
import { getDefaultReport } from "../data-models/reports/report.tools";
import { MatButtonModule } from "@angular/material/button";

@Component({
    imports: [ FormControlComponent, MatButtonModule, MatFormFieldModule, MatInputModule, MatListModule, MatSelectModule, ReactiveFormsModule],
    selector: 'reports-component',
    standalone: true,
    styleUrl: './reports-component.css',
    templateUrl: './reports-component.html'
})
export class ReportsComponent {
    public availableReports: string[] = Object.keys(AvailableReports);
    public selectedReportName: string = this.availableReports[0];
    public periodTypes: string[] = Object.keys(PeriodType);
    public frequencyTypes: string[] = Object.keys(FrequencyType);
    public selectedReport: Report = getDefaultReport(AvailableReports[this.selectedReportName as keyof typeof AvailableReports]);
    public form: FormGroup;
    private currentlySelectedIndex: number = 0;

    constructor() {
        this.form = this.createFormGroup();
    }

    private createFormGroup(): FormGroup {
        // Add the form controls for the timeframe selection
        const group: any = this.selectedReport.needsTimeframeData ?
        {
            period:  new FormControl('', Validators.required),
            periodType:  new FormControl('', Validators.required),
            frequency:  new FormControl('', Validators.required),
            frequencyType:  new FormControl('', Validators.required)
        } : { };
        // Add the form controls for each parameter required for the report
        this.selectedReport.reportInputs.forEach((param: FormControlData<string>) => {
            group[param.key] = param.required ? new FormControl(param.value || '', Validators.required) :
                                new FormControl(param.value || '');
        });
        return new FormGroup(group);
    }

    // When a different report is selected the getDefaultReport() method will get an instance of the report so the
    // form can be rendered appropriately.
    public reportSelected(index: number): void{
        if (this.currentlySelectedIndex == index) return;
        this.currentlySelectedIndex = index;
        this.selectedReportName = this.availableReports[index];
        this.selectedReport = getDefaultReport(AvailableReports[this.selectedReportName as keyof typeof AvailableReports]);
        this.form = this.createFormGroup();
    }
}