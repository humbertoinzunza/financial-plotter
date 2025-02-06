import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from "@angular/core";
import { FrequencyType, PeriodType } from "../../data-models/market-data.enums";
import { 
    FormBuilder,
    FormGroup, 
    FormGroupDirective, 
    FormsModule,
    ReactiveFormsModule,
    Validators
} from "@angular/forms";
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'timeframe-selector',
    imports: [FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
    templateUrl: './timeframe-selector.component.html',
    styleUrl: './timeframe-selector.component.css',
    providers: []
})
export class TimeframeSelector implements AfterViewInit{
    frequencyInputEnabled: boolean = true;
    timeframeForm!: FormGroup;
    validFrequencies: number[] = [];
    periodTypes = Object.values(PeriodType);
    frequencyTypes = Object.values(FrequencyType);
    private _timeframeData!: TimeframeData;
    @ViewChild('frequencyForm') frequencyForm!: FormGroup;
    @ViewChild('overlayDiv') overlayDivRef!: ElementRef;
    @Output() formSubmittedEvent = new EventEmitter<boolean>();
    @Input() set timeframeData(value: TimeframeData) {
        this._timeframeData = value;
        this.onSelectedFrequencyTypeChanged();
    }

    constructor(private formBuilder: FormBuilder) {
        this.buildForm();
    }
    ngAfterViewInit(): void {
    }

    private buildForm(): void {
        this.timeframeForm = this.formBuilder.group({
            periodGroup: this.formBuilder.group({
                period: ['', Validators.required],
                periodType: ['', Validators.required]
            }),
            frequencyGroup: this.formBuilder.group({
                frequency: ['', Validators.required],
                frequencyType: ['', Validators.required]
            })
        });
    }

    get timeframeData(): TimeframeData {
        return this._timeframeData;
    }

    get selectedPeriodType(): PeriodType {
        return this.timeframeData.periodType;
    }

    set selectedPeriodType(value: string) {
        this.timeframeData.periodType = PeriodType[value as keyof typeof PeriodType];
    }

    get selectedFrequencyType(): FrequencyType {
        return this.timeframeData.frequencyType;
    }

    set selectedFrequencyType(value: string) {
        this.timeframeData.frequencyType = FrequencyType[value as keyof typeof FrequencyType];
    }

    submitForm(formDirective: FormGroupDirective): void {
        // Send the data to the parent component
        this.formSubmittedEvent.emit(true);
    }

    onCancel(): void {
        // False so the parent removes the form
        this.formSubmittedEvent.emit(false);
    }

    onSelectedFrequencyTypeChanged(): void {
        if (this.selectedFrequencyType == 'Minute')
            this.validFrequencies = [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30];
        else if (this.selectedFrequencyType == 'Hour')
            this.validFrequencies = [1, 2, 3, 4, 6, 8, 12];
        else
            this.validFrequencies = [1];
    }
}

export class TimeframeData {
    constructor(public period: number, public periodType: PeriodType, public frequency: number, public frequencyType: FrequencyType) { }
}