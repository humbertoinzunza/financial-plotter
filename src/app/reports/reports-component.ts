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
import { DataFetcherService } from "../shared/data-fetcher.service";
import { ReportDto } from "../dtos/reportDto";
import { Table } from "../data-models/table.model";
import {MatTabsModule} from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from "@angular/material/checkbox";

@Component({
    imports: [
        FormControlComponent,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatTableModule,
        MatTabsModule,
        MatSelectModule,
        ReactiveFormsModule
    ],
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
    public errorMessage: string = '';
    public availableData: boolean = false;
    public dataSource: number[][] = [];
    public displayedColumns: string[] = [];
    public periodDisabled: boolean = false;
    private currentlySelectedIndex: number = 0;

    constructor(private dataFetcherService: DataFetcherService) {
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
        this.errorMessage= '';
    }

    onSubmit(): void {
        if (this.form.valid) {
            this.dataFetcherService.getReport(this.selectedReportName, this.form.getRawValue())
            .subscribe((reportDto: ReportDto) => {
                if (!reportDto.dataFound) {
                    this.availableData = false;
                    if (!reportDto.symbolFound) this.errorMessage = 'The selected symbol was not found';
                    else this.errorMessage = 'No data was found for the selected timeframe';
                } 
                else {
                    this.errorMessage = '';
                    this.availableData = true; 
                }
                this.selectedReport.setValues(reportDto);
                this.getData();
            });
        }
    }

    private getData(): void {
        let table: Table = this.selectedReport.values;
        this.dataSource = Array(table.length);
        for (let i = 0; i < table.length; i++) {
            this.dataSource[i] = Array(table.columns.length);
            for (let j = 0; j < table.columns.length; j++) {
                this.dataSource[i][j] = table.columns[j].values[i];
            }
        }
        this.displayedColumns = this.selectedReport.columnTableNames;
    }

    useAllDataCheckboxChanged(checked: boolean): void {
        const periodForm = this.form.get('period');
        const periodTypeForm = this.form.get('periodType');
        if (checked) {
            periodForm?.disable();
            periodForm?.setValue(null);
            periodForm?.setValidators(null);
            periodTypeForm?.disable();
            periodTypeForm?.setValue('Day');
        }
        else {
            periodForm?.enable();
            periodForm?.setValidators(Validators.required);
            periodTypeForm?.enable();
        }
        
    }
}