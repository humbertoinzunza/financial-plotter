import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewChild
 } from '@angular/core';
 import {
  CandlestickChartData,
  LineData,
  PriceBarChartData,
  YAxisLegend,
  PriceLineChartData,
  CircleChartData,
  LineChartData,
  PolygonChartData,
  RectangleChartData,
  RectangleData,
  PolygonData,
  CircleData
} from "../../data-models/charting.models";
import { MarketData } from '../../data-models/market-data.model';
import { ChartData, Parameter } from '../../data-models/chart-data.interface';
import { BooleanChartType, ChartValueType, ConstantChartType, NumericChartType, PriceChartType } from '../../data-models/charting.enums';
import { Column } from '../../data-models/column.model';
import { NgxResizeObserverModule } from 'ngx-resize-observer';
import { Subscription } from 'rxjs';
import { CrosshairService } from './crosshair.service';

@Component({
    selector: 'chart',
    imports: [NgxResizeObserverModule],
    templateUrl: './chart.component.html',
    styleUrl: './chart.component.css',
    providers: []
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mainSvg', {static: true}) mainSvgRef!: ElementRef;
  // For price charts
  public gridXData: LineData[] = [];
  public gridYData: LineData[] = [];
  public yAxisLegends: YAxisLegend[] = [];
  public priceBarChartData: PriceBarChartData = new PriceBarChartData();
  public priceLineChartData: PriceBarChartData = new PriceLineChartData();
  public candlestickChartData: CandlestickChartData = new CandlestickChartData();
  // For all charts assigned to this chart element
  public circleChartData: CircleChartData[] = [];
  public lineChartData: LineChartData[] = [];
  public polygonChartData: PolygonChartData[] = [];
  public rectangleChartData: RectangleChartData[] = [];
  // Crosshair data
  public crosshairHorizontal: LineData | undefined;
  public crosshairVertical: LineData | undefined;
  // Values required for charting
  private maxX: number = 0;
  private minX: number = 0;
  private maxY: number = 0;
  private minY: number = 0;
  private dy: number = 0;
  private width: number = 0;
  private separation: number = 0;
  // Chart data sources
  private _marketData!: MarketData;
  private _chartData: ChartData[] = [];
  // Settings
  private _isLogScale: boolean = false;
  private _priceChartType: PriceChartType = PriceChartType.Candle;
  // Subscriptions
  private mouseXCoordinateSubscription!: Subscription;

  constructor(private crosshairService: CrosshairService) { }
  
  ngOnDestroy(): void {
    if (this.mouseXCoordinateSubscription)
      this.mouseXCoordinateSubscription.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.subscribeToCrosshairEvent();
  }

  onMouseEnter(event: MouseEvent) {
    if (this.mouseXCoordinateSubscription)
      this.mouseXCoordinateSubscription.unsubscribe();
    this.crosshairService.xCoordinate = event.clientX;
    const bounding: DOMRect = (this.mainSvgRef.nativeElement as Element).getBoundingClientRect();
    const x: string = (event.clientX - bounding.left).toString();
    const y: string = (event.clientY - bounding.top).toString();
    this.crosshairHorizontal = new LineData('0', y, this.mainSvgRef.nativeElement.clientWidth.toString(), y);
    this.crosshairVertical = new LineData(x, '0', x, this.mainSvgRef.nativeElement.clientHeight.toString());
  }

  onMouseMove(event: MouseEvent) {
    this.crosshairService.xCoordinate = event.clientX;
    const bounding: DOMRect = (this.mainSvgRef.nativeElement as Element).getBoundingClientRect();
    const x: string = (event.clientX - bounding.left).toString();
    const y: string = (event.clientY - bounding.top).toString();
    this.crosshairHorizontal = new LineData('0', y, this.mainSvgRef.nativeElement.clientWidth.toString(), y);
    this.crosshairVertical = new LineData(x, '0', x, this.mainSvgRef.nativeElement.clientHeight.toString());
  }

  onMouseLeave(event: MouseEvent) {
    this.crosshairService.xCoordinate = -1;
    this.crosshairHorizontal = undefined;
    this.crosshairVertical = undefined;
    this.subscribeToCrosshairEvent();
  }

  private subscribeToCrosshairEvent(): void {
    this.mouseXCoordinateSubscription = this.crosshairService.newCoordinate$.subscribe((xCoordinate: number) => {
      if (xCoordinate < 0) this.crosshairVertical = undefined;
      else {
        const bounding: DOMRect = (this.mainSvgRef.nativeElement as Element).getBoundingClientRect();
        const x: string = (xCoordinate - bounding.left).toString();
        this.crosshairVertical = new LineData(x, '0', x, this.mainSvgRef.nativeElement.clientHeight.toString());                                    
      }
    });
  }

  @Input() isPriceChart: boolean = false;
  @Input() uptickColor: string = 'green';
  @Input() downtickColor: string = 'red';
  @Input() notickColor: string = 'gray';
  @Input() gridLineNum: number = 10;
  @Input() set marketData(value: MarketData) {
    this._marketData = value;
    this.draw();
  }
  @Input() set chartData(value: ChartData[]) {
    this._chartData = value;
    this.draw();
  }
  @Input() set isLogScale(value: boolean) {
    this._isLogScale = value;
    this.draw();
  }
  @Input() set priceChartType(value: PriceChartType) {
    this._priceChartType = value;
    this.draw();
  }
  onResize(): void {
    this.draw();
  }
  public draw(): void {
    if (this.isPriceChart) {
      if (this._marketData === undefined || this._marketData.length === 0) return;
    }
    else {
      if (this._chartData.length === 0) return;
    }
    this.setWidthAndSeparation();
    if (this.isPriceChart)
      this.drawPriceChart();
    if (!this.isPriceChart)
      this.createAdditionalChartGridAndSetLabels();
    this.drawAdditionalCharts();
  }
  private drawPriceChart(): void {
    this.createPriceGridAndSetLabels();
    // Reset values for all chart types in the priceChartComponent
    this.priceBarChartData = new PriceBarChartData();
    this.candlestickChartData = new CandlestickChartData();
    this.priceLineChartData = new PriceLineChartData();
    switch(this._priceChartType) {
        case PriceChartType.Bar:
            this.plotPriceBarChart();
            break;
        case PriceChartType.Candle:
            this.plotPriceCandlestickChart();
            break;
        case PriceChartType.Line:
            this.plotPriceLineChart();
            break;
    }
  }
  // Calculates the largest datapoint length our of all the ChartData instances
  private getDatapointsLength(): number {
    let maxLength: number = 0;
    this._chartData.forEach((chartData: ChartData) => {
      if (chartData.yValues instanceof Parameter) {
        // Parameters hold only one constant value
        if (maxLength < 1) maxLength = 1;
      }
      else if (chartData.yValues instanceof Column) {
        const column: Column = chartData.yValues as Column;
        if (maxLength < column.values.length) maxLength = column.values.length;
      }
    });
    return maxLength;
  }
  private setWidthAndSeparation(): void {
    // Smaller margin for the X-axis because there is more space
    this.minX = this.mainSvgRef.nativeElement.clientWidth * 0.01;
    this.maxX = this.mainSvgRef.nativeElement.clientWidth * 0.99;
    let dataPointsLength: number;
    let minWidth: number;
    let minSeparation: number = 1;
    if (this.isPriceChart) {
      dataPointsLength = this._marketData.length;
      minWidth = 3;
    }
    else {
      dataPointsLength = this.getDatapointsLength();
      minWidth = 1;
    }
    const horizontalSpace: number = this.maxX - this.minX;
    this.width = minWidth;
    let minGraphWidth: number = dataPointsLength * (this.width + minSeparation);
    // Add width to candles if possible
    while (minGraphWidth <= horizontalSpace) {
        minGraphWidth += dataPointsLength;
        this.width++;
    }
    if (minGraphWidth > horizontalSpace && this.width > minWidth) {
        minGraphWidth -= dataPointsLength;
        this.width--;
    }
    this.separation = (horizontalSpace - dataPointsLength * this.width) / dataPointsLength;
    //if (this.separation < 1) this.separation = 1;
  }
  private createPriceGridAndSetLabels(): void {
    const priceSvg: SVGSVGElement = this.mainSvgRef.nativeElement as SVGSVGElement;
    let high: number[] = this._marketData.high.values;
    let low: number[] = this._marketData.low.values;
    // If it's a line chart then only the closing price matters
    if (this._priceChartType === PriceChartType.Line) {
        high = this._marketData.close.values;
        low = this._marketData.close.values;
    }
    let localMin: number =  Math.min(...low);
    let localMax: number = Math.max(...high);
    // Add 2% margin to the extremes
    this.minY = Math.min(...low) * 0.98;
    this.maxY = Math.max(...high) * 1.02;
    if (this._isLogScale) {
        this.minY = Math.log10(this.minY);
        this.maxY = Math.log10(this.maxY);
        localMin = Math.log10(localMin);
        localMax = Math.log10(localMax);
    }
    this.dy = priceSvg.clientHeight / (this.maxY - this.minY);
    // Create the Y-axis Grid
    this.yAxisLegends = Array(this.gridLineNum);
    const x1: string = '0';
    const x2: string = priceSvg.clientWidth.toString();
    let lowest: number = (this.maxY - localMin) * this.dy;
    let highest: number = (this.maxY - localMax) * this.dy;
    let separation: number = (highest - lowest) / (this.gridLineNum - 1);
    let lineArray: LineData[] = Array(this.gridLineNum);
    let currentYPos: number = lowest;
    for (let i = 0; i < this.gridLineNum; i++) {
        const currentYPosAsString: string = currentYPos.toString();
        let dollarValue: number = this.maxY - currentYPos / this.dy;
        if (this._isLogScale) dollarValue = Math.pow(10, dollarValue);
        this.yAxisLegends[i] = new YAxisLegend(currentYPosAsString, dollarValue.toFixed(4));
        lineArray[i] = new LineData(x1, currentYPosAsString, x2, currentYPosAsString);
        currentYPos += separation;
    }
    this.gridYData = lineArray;
    // Create the X-axis grid
    lowest = this.minX;
    highest = this.maxX;
    separation = Math.floor(this._marketData.length / (this.gridLineNum - 1));
    lineArray = Array(this.gridLineNum);
    let currentXPos = lowest;
    const y1: string = '0';
    const y2: string = priceSvg.clientHeight.toString();
    for (let i = 0; i < this.gridLineNum; i++) {
        let currentXPosAsString = currentXPos.toString();
        lineArray[i] = new LineData(currentXPosAsString, y1, currentXPosAsString, y2);
        currentXPos += separation * (this.width + this.separation);
    }
    this.gridXData = lineArray;
  }
  private plotPriceLineChart(): void {
      let close: number[] = this._marketData.close.values;
      if (this._isLogScale) 
          close = close.map((value) => Math.log10(value));
      let x1 = this.minX + this.width / 2, x2;
      let y1, y2;
      let prevValue = close[0];
      for (let i = 1; i < this._marketData.length; i++) {
          y1 = (this.maxY - prevValue) * this.dy;
          x2 = x1 + this.separation + this.width;
          y2 = (this.maxY - close[i]) * this.dy;
          if (prevValue > close[i]) {
              this.priceLineChartData.downLines.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString()));
          }
          else if (prevValue < close[i])
              this.priceLineChartData.upLines.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString()));
          else
              this.priceLineChartData.neutralLines.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString()));
          prevValue = close[i];
          x1 = x2;
      }
  }
  private plotPriceBarChart(): void {
      let open: number[] = this._marketData.open.values;
      let high: number[] = this._marketData.high.values;
      let low: number[] = this._marketData.low.values;
      let close: number[] = this._marketData.close.values;
      if (this._isLogScale) {
          open = open.map((value) => Math.log10(value));
          high = high.map((value) => Math.log10(value));
          low = low.map((value) => Math.log10(value));
          close = close.map((value) => Math.log10(value));
      }
      let x1 = this.minX - this.width / 2, x2;
      let y1, y2;
      let arrayInUse: LineData[];
      for (let i = 0; i < this._marketData.length; i++) {
          if (open[i] > close[i]) {
              arrayInUse = this.priceBarChartData.downLines;
              // Open line
              y1 = (this.maxY - open[i]) * this.dy;
              x2 = x1 + this.width / 2;
              // Horizontal line, so use the same y value
              arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
              // Close line
              x1 = x2;
              y1 = (this.maxY - close[i]) * this.dy;
              x2 += this.width / 2;
              // Horizontal line, so use the same y value
              arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
          }
          else if (open[i] < close[i]) {
              arrayInUse = this.priceBarChartData.upLines;
              // Open line
              y1 = (this.maxY - close[i]) * this.dy;
              x2 = x1 + this.width / 2;
              // Horizontal line, so use the same y value
              arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
              // Close line
              x1 = x2;
              y1 = (this.maxY - open[i]) * this.dy;
              x2 += this.width / 2;
              // Horizontal line, so use the same y value
              arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
          }
          else {
              arrayInUse = this.priceBarChartData.neutralLines;
              // Open and close line
              y1 = (this.maxY - open[i]) * this.dy;
              x2 = x1 + this.width;
              // Horizontal line, so use the same y value
              arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
              x1 += this.width / 2;
          }
          // Middle line
          y1 = (this.maxY - high[i]) * this.dy;
          y2 = (this.maxY - low[i]) * this.dy;
          x2 = x1;
          arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString()));
          x1 += this.width / 2 + this.separation;
      }
  }
  private plotPriceCandlestickChart(): void {
    let open: number[] = this._marketData.open.values;
    let high: number[] = this._marketData.high.values;
    let low: number[] = this._marketData.low.values;
    let close: number[] = this._marketData.close.values;
    if (this._isLogScale) {
        open = open.map((value) => Math.log10(value));
        high = high.map((value) => Math.log10(value));
        low = low.map((value) => Math.log10(value));
        close = close.map((value) => Math.log10(value));
    }
    let x1 = this.minX - this.width / 2, x2;
    let y1, y2;
    let height;
    this.candlestickChartData.width = this.width;
    let arrayInUse: LineData[];
    for (let i = 0; i < this._marketData.length; i++) {
      if (open[i] > close[i]) {
          y1 = (this.maxY - open[i]) * this.dy;
          height = (open[i] - close[i]) * this.dy;
          this.candlestickChartData.downBodies.push(new RectangleData(x1.toString(), y1.toString(), height.toString()));
          arrayInUse = this.candlestickChartData.downWicks;
      }
      else if (open[i] < close[i]) {
          y1 = (this.maxY - close[i]) * this.dy;
          height = (close[i] - open[i]) * this.dy;
          this.candlestickChartData.upBodies.push(new RectangleData(x1.toString(), y1.toString(), height.toString()));
          arrayInUse = this.candlestickChartData.upWicks;
      }
      else {
          y1 = (this.maxY - close[i]) * this.dy;
          x2 = x1 + this.width;
          this.candlestickChartData.neutralBodies.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
          arrayInUse = this.candlestickChartData.neutralWicks;
      }
      x1 += this.width / 2;
      y1 = (this.maxY - high[i]) * this.dy;
      x2 = x1;
      y2 = (this.maxY - low[i]) * this.dy;
      arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString()));
      x1 += this.width / 2 + this.separation;
    }
  }
  private drawAdditionalCharts(): void {
    this.circleChartData = [];
    this.lineChartData = [];
    this.polygonChartData = [];
    this.rectangleChartData = [];
    this._chartData.forEach((currentChartData: ChartData, index: number) => {
      switch(currentChartData.chartValueType) {
          case (ChartValueType.Boolean):
              const booleanChartType: BooleanChartType = currentChartData.studyChartType as BooleanChartType;
              const booleanColumn: Column = currentChartData.yValues as Column;
              if (booleanChartType === BooleanChartType.ArrowDownAtHigh)
                  this.drawBooleanArrowDownAtHigh(booleanColumn, currentChartData.color);
              else if (booleanChartType === BooleanChartType.ArrowUpAtLow)
                  this.drawBooleanArrowUpAtLow(booleanColumn, currentChartData.color);
              break;
          case (ChartValueType.Constant):
              const constantChartType: ConstantChartType = currentChartData.studyChartType as ConstantChartType;
              const constantValue: number = (currentChartData.yValues as Parameter).value;
              if (constantChartType === ConstantChartType.Dot)
                  this.drawConstantDotStudy(constantValue, currentChartData.color);
              else if (constantChartType === ConstantChartType.Line)
                  this.drawConstantLineStudy(constantValue, currentChartData.color);
              break;
          case (ChartValueType.Numeric):
              const numericChartType: NumericChartType = currentChartData.studyChartType as NumericChartType;
              const column: Column = currentChartData.yValues as Column;
              if (numericChartType === NumericChartType.Bar)
                  this.drawNumericBarStudy(column, currentChartData.color);
              else if (numericChartType === NumericChartType.Dot)
                  this.drawNumericDotStudy(column, currentChartData.color);
              else if (numericChartType === NumericChartType.Histogram)
                  this.drawNumericHistogramStudy(column, currentChartData.color);
              else if (numericChartType === NumericChartType.Line)
                  this.drawNumericLineStudy(column, currentChartData.color);
              break;
      }
    });
  }
  private drawBooleanArrowDownAtHigh(column: Column, color: string) {
    let values: any[] = column.values;
    let high: any[] = this._marketData.high.values;
    if (this._isLogScale) values = values.map(value => Math.log10(value));
    let x: number = this.minX;
    let y: number;
    let polygonChartData: PolygonChartData = new PolygonChartData(color);
    for (let i = 0; i < values.length; i++) {
      if (values[i] === true) {
        let points: string = '';
        y = (this.maxY - high[i]) * this.dy - this.separation - this.width;
        points += x.toString() + ',' + y.toString() + ' ';
        x += this.width / 2;
        y += this.width;
        points += x.toString() + ',' + y.toString() + ' ';
        x += this.width / 2;
        y -= this.width;
        points += x.toString() + ',' + y.toString() + ' ';
        x -= this.width / 2;
        y += this.width * 0.2;
        points += x.toString() + ',' + y.toString();
        polygonChartData.polygonData.push(new PolygonData(points));
      }
    }
    this.polygonChartData.push(polygonChartData);
  }
  private drawBooleanArrowUpAtLow(column: Column, color: string) {
    let values: any[] = column.values;
    let low: any[] = this._marketData.low.values;
    if (this._isLogScale) values = values.map(value => Math.log10(value));
    let x: number = this.minX;
    let y: number;
    let polygonChartData: PolygonChartData = new PolygonChartData(color);
    for (let i = 0; i < values.length; i++) {
      if (values[i] === true) {
        let points: string = '';
        y = (this.maxY - low[i]) * this.dy + this.separation + this.width;
        points += x.toString() + ',' + y.toString() + ' ';
        x += this.width / 2;
        y -= this.width;
        points += x.toString() + ',' + y.toString() + ' ';
        x += this.width / 2;
        y += this.width;
        points += x.toString() + ',' + y.toString() + ' ';
        x -= this.width / 2;
        y -= this.width * 0.2;
        points += x.toString() + ',' + y.toString();
        polygonChartData.polygonData.push(new PolygonData(points));
      }
    }
    this.polygonChartData.push(polygonChartData);
  }
  private drawConstantDotStudy(constantValue: number, color: string): void {
    // Since it's a constant value, the graph is simply a line composed of dots
    const radius: string = (this.width / 2).toString();
    let xPos: number = this.minX - this.width / 2;
    if (this._isLogScale) {
        constantValue = Math.log10(constantValue);
    }
    const yPos: string = ((this.maxY - constantValue) * this.dy).toString();
    // One dot per market data point
    const circleData: CircleData[] = Array(this._marketData.length);
    for (let i = 0; i < this._marketData.length; i++) {
        circleData[i] = new CircleData(xPos.toString(), yPos);
        xPos += this.width + this.separation;
    }
    // Append the circle data to the list
    this.circleChartData.push(new CircleChartData(color, radius, circleData));
  }
  private drawConstantLineStudy(constantValue: number, color: string): void {
    if (this._isLogScale) {
        constantValue = Math.log10(constantValue);
    }
    const yPos = ((this.maxY - constantValue) * this.dy).toString();
    // Line data array has one element only, because it's a straight line
    this.lineChartData.push(new LineChartData(color, [new LineData(this.minX.toString(), yPos, this.maxX.toString(), yPos)]));
  }
  // Not to be used for upper studies
  private drawNumericBarStudy(column: Column, color: string): void {
    let values: any[] = column.values;
    if (this._isLogScale) values = values.map(value => Math.log10(value));
    let x: number = this.minX - this.width / 2;
    let y: number;
    let height: number;
    const rectangleChartData: RectangleChartData = new RectangleChartData(color, this.width.toString(), Array(values.length));
    for (let i = 0; i < values.length; i++) {
        if (values[i] < 0) {
            y = this.maxY * this.dy;
            height = -values[i] * this.dy;
        }
        else {
            y = (this.maxY - values[i]) * this.dy;
            height = values[i] * this.dy;
        }
        rectangleChartData.rectangleData[i] = new RectangleData(x.toString(), y.toString(), height.toString());
        x += this.width + this.separation;
    }
    this.rectangleChartData.push(rectangleChartData);
  }
  // Not suitable to plot studies with negative values on a log-scaled chart
  private drawNumericDotStudy(column: Column, color: string): void {
    let values: any[] = column.values;
    if (this._isLogScale) values = values.map(value => Math.log10(value));
    let x: number = this.minX - this.width / 2;
    let y: number;
    const radius: string = (this.width / 2).toString();
    const circleChartData: CircleChartData = new CircleChartData(color, radius, Array(values.length));
    for (let i = 0; i < values.length; i++) {
        y = (this.maxY - values[i]) * this.dy;
        circleChartData.circleData[i] = new CircleData(x.toString(), y.toString());
        x += this.width + this.separation;
    }
    this.circleChartData.push(circleChartData); 
  }
  // Not suitable to plot studies with negative values on a log-scaled chart
  private drawNumericHistogramStudy(column: Column, color: string): void {
    let values: any[] = column.values;
    if (this._isLogScale) values = values.map(value => Math.log10(value));
    let x: number = this.minX - this.width / 2 - this.separation / 2;
    let y: number;
    let height: number;
    const width: string = (this.width + this.separation).toString();
    const rectangleChartData: RectangleChartData = new RectangleChartData(color, width, Array(values.length));
    for (let i = 0; i < values.length; i++) {
        if (values[i] < 0) {
            y = this.maxY * this.dy;
            height = -values[i] * this.dy;
        }
        else {
            y = (this.maxY - values[i]) * this.dy;
            height = values[i] * this.dy;
        }
        rectangleChartData.rectangleData[i] = new RectangleData(x.toString(), y.toString(), height.toString());
        x += this.width + this.separation;
    }
    this.rectangleChartData.push(rectangleChartData); 
  }
  // Not suitable to plot studies with negative values on a log-scaled chart
  private drawNumericLineStudy(column: Column, color: string): void {
    let values: any[] = column.values;
    // Skip null values
    let startIndex: number = 0;
    while (values[startIndex] === null) startIndex++;
    if (this._isLogScale) values = values.map(value => Math.log10(value));
    let x1: number = this.minX + (this.width + this.separation) * startIndex; 
    let x2: number = x1 + this.width + this.separation;
    let y1: number = (this.maxY - values[startIndex]) * this.dy;
    let y2: number;
    // Array size without requiring space for the null values and one less because it's a line chart (N datapoints yield N - 1 lines)
    const lineChartData: LineChartData = new LineChartData(color, Array(values.length - startIndex - 1));
    let lineDataIndex: number = 0;
    for (let i = startIndex + 1; i < values.length; i++, lineDataIndex++) {
        y2 = (this.maxY - values[i]) * this.dy;
        lineChartData.lineData[lineDataIndex] = new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString());
        x1 = x2;
        x2 += this.width + this.separation;
        y1 = y2;
    }
    this.lineChartData.push(lineChartData); 
  }
  private getMaxValue(): number {
    if (this._chartData.length === 0) return 0;
    let maxValue: number = Number.NEGATIVE_INFINITY;
    this._chartData.forEach((chartData: ChartData) => {
      if (chartData.yValues instanceof Column)
        maxValue = Math.max(maxValue, chartData.maxValue);
      else if (chartData.yValues instanceof Parameter) {
        const parameter: Parameter = chartData.yValues as Parameter;
        maxValue = Math.max(maxValue, parameter.value);
      }
    });
    return maxValue;
  }
  private getMinValue(): number {
    if (this._chartData.length === 0) return 0;
    let minValue: number = Number.POSITIVE_INFINITY;
    this._chartData.forEach((chartData: ChartData) => {
      if (chartData.yValues instanceof Column)
        minValue = Math.min(minValue, chartData.minValue);
      else if (chartData.yValues instanceof Parameter) {
        const parameter: Parameter = chartData.yValues as Parameter;
        minValue = Math.min(minValue, parameter.value);
      }
    });
    return minValue;
  }
  private createAdditionalChartGridAndSetLabels(): void {
    // Get the minimum and maximum value to plot for this chart
    this.maxY = this.getMaxValue();
    this.minY = this.getMinValue();
    // Get the grid levels for the Y-axis
    const linearScale: number[] = this.getStudyGridYLevels();
    // If the grids calculated fall below or above the max and min, then adjust the values
    if (linearScale[0] < this.minY) this.minY = linearScale[0];
    if (linearScale[linearScale.length - 1] > this.maxY) this.maxY = linearScale[linearScale.length - 1];
    const margin: number = (this.maxY - this.minY) * 0.05;
    this.maxY += margin;
    this.minY -= margin;
    this.dy = this.mainSvgRef.nativeElement.clientHeight / (this.maxY - this.minY);
    // Set the grid data for Y-axis
    this.gridYData = Array(linearScale.length);
    this.yAxisLegends = Array(linearScale.length);
    const x1: string = '0';
    const x2: string = this.mainSvgRef.nativeElement.clientWidth.toString();
    for (let i = 0; i < linearScale.length; i++) {
        const y: string = ((this.maxY - linearScale[i]) * this.dy).toString();
        this.gridYData[i] = new LineData(x1, y, x2, y);
        this.yAxisLegends[i] = new YAxisLegend(y, linearScale[i].toString());
    }
    // Create the X-axis grid
    let separation = Math.floor(this.getDatapointsLength() / (this.gridLineNum - 1));
    let lineArray: LineData[] = Array(this.gridLineNum);
    let currentXPos = this.minX;
    const y1: string = '0';
    const y2: string = this.mainSvgRef.nativeElement.clientHeight.toString();
    for (let i = 0; i < this.gridLineNum; i++) {
        let currentXPosAsString = currentXPos.toString();
        lineArray[i] = new LineData(currentXPosAsString, y1, currentXPosAsString, y2);
        currentXPos += separation * (this.width + this.separation);
    }
    this.gridXData = lineArray;
  }
  // Choose a linear scale for the graph
  // https://stackoverflow.com/questions/326679/choosing-an-attractive-linear-scale-for-a-graphs-y-axis
  private getStudyGridYLevels(): number[] {
    // How to choose a linear s
    let range: number = this.maxY - this.minY;
    // Divided by 5 to get that number of divisions
    let tick: number = range / 5;
    let factor: number = 0;
    // Fit the range value between 0.1 and 1.0, and store the 10^x factor used to get there.
    while (tick < 0.1) {
      tick *= 10;
      factor--;
    }
    while (tick > 1) {
      tick /= 10;
      factor++;
    }
    // Fit the tick size into the apropriate category and adjust it
    if (tick >= 0.1 && tick < 0.15) tick = 0.1;
    else if (tick <= 0.2) tick = 0.2;
    else if (tick <= 0.25) tick = 0.25;
    else if (tick <= 0.3) tick = 0.3;
    else if (tick <= 0.4) tick = 0.4;
    else if (tick <= 0.5) tick = 0.5;
    else if (tick <= 0.6) tick = 0.6;
    else if (tick <= 0.7) tick = 0.7;
    else if (tick <= 0.75) tick = 0.75;
    else if (tick <= 0.8) tick = 0.8;
    else if (tick <= 0.9) tick = 0.9;
    else if (tick <= 1.0) tick = 1.0;
    tick *= Math.pow(10, factor);
    let lowerBound: number = tick * Math.round(this.minY / tick);
    let upperBound: number = tick * Math.round(this.maxY / tick);
    const linearScale: number[] = [];
    while (lowerBound <= upperBound) {
      linearScale.push(lowerBound);
      lowerBound += tick;
    }
    return linearScale;
  }
}