import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, Renderer2, ViewChild, ViewChildren, QueryList } from '@angular/core';
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
import { OverlayModule } from '@angular/cdk/overlay';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; 
import { inject } from '@angular/core';
import { MarketData } from '../data-models/market-data.model';
import { ChartData } from '../data-models/chart-data.interface';

@Component({
    selector: 'app-multi-chart',
    imports: [
        ChartComponent,
        FormsModule,
        MatMenuModule,
        MatButtonModule,
        MatDialogModule,
        MatCheckboxModule,
        OverlayModule
    ],
    templateUrl: './multi-chart.component.html',
    styleUrl: './multi-chart.component.css',
    providers: [MarketDataService]
})
export class MultiChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild(ChartComponent, {read: ElementRef}) priceChartRef!: ElementRef;
  @ViewChildren('studyChart') studyCharts!: QueryList<ChartComponent>;
  @ViewChild('errorTooltip') errorTooltipRef!: ElementRef;
  @ViewChild('textInput') textInputRef!: ElementRef;
  @ViewChild('timeframeButton') timeframeButtonRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('studiesButton') studiesButtonRef!: ElementRef<HTMLButtonElement>;
  private marketDataSubscription!: Subscription;
  private marketDataErrorsSubscription!: Subscription;
  private lowerStudiesSubscription!: Subscription;
  private upperStudiesSubscription!: Subscription;
  private timeframeDataSubscription!: Subscription;
  private studiesDataSubscription!: Subscription;
  public currentUpperStudyList: Study[] = [];
  public currentLowerStudyList: Study[] = [];
  // Data used in the chart components
  public chartType: PriceChartType = PriceChartType.Candle;
  public isLogScale: boolean = true;
  public marketData!: MarketData;
  public upperChartData: ChartData[] = [];
  public lowerChartData: ChartData[][] = [];
  public symbolInputErrorMessage: string ='';
  public timeframeData!: TimeframeData;
  readonly timeframeDialog = inject(MatDialog);
  readonly studiesSelectorDialog = inject(MatDialog);

  constructor(private marketDataService: MarketDataService,
              private renderer: Renderer2) {
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
      this.marketData = marketData;
      this.renderer.setStyle(this.errorTooltipRef.nativeElement, 'display', 'none');
      this.renderer.removeClass(this.textInputRef.nativeElement, 'error-input');
    });
    // Subscribe to lower studies changes
    this.lowerStudiesSubscription = marketDataService.newLowerStudies$.subscribe((newStudies: Study[]) => {
      this.currentLowerStudyList = newStudies;
      if (this.currentLowerStudyList.length > 0) {
        let tempChartData: ChartData[][] = [];
        for (let i = 0; i < this.currentLowerStudyList.length; i++) {
          tempChartData[i] = [...this.currentLowerStudyList[i].chartData];
        }
        this.lowerChartData = tempChartData;
      }
    });
    this.upperStudiesSubscription = marketDataService.newUpperStudies$.subscribe((newStudies: Study[]) => {
      this.currentUpperStudyList = newStudies;
      let tempChartData: ChartData[] = [];
      this.currentUpperStudyList.forEach((study: Study) => {
        tempChartData.push(...study.chartData);
      });
      this.upperChartData = tempChartData;
    });
  }

  ngAfterViewInit(): void {
    // Set the proper location for the absolute-positioned elements
    const priceChartElement = (this.priceChartRef.nativeElement as HTMLElement);  
    const topPriceChart = priceChartElement.offsetTop;
    const leftPriceChart = priceChartElement.offsetLeft;
    const leftStudiesButton = this.studiesButtonRef.nativeElement.offsetLeft;
    // Set absolute position for the error tooltip, so it shows below the input
    this.renderer.setStyle(this.errorTooltipRef.nativeElement, 'top', `${topPriceChart}px`);
    this.renderer.setStyle(this.errorTooltipRef.nativeElement, 'left', `${leftPriceChart}px`);
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
  /*
  onStudiesButtonClick(): void {
    this.showStudiesSelector = !this.showStudiesSelector;
    this.renderer.setStyle(this.errorTooltipRef.nativeElement, 'display', 'none');
  }*/

  onCandlestickChartStyleSelected(): void {
    this.chartType = PriceChartType.Candle;
  }
  onBarChartStyleSelected(): void {
    this.chartType = PriceChartType.Bar;
  }
  onLineChartStyleSelected(): void {
    this.chartType = PriceChartType.Line;
  }
  openTimeframeDialog(): void {
    const dialogRef = this.timeframeDialog.open(TimeframeSelector);
    dialogRef.afterOpened().subscribe(_ => {
      dialogRef.componentInstance.timeframeData = this.timeframeData;
      this.timeframeDataSubscription = dialogRef.componentInstance.formSubmittedEvent.subscribe(_ => {
        this.timeframeData = dialogRef.componentInstance.timeframeData;
        this.marketDataService.timeframeData = this.timeframeData;
      });
    });
    dialogRef.afterClosed().subscribe(_ => {
      this.timeframeDataSubscription.unsubscribe();
    });
  }
  openStudiesSelectorDialog(): void {
    const dialogRef = this.studiesSelectorDialog.open(StudiesSelector);
    dialogRef.afterOpened().subscribe(_ => {
      dialogRef.componentInstance.currentLowerStudyList = this.currentLowerStudyList.slice();
      dialogRef.componentInstance.currentUpperStudyList = this.currentUpperStudyList.slice();
      this.studiesDataSubscription = dialogRef.componentInstance.formSubmittedEvent.subscribe(_ => {
        this.marketDataService.lowerStudies = dialogRef.componentInstance.currentLowerStudyList;
        this.marketDataService.upperStudies = dialogRef.componentInstance.currentUpperStudyList;
      });
    });
    dialogRef.afterClosed().subscribe(_ => {
      this.studiesDataSubscription.unsubscribe();
    });
  }
}