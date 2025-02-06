import { Component, Input } from "@angular/core";
import { FormControlData } from "../data-models/form-control-data.model";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import {MatRadioModule} from '@angular/material/radio'; 
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
    imports: [MatFormFieldModule, MatInputModule, MatRadioModule, MatSelectModule, ReactiveFormsModule],
    selector: 'form-control',
    standalone: true,
    styleUrl: './form-control.component.css',
    templateUrl: './form-control.component.html'
})
export class FormControlComponent {
    @Input() controlData!: FormControlData<string>;
    @Input() form!: FormGroup;
}