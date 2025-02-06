import { Component, QueryList, ViewChildren } from "@angular/core";
import { MatListItem, MatListModule } from '@angular/material/list';
import { MatInputModule } from "@angular/material/input"; 
import { FrequencyType, PeriodType } from "../data-models/market-data.enums";
import { MatSelectModule } from "@angular/material/select";
import { PercentChangeReport } from "../data-models/reports/percent-change.report";
import { AvailableReports } from "../data-models/reports/report.model";
import { Report } from "../data-models/reports/report.model";
import { FormControlComponent } from "../form-control/form-control.component";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { FormControlData } from "../data-models/form-control-data.model";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
    imports: [ FormControlComponent, MatFormFieldModule, MatInputModule, MatListModule, MatSelectModule, ReactiveFormsModule],
    selector: 'reports-component',
    standalone: true,
    styleUrl: './reports-component.css',
    templateUrl: './reports-component.html'
})
export class ReportsComponent {
    @ViewChildren('listItem') listitems!: QueryList<MatListItem>;
    availableReports: string[] = Object.keys(AvailableReports);
    activeReport: string = this.availableReports[0];
    periodTypes: string[] = Object.keys(PeriodType);
    frequencyTypes: string[] = Object.keys(FrequencyType);
    selectedReport: Report = new PercentChangeReport();
    form: FormGroup;

    constructor() {    
        this.form = this.createFormGroup();
    }

    private createFormGroup(): FormGroup {
        // Add the form controls for the timeframe selection
        const group: any = {
            period:  new FormControl('', Validators.required),
            periodType:  new FormControl('', Validators.required),
            frequency:  new FormControl('', Validators.required),
            frequencyType:  new FormControl('', Validators.required)
        };
        // Add the form controls for each parameter required for the report
        this.selectedReport.reportInputs.forEach((param: FormControlData<string>) => {
            group[param.key] = param.required ? new FormControl(param.value || '', Validators.required) :
                                new FormControl(param.value || '');
        });
        return new FormGroup(group);
    }
}