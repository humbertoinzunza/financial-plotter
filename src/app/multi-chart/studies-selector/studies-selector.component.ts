import { Component, ElementRef, EventEmitter, Input, Renderer2, ViewChild } from "@angular/core";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { AvailableStudies } from "../../data-models/study.enums";
import { Study } from "../../data-models/study.model";
import { getDefaultStudy } from "../../data-models/study.tools";
import { ParameterType } from "../../data-models/charting.enums";
import { FormsModule } from "@angular/forms";
import { EnumParameterInfoConverter, NumericParameterInfoConverter } from "../../data-models/study.model";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { MatDialogModule } from "@angular/material/dialog";

@Component({
    selector: 'studies-selector',
    imports: [EnumParameterInfoConverter, FormsModule, MatDialogModule, MatInputModule, MatButtonModule, MatSelectModule, MatTabsModule, NumericParameterInfoConverter],
    providers: [],
    styleUrl: './studies-selector.component.css',
    templateUrl: './studies-selector.component.html'
})
export class StudiesSelector {
    // Enums
    public parameterType = ParameterType;
    private availableStudies = Object.values(AvailableStudies);
    public displayedStudies = this.availableStudies;
    public valueToSearch: string = '';
    public formSubmittedEvent = new EventEmitter<boolean>();
    public currentUpperStudyList: Study[] = [];
    public currentLowerStudyList: Study[] = [];
    public currentlySelectedStudy!: Study;
    @ViewChild('studySelector') studySelectorDivRef!: ElementRef<HTMLDivElement>;
    @ViewChild('addedStudies') addedStudiesDivRef!: ElementRef<HTMLDivElement>;
    @ViewChild('paramsSettings') paramsSettingsDivRef!: ElementRef<HTMLDivElement>;
    constructor(private renderer: Renderer2) { }

    onSubmit(): void {
        this.formSubmittedEvent.emit(true);
    }
    onAddStudyButtonClicked(study: string): void {
        const studyType: AvailableStudies = AvailableStudies[study as keyof typeof AvailableStudies];
        const studyToAdd: Study = getDefaultStudy(studyType);
        if (studyToAdd.isLowerStudy)
            this.currentLowerStudyList.push(studyToAdd);
        else
            this.currentUpperStudyList.push(studyToAdd);
    }
    onRemoveUpperStudyButtonClicked(index: number): void {
        this.currentUpperStudyList.splice(index, 1);
    }
    onRemoveLowerStudyButtonClicked(index: number): void {
        this.currentLowerStudyList.splice(index, 1);
    }
    onUpperStudySettingsButtonClicked(index: number): void {
        this.currentlySelectedStudy = this.currentUpperStudyList[index];
        this.showSettings = true;
    }
    onLowerStudySettingsButtonClicked(index: number): void {
        this.currentlySelectedStudy = this.currentLowerStudyList[index];
        this.showSettings = true;
    }
    onBackButtonClicked(): void {
        this.showSettings = false;
    }

    public set showSettings(value: boolean) {
        this.scrollDivsToTop();
        // Show the appropriate form
        if (value) {
            this.renderer.setStyle(this.studySelectorDivRef.nativeElement, 'display', 'none');
            this.renderer.setStyle(this.paramsSettingsDivRef.nativeElement, 'display', 'flex');
        }
        else {
            this.renderer.setStyle(this.studySelectorDivRef.nativeElement, 'display', 'grid');
            this.renderer.setStyle(this.paramsSettingsDivRef.nativeElement, 'display', 'none');
        }   
    }

    private scrollDivsToTop(): void {
        this.renderer.setProperty(this.studySelectorDivRef.nativeElement, 'scrollTop', 0);
        this.renderer.setProperty(this.addedStudiesDivRef.nativeElement, 'scrollTop', 0);
        this.renderer.setProperty(this.paramsSettingsDivRef.nativeElement, 'scrollTop', 0);
    }

    searchStudies(): void {
        const searchValue: string =  this.valueToSearch.toLocaleLowerCase();
        if (searchValue.length == 0) {
            this.displayedStudies = this.availableStudies;
            return;
        }
        this.displayedStudies = this.availableStudies.filter(element => element.toLowerCase().includes(searchValue));
    }
}