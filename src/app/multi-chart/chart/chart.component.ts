import {
  Component,
  ElementRef,
  Input,
  ViewChild
 } from '@angular/core';
import {
  CandlestickChartData,
  LineData,
  PriceBarChartData,
  PriceLabelData,
  PriceLineChartData,
  StudyRectangleChartData,
  StudyCircleChartData,
  StudyLineChartData
} from '../../shared/charting.service';

@Component({
    selector: 'chart',
    imports: [],
    templateUrl: './chart.component.html',
    styleUrl: './chart.component.css',
    providers: []
})
export class ChartComponent {
  @ViewChild('mainSvg', {static: true}) mainSvgRef!: ElementRef;

  public gridXData: LineData[] = [];
  public gridYData: LineData[] = [];
  public priceLabelData: PriceLabelData[] = [];
  public priceBarChartData: PriceBarChartData = new PriceBarChartData();
  public priceLineChartData: PriceBarChartData = new PriceLineChartData();
  public candlestickChartData: CandlestickChartData = new CandlestickChartData();
  // For all studies assigned to this chart, even the constant values
  public studyCircleData: StudyCircleChartData[] = [];
  public studyLineData: StudyLineChartData[] = [];
  public studyRectangleData: StudyRectangleChartData[] = [];
  public maxY: number = 0;
  public minY: number = 0;
  public dy: number = 0;

  @Input() uptickColor: string = 'green';
  @Input() downtickColor: string = 'red';
  @Input() notickColor: string = 'gray';
}