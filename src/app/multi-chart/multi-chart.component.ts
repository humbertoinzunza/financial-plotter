import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, Renderer2, ViewChild, ViewChildren, QueryList, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarketDataService } from '../shared/market-data.service';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ChartComponent } from './chart/chart.component';
import { TimeframeData, TimeframeSelector } from './timeframe-selector/timeframe-selector.component';
import { PriceChartType } from '../data-models/charting.enums';
import { StudiesSelector } from './studies-selector/studies-selector.component';
import { Study } from '../data-models/study.model';
import { ChartingService } from '../shared/charting.service';
import { NgxResizeObserverModule } from 'ngx-resize-observer';

@Component({
    selector: 'app-multi-chart',
    imports: [
        ChartComponent,
        FormsModule,
        MatMenuModule,
        MatButtonModule,
        MatCheckboxModule,
        NgxResizeObserverModule,
        StudiesSelector,
        TimeframeSelector
    ],
    templateUrl: './multi-chart.component.html',
    styleUrl: './multi-chart.component.css',
    providers: [ChartingService, MarketDataService]
})
export class MultiChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild(ChartComponent) priceChart!: ChartComponent;
  @ViewChild(ChartComponent, {read: ElementRef}) priceChartRef!: ElementRef;
  @ViewChild('errorTooltip') errorTooltipRef!: ElementRef;
  @ViewChild('textInput') textInputRef!: ElementRef;
  @ViewChild('timeframeButton') timeframeButtonRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('studiesButton') studiesButtonRef!: ElementRef<HTMLButtonElement>;
  @ViewChild(TimeframeSelector) timeframeSelector!: TimeframeSelector;
  @ViewChild(TimeframeSelector, {read: ElementRef}) timeframeSelectorRef!: ElementRef<HTMLElement>;
  @ViewChild(StudiesSelector) studiesSelector!: StudiesSelector;
  @ViewChild(StudiesSelector, {read: ElementRef}) studiesSelectorRef!: ElementRef<HTMLElement>;
  @ViewChild('studiesDiv') studiesDivRef!: ElementRef<HTMLDivElement>;
  @ViewChildren('studyChart', {read: ChartComponent}) studyCharts!: QueryList<ChartComponent>;
  private marketDataSubscription!: Subscription;
  private marketDataErrorsSubscription!: Subscription;
  private lowerStudiesSubscription!: Subscription;
  private upperStudiesSubscription!: Subscription;
  public currentUpperStudyList: Study[] = [];
  public currentLowerStudyList: Study[] = [];
  symbolInputErrorMessage: string ='';
  timeframeData!: TimeframeData;
  private _showTimeframeSelector: boolean = false;
  private _showStudieselector: boolean = false;

  // Hide form if the ESC key is pressed
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.showTimeframeSelector = false;
    this.showStudiesSelector = false;
  }

  constructor(private marketDataService: MarketDataService,
              private renderer: Renderer2,
              private chartingService: ChartingService) {
    this.timeframeData = marketDataService.timeframeData;
    this.marketDataErrorsSubscription = marketDataService.newError$.subscribe((error: string) => {
      if (error == 'notFound') this.symbolInputErrorMessage = 'Symbol not found';
      else if (error == 'dataNotFound') this.symbolInputErrorMessage = 'Data not found for this timeframe';
      // Show error tooltip
      this.renderer.setStyle(this.errorTooltipRef.nativeElement, 'display', 'block');
      this.renderer.addClass(this.textInputRef.nativeElement, 'error-input');
    });
    // Subscribe to market data changes
    this.marketDataSubscription = marketDataService.newData$.subscribe((marketData) => {
      this.chartingService.marketData = marketData;
      this.renderer.setStyle(this.errorTooltipRef.nativeElement, 'display', 'none');
      this.renderer.removeClass(this.textInputRef.nativeElement, 'error-input');
    });
    // Subscribe to lower studies changes
    this.lowerStudiesSubscription = marketDataService.newLowerStudies$.subscribe((newStudies: Study[]) => {
      this.currentLowerStudyList = newStudies;
      this.chartingService.lowerStudies = this.currentLowerStudyList;
      
    });
    this.upperStudiesSubscription = marketDataService.newUpperStudies$.subscribe((newStudies: Study[]) => {
      this.currentUpperStudyList = newStudies;
      this.chartingService.upperStudies = this.currentUpperStudyList;
    });
    // Listen to clicks in the entire document
      this.renderer.listen('window', 'click',(e: Event)=>{
        // When the StudiesSelector form is shown and the user clicks outside the form, then hide the form
        if (this.showStudiesSelector) {
          const targetAsElement = e.target as Element;
          if(e.target !== this.studiesButtonRef.nativeElement 
            && !this.studiesButtonRef.nativeElement.contains(targetAsElement) 
            && !this.studiesSelectorRef.nativeElement.contains(targetAsElement) 
            && !this.isChildOfCdkOverlay(targetAsElement)) {
            this.showStudiesSelector = false;
          }
        }
        // When the TimeframeSelector form is shown and the user clicks outside the form, then hide the form
        if (this.showTimeframeSelector) {
          const targetAsElement = e.target as Element;
          if(e.target !== this.timeframeButtonRef.nativeElement 
            && !this.timeframeButtonRef.nativeElement.contains(targetAsElement) 
            && !this.timeframeSelectorRef.nativeElement.contains(targetAsElement) 
            && !this.isChildOfCdkOverlay(targetAsElement)) {
            this.showTimeframeSelector = false;
          }
        }
      });
  }

  ngAfterViewInit(): void {
    this.chartingService.priceChartComponent = this.priceChart;
    // Set the proper location for the absolute-positioned elements
    const priceChartElement = (this.priceChartRef.nativeElement as HTMLElement);  
    const topPriceChart = priceChartElement.offsetTop;
    const leftPriceChart = priceChartElement.offsetLeft;
    const leftTimeframeButton = this.timeframeButtonRef.nativeElement.offsetLeft;
    const leftStudiesButton = this.studiesButtonRef.nativeElement.offsetLeft;
    // Set absolute position for the error tooltip, so it shows below the input
    this.renderer.setStyle(this.errorTooltipRef.nativeElement, 'top', `${topPriceChart}px`);
    this.renderer.setStyle(this.errorTooltipRef.nativeElement, 'left', `${leftPriceChart}px`);
    // Set absolute position for the timeframe selector form, so it shows below the timeframe button
    this.renderer.setStyle(this.timeframeSelectorRef.nativeElement, 'top',  `${topPriceChart}px`);
    this.renderer.setStyle(this.timeframeSelectorRef.nativeElement, 'left',  `${leftTimeframeButton}px`);
    // Set absolute position for the studies selector form, so it shows below the studies button
    this.renderer.setStyle(this.studiesSelectorRef.nativeElement, 'top', `${topPriceChart}px`);
    this.renderer.setStyle(this.studiesSelectorRef.nativeElement, 'left', `${leftStudiesButton}px`);
    // Subscribe to timeframe selection changes
    this.timeframeSelector.formSubmittedEvent.subscribe((newData: boolean) => {
      if (newData)
        this.marketDataService.updateMarketData();
      this.showTimeframeSelector = false;
    });
    // Subscribe to study selection changes
    this.studiesSelector.formSubmittedEvent.subscribe((newData: boolean) => {
      if (newData) {
        this.marketDataService.lowerStudies = this.studiesSelector.currentLowerStudyList;       
        this.marketDataService.upperStudies = this.studiesSelector.currentUpperStudyList;
      }
      this.showStudiesSelector = false;
    });
    this.chartingService.studyChartComponents = this.studyCharts;
    this.chartingService.studyChartComponents = this.studyCharts;
  }


  // mat-select elements use cdk-overlay-container to display the options
  // so the click to select an option will be registered outisde the timeframeSelector component
  private isChildOfCdkOverlay(element: Element) {
    let currentParent = element.parentElement;
    while (currentParent != null) {
      if (currentParent.classList.contains('cdk-overlay-container')) return true;
      currentParent = currentParent.parentElement;
    }
    return false;
  }

  ngOnDestroy(): void {
    this.marketDataErrorsSubscription.unsubscribe();
    this.marketDataSubscription.unsubscribe();
  }

  onSymbolEnter($event: Event): void {
    const symbol: string = ($event.target as HTMLInputElement).value;
    if (symbol != '') {
      this.marketDataService.symbol = symbol;
    }
    // Select so the user can input new symbols easily
    ($event.target as HTMLInputElement).select();
  }

  onTimeframeButtonClick(): void {
    this.showTimeframeSelector = !this.showTimeframeSelector;
    this.renderer.setStyle(this.errorTooltipRef.nativeElement, 'display', 'none');
  }
  onStudiesButtonClick(): void {
    this.showStudiesSelector = !this.showStudiesSelector;
    this.renderer.setStyle(this.errorTooltipRef.nativeElement, 'display', 'none');
  }

  onCandlestickChartStyleSelected(): void {
    this.chartType = PriceChartType.Candle;
  }
  onBarChartStyleSelected(): void {
    this.chartType = PriceChartType.Bar;
  }
  onLineChartStyleSelected(): void {
    this.chartType = PriceChartType.Line;
  }
  /* Getters & Setters */
  get isLogScale(): boolean {
    return this.chartingService.priceChartIsLogScale;
  }
  set isLogScale(value: boolean) {
    this.chartingService.priceChartIsLogScale = value; 
  }
  get chartType(): PriceChartType {
    return this.chartingService.priceChartType;
  }
  set chartType(value: PriceChartType) {
    this.chartingService.priceChartType = value;
  }
  get showTimeframeSelector(): boolean {
    return this._showTimeframeSelector;
  }
  set showTimeframeSelector(value: boolean) {
    this._showTimeframeSelector = value;
    this.renderer.setStyle(this.timeframeSelectorRef.nativeElement, 'display', value ? 'block' : 'none');
  }
  get showStudiesSelector(): boolean {
    return this._showStudieselector;
  }
  set showStudiesSelector(value: boolean) {
    this._showStudieselector = value;
    if (value) {
      this.studiesSelector.showSettings = false;
      this.studiesSelector.currentLowerStudyList = this.currentLowerStudyList.slice();
      this.studiesSelector.currentUpperStudyList = this.currentUpperStudyList.slice();
    }
    this.renderer.setStyle(this.studiesSelectorRef.nativeElement, 'display', value ? 'block' : 'none');
  }
  onChartResized(): void {
    this.chartingService.drawUpperChart();
  }
}