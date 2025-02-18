import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { FrequencyType, PeriodType } from "../../data-models/market-data.enums";
import { 
    FormBuilder,
    FormGroup, 
    FormsModule,
    ReactiveFormsModule,
    Validators
} from "@angular/forms";
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from "@angular/material/dialog";

@Component({
    selector: 'timeframe-selector',
    imports: [FormsModule, MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
    templateUrl: './timeframe-selector.component.html',
    styleUrl: './timeframe-selector.component.css',
    providers: []
})
export class TimeframeSelector {
    frequencyInputEnabled: boolean = true;
    form!: FormGroup;
    validFrequencies: number[] = [];
    periodTypes = Object.values(PeriodType);
    frequencyTypes = Object.values(FrequencyType);
    private _timeframeData!: TimeframeData;
    @ViewChild('frequencyForm') frequencyForm!: FormGroup;
    @ViewChild('overlayDiv') overlayDivRef!: ElementRef;
    @Output() formSubmittedEvent = new EventEmitter<boolean>();
    @Input() set timeframeData(value: TimeframeData) {
        this._timeframeData = value;
        this.buildForm();
        this.onSelectedFrequencyTypeChanged();
    }

    constructor(private formBuilder: FormBuilder) {
        this.buildForm();
    }
    private buildForm(): void {
        this.form = this.formBuilder.group({
            period: [this._timeframeData ? this._timeframeData.period : '', Validators.required],
            periodType: [this._timeframeData ? this._timeframeData.periodType : '', Validators.required],
            frequency: [this._timeframeData ? this._timeframeData.frequency : '', Validators.required],
            frequencyType: [this._timeframeData ? this._timeframeData.frequencyType : '', Validators.required]
        });
    }

    get timeframeData(): TimeframeData {
        const period: number = this.form.get('period')?.value;
        const periodType: string = this.form.get('periodType')?.value;
        const frequency: number = this.form.get('frequency')?.value;
        const frequencyType: string = this.form.get('frequencyType')?.value;
        this._timeframeData = new TimeframeData(period,
                                                PeriodType[periodType as keyof typeof PeriodType],
                                                frequency,
                                                FrequencyType[frequencyType as keyof typeof FrequencyType]);
        return this._timeframeData;
    }

    onSubmitForm(): void {
        if (this.form.valid)
            // Send the data to the parent component
            this.formSubmittedEvent.emit(true);
    }

    onSelectedFrequencyTypeChanged(): void {
        const frequencyType = this.form.get('frequencyType');
        if (frequencyType) {
            if (frequencyType.value == 'Minute')
                this.validFrequencies = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30];
            else if (frequencyType.value == 'Hour')
                this.validFrequencies = [1, 2, 3, 4, 6, 8, 12];
            else
                this.validFrequencies = [1];
        }
    }
}

export class TimeframeData {
    constructor(public period: number, public periodType: PeriodType, public frequency: number, public frequencyType: FrequencyType) { }
}