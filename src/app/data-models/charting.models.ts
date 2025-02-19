import { Column } from "./column.model";

export class XAxisLegend {
    constructor(public x: string, public text: string) { }
}
export class YAxisLegend {
    constructor(public y: string, public text: string) { }
}
export class CircleData {
    constructor(public cx: string, public cy: string) { }
}
export class LineData {
    constructor(public x1: string, public y1: string, public x2: string, public y2: string) { }
}
export class PolygonData {
    constructor(public points: string) { }
}
export class RectangleData {
    constructor(public x: string, public y: string, public height: string) { }
}
export class CandlestickChartData {
    constructor(
        public width: number = 0,
        public upBodies: RectangleData[] = [],
        public downBodies: RectangleData[] = [],
        public neutralBodies: LineData[] = [],
        public upWicks: LineData[] = [],
        public downWicks: LineData[] = [],
        public neutralWicks: LineData[] = []) { }
}
export class PriceLineChartData {
    constructor(public upLines: LineData[] = [], public downLines: LineData[] = [], public neutralLines: LineData[] = []) {}
}
export class PriceBarChartData extends PriceLineChartData {
    constructor(upLines: LineData[] = [], downLines: LineData[] = [], neutralLines: LineData[] = []) {
        super(upLines, downLines, neutralLines);
    }
}
export class CircleChartData {
    constructor(public color: string = '#000000', public r: string, public circleData: CircleData[] = []) { }
}
export class LineChartData {
    constructor(public color: string = '#000000', public lineData: LineData[] = []) { }
}
export class PolygonChartData {
    constructor(public color: string = '#000000', public polygonData: PolygonData[] = []) { }
}
export class RectangleChartData {
    constructor(public color: string = '#000000', public width: string = '0', public rectangleData: RectangleData[] = []) { }
}
export class ChartDescriptionData {
    constructor(public text: string, public color: string) {}
}