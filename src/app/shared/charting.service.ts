import { BooleanStudyChartType, ConstantStudyChartType, NumericStudyChartType, PriceChartType, StudyValueType } from "../data-models/charting.enums";
import { MarketData } from "../data-models/market-data.model";
import { ChartStyleData, Parameter, Study } from "../data-models/study.model";
import { ChartComponent } from "../multi-chart/chart/chart.component";
import { Column } from "../data-models/column.model";
import { QueryList } from "@angular/core";

export class ChartingService{
    public priceChartComponent!: ChartComponent;
    private _studyChartComponents!: QueryList<ChartComponent>;
    private _upperStudies: Study[] = [];
    private _lowerStudies: Study[] = [];
    private _priceGridLineNum: number = 10;
    private _marketData: MarketData = new MarketData();
    private _priceChartIsLogScale: boolean = true;
    private _priceChartType: PriceChartType = PriceChartType.Candle;
    private minX: number = 0;
    private maxX: number = 0;
    private separation: number = 0;
    private width: number = 0;
    private prevStudyChartNum: number = 0;
    
    get studyChartComponents(): QueryList<ChartComponent> {
        return this._studyChartComponents;
    }
    set studyChartComponents(value: QueryList<ChartComponent>) {
        this._studyChartComponents = value;
        this._studyChartComponents.changes.subscribe(r => this.drawLowerStudies());
    }
    get priceGridLineNum(): number {
        return this._priceGridLineNum;
    }
    set priceGridLineNum(value: number) {
        if (value < 2) value = 2;
        this._priceGridLineNum = value;
    }
    get marketData(): MarketData {
        return this._marketData;
    }
    set marketData(marketData: MarketData) {
        this._marketData = marketData;
        this.draw();
    }
    get priceChartIsLogScale(): boolean {
        return this._priceChartIsLogScale;
    }
    set priceChartIsLogScale(value: boolean) {
        this._priceChartIsLogScale = value;
        this.drawPriceChart();
        this.drawUpperStudies();
    }
    get priceChartType(): PriceChartType {
        return this._priceChartType;
    }
    set priceChartType(value: PriceChartType) {
        this._priceChartType = value;
        this.drawPriceChart();
    }
    get lowerStudies(): Study[] {
        return this._lowerStudies;
    }
    set lowerStudies(value: Study[]) {
        this._lowerStudies = value;
        this.drawLowerStudies();
    }
    get  upperStudies(): Study[] {
        return this._upperStudies;
    }
    set upperStudies(value: Study[]) {
        this._upperStudies = value;
        this.drawUpperStudies();
    }
    public draw(): void {
        this.drawUpperChart();
        this.drawLowerStudies();
    }
    public drawUpperChart(): void {
        if (this.marketData.length == 0) return;
        this.drawPriceChart();
        this.drawUpperStudies();
    }
    private drawPriceChart(): void {
        this.createPriceGridAndSetLabels();
        // Reset values for all chart types in the priceChartComponent
        this.priceChartComponent.priceBarChartData = new PriceBarChartData();
        this.priceChartComponent.candlestickChartData = new CandlestickChartData();
        this.priceChartComponent.priceLineChartData = new PriceLineChartData();
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
    private drawLowerStudies(): void {
        this.createStudyGridAndSetLabels();
        setTimeout(() => {
            this._studyChartComponents.forEach((chartComponent: ChartComponent, index: number) => {
                chartComponent.studyCircleData = [];
                chartComponent.studyLineData = [];
                chartComponent.studyRectangleData = [];
                const currentStudy: Study = this._lowerStudies[index];
                for (let chartStyleIndex: number = 0; chartStyleIndex < currentStudy.chartStyleData.length; chartStyleIndex++) {
                    const currentChartStyle: ChartStyleData = currentStudy.chartStyleData[chartStyleIndex];
                    switch(currentChartStyle.studyValueType) {
                        case (StudyValueType.Boolean):
                            const booleanChartType: BooleanStudyChartType = currentChartStyle.studyChartType as BooleanStudyChartType;
                            if (booleanChartType === BooleanStudyChartType.ArrowDownAtHigh) {
    
                            }
                            else if (booleanChartType === BooleanStudyChartType.ArrowUpAtLow) {
    
                            }
                            break;
                        case (StudyValueType.Constant):
                            const constantChartType: ConstantStudyChartType = currentChartStyle.studyChartType as ConstantStudyChartType;
                            const constantValue: number = (currentChartStyle.value as Parameter).value;
                            if (constantChartType === ConstantStudyChartType.Dot)
                                this.drawConstantDotStudy(constantValue, currentChartStyle.color, chartComponent, false);
                            else if (constantChartType === ConstantStudyChartType.Line)
                                this.drawConstantLineStudy(constantValue, currentChartStyle.color, chartComponent, false);
                            break;
                        case (StudyValueType.Numeric):
                            const numericChartType: NumericStudyChartType = currentChartStyle.studyChartType as NumericStudyChartType;
                            const column: Column = currentChartStyle.value as Column;
                            if (numericChartType === NumericStudyChartType.Bar)
                                this.drawNumericBarStudy(column, currentChartStyle.color, chartComponent, false);
                            else if (numericChartType === NumericStudyChartType.Dot)
                                this.drawNumericDotStudy(column, currentChartStyle.color, chartComponent, false);
                            else if (numericChartType === NumericStudyChartType.Histogram)
                                this.drawNumericHistogramStudy(column, currentChartStyle.color, chartComponent, false);
                            else if (numericChartType === NumericStudyChartType.Line)
                                this.drawNumericLineStudy(column, currentChartStyle.color, chartComponent, false);
                            break;
                    }
                }
            });
        }, 0);
    }
    private drawUpperStudies(): void {
        // Reset study drawings
        this.priceChartComponent.studyLineData = [];
        this.priceChartComponent.studyCircleData = [];
        this.priceChartComponent.studyRectangleData = [];
        for (let studyIndex = 0; studyIndex < this._upperStudies.length; studyIndex++) {
            const currentStudy: Study = this._upperStudies[studyIndex];
            for (let chartStyleIndex = 0; chartStyleIndex < currentStudy.chartStyleData.length; chartStyleIndex++) {
                const currentChartStyle: ChartStyleData = currentStudy.chartStyleData[chartStyleIndex];
                switch(currentChartStyle.studyValueType) {
                    case (StudyValueType.Boolean):
                        const booleanChartType: BooleanStudyChartType = currentChartStyle.studyChartType as BooleanStudyChartType;
                        if (booleanChartType === BooleanStudyChartType.ArrowDownAtHigh) {

                        }
                        else if (booleanChartType === BooleanStudyChartType.ArrowUpAtLow) {

                        }
                        break;
                    case (StudyValueType.Constant):
                        const constantChartType: ConstantStudyChartType = currentChartStyle.studyChartType as ConstantStudyChartType;
                        const constantValue: number = (currentChartStyle.value as Parameter).value;
                        if (constantChartType === ConstantStudyChartType.Dot)
                            this.drawConstantDotStudy(constantValue, currentChartStyle.color, this.priceChartComponent, true);
                        else if (constantChartType === ConstantStudyChartType.Line)
                            this.drawConstantLineStudy(constantValue, currentChartStyle.color, this.priceChartComponent, true);
                        break;
                    case (StudyValueType.Numeric):
                        const numericChartType: NumericStudyChartType = currentChartStyle.studyChartType as NumericStudyChartType;
                        const column: Column = currentChartStyle.value as Column;
                        if (numericChartType === NumericStudyChartType.Bar)
                            this.drawNumericBarStudy(column, currentChartStyle.color, this.priceChartComponent, true);
                        else if (numericChartType === NumericStudyChartType.Dot)
                            this.drawNumericDotStudy(column, currentChartStyle.color, this.priceChartComponent, true);
                        else if (numericChartType === NumericStudyChartType.Histogram)
                            this.drawNumericHistogramStudy(column, currentChartStyle.color, this.priceChartComponent, true);
                        else if (numericChartType === NumericStudyChartType.Line)
                            this.drawNumericLineStudy(column, currentChartStyle.color, this.priceChartComponent, true);
                        break;
                }
            }
        }
    }
    private drawConstantDotStudy(constantValue: number, color: string, chartComponent: ChartComponent, isPriceChart: boolean): void {
        // Since it's a constant value, the graph is simply a line composed of dots
        const radius: string = (this.width / 2).toString();
        let xPos: number = this.minX - this.width / 2;
        if (isPriceChart && this._priceChartIsLogScale) {
            constantValue = Math.log10(constantValue);
        }
        const yPos: string = ((chartComponent.maxY - constantValue) * chartComponent.dy).toString();
        // One dot per market data point
        const circleData: CircleData[] = Array(this.marketData.length);
        for (let i = 0; i < this.marketData.length; i++) {
            circleData[i] = new CircleData(xPos.toString(), yPos);
            xPos += this.width + this.separation;
        }
        // Append the circle data to the list
        chartComponent.studyCircleData.push(new StudyCircleChartData(color, radius, circleData));
    }
    private drawConstantLineStudy(constantValue: number, color: string, chartComponent: ChartComponent, isPriceChart: boolean): void {
        if (isPriceChart && this._priceChartIsLogScale) {
            constantValue = Math.log10(constantValue);
        }
        const yPos = ((chartComponent.maxY - constantValue) * chartComponent.dy).toString();
        // Line data array has one element only, because it's a straight line
        chartComponent.studyLineData.push(new StudyLineChartData(color, [new LineData(this.minX.toString(), yPos, this.maxX.toString(), yPos)]));
    }
    // Not to be used for upper studies
    private drawNumericBarStudy(column: Column, color: string, chartComponent: ChartComponent, isPriceChart: boolean): void {
        let values: any[] = column.values;
        if (isPriceChart && this._priceChartIsLogScale) values = values.map(value => Math.log10(value));
        let x: number = this.minX - this.width / 2;
        let y: number;
        let height: number;
        const studyRectangleChartData: StudyRectangleChartData = new StudyRectangleChartData(color, this.width.toString(), Array(values.length));
        for (let i = 0; i < values.length; i++) {
            if (values[i] < 0) {
                y = chartComponent.maxY * chartComponent.dy;
                height = -values[i] * chartComponent.dy;
            }
            else {
                y = (chartComponent.maxY - values[i]) * chartComponent.dy;
                height = values[i] * chartComponent.dy;
            }
            studyRectangleChartData.rectangleData[i] = new RectangleData(x.toString(), y.toString(), height.toString());
            x += this.width + this.separation;
        }
        chartComponent.studyRectangleData.push(studyRectangleChartData);
    }
    // Not suitable to plot studies with negative values on a log-scaled chart
    private drawNumericDotStudy(column: Column, color: string, chartComponent: ChartComponent, isPriceChart: boolean): void {
        let values: any[] = column.values;
        if (isPriceChart && this._priceChartIsLogScale) values = values.map(value => Math.log10(value));
        let x: number = this.minX - this.width / 2;
        let y: number;
        const radius: string = (this.width / 2).toString();
        const studyCircleChartData: StudyCircleChartData = new StudyCircleChartData(color, radius, Array(values.length));
        for (let i = 0; i < values.length; i++) {
            y = (chartComponent.maxY - values[i]) * chartComponent.dy;
            studyCircleChartData.circleData[i] = new CircleData(x.toString(), y.toString());
            x += this.width + this.separation;
        }
        chartComponent.studyCircleData.push(studyCircleChartData); 
    }
    // Not suitable to plot studies with negative values on a log-scaled chart
    private drawNumericHistogramStudy(column: Column, color: string, chartComponent: ChartComponent, isPriceChart: boolean): void {
        let values: any[] = column.values;
        if (isPriceChart && this._priceChartIsLogScale) values = values.map(value => Math.log10(value));
        let x: number = this.minX - this.width / 2 - this.separation / 2;
        let y: number;
        let height: number;
        const width: string = (this.width + this.separation).toString();
        const studyRectangleChartData: StudyRectangleChartData = new StudyRectangleChartData(color, width, Array(values.length));
        for (let i = 0; i < values.length; i++) {
            if (values[i] < 0) {
                y = chartComponent.maxY * chartComponent.dy;
                height = -values[i] * chartComponent.dy;
            }
            else {
                y = (chartComponent.maxY - values[i]) * chartComponent.dy;
                height = values[i] * chartComponent.dy;
            }
            studyRectangleChartData.rectangleData[i] = new RectangleData(x.toString(), y.toString(), height.toString());
            x += this.width + this.separation;
        }
        chartComponent.studyRectangleData.push(studyRectangleChartData); 
    }
    // Not suitable to plot studies with negative values on a log-scaled chart
    private drawNumericLineStudy(column: Column, color: string, chartComponent: ChartComponent, isPriceChart: boolean): void {
        let values: any[] = column.values;
        // Skip null values
        let startIndex: number = 0;
        while (values[startIndex] === null) startIndex++;
        if (isPriceChart && this._priceChartIsLogScale) values = values.map(value => Math.log10(value));
        let x1: number = this.minX + (this.width + this.separation) * startIndex; 
        let x2: number = x1 + this.width + this.separation;
        let y1: number = (chartComponent.maxY - values[startIndex]) * chartComponent.dy;
        let y2: number;
        // Array size without requiring space for the null values and one less because it's a line chart (N datapoints yield N - 1 lines)
        const studyLineChartData: StudyLineChartData = new StudyLineChartData(color, Array(values.length - startIndex - 1));
        let lineDataIndex: number = 0;
        for (let i = startIndex + 1; i < values.length; i++, lineDataIndex++) {
            y2 = (chartComponent.maxY - values[i]) * chartComponent.dy;
            studyLineChartData.lineData[lineDataIndex] = new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString());
            x1 = x2;
            x2 += this.width + this.separation;
            y1 = y2;
        }
        chartComponent.studyLineData.push(studyLineChartData); 
    }
    private createStudyGridAndSetLabels(): void {
        setTimeout(() => {
            this._studyChartComponents.forEach((currentChartComponent: ChartComponent, index: number) => {
                const currentStudy: Study = this._lowerStudies[index];
                const svgElement: SVGSVGElement = currentChartComponent.mainSvgRef.nativeElement as SVGSVGElement;
                // Get the minimum and maximum value to plot for this study
                currentChartComponent.minY = currentStudy.getMinChartValue();
                currentChartComponent.maxY = currentStudy.getMaxChartValue();
                // Get the grid levels for the Y-axis
                const linearScale: number[] = this.getStudyGridYLevels(currentChartComponent.minY, currentChartComponent.maxY);
                // If the grids calculated fall below or above the max and min, then adjust the values
                if (linearScale[0] < currentChartComponent.minY) currentChartComponent.minY = linearScale[0];
                if (linearScale[linearScale.length - 1] > currentChartComponent.maxY) currentChartComponent.maxY = linearScale[linearScale.length - 1];
                const margin: number = (currentChartComponent.maxY - currentChartComponent.minY) * 0.05;
                currentChartComponent.maxY += margin;
                currentChartComponent.minY -= margin;
                currentChartComponent.dy = svgElement.clientHeight / (currentChartComponent.maxY - currentChartComponent.minY);
                // Set the grid data for Y-axis
                currentChartComponent.gridYData = Array(linearScale.length);
                currentChartComponent.priceLabelData = Array(linearScale.length);
                const x1: string = '0';
                const x2: string = svgElement.clientWidth.toString();
                for (let i = 0; i < linearScale.length; i++) {
                    const y: string = ((currentChartComponent.maxY - linearScale[i]) * currentChartComponent.dy).toString();
                    currentChartComponent.gridYData[i] = new LineData(x1, y, x2, y);
                    currentChartComponent.priceLabelData[i] = new PriceLabelData(y, linearScale[i].toString());
                }
                // Set the data for X-axis
                const y1: string = '0';
                const y2: string = svgElement.clientHeight.toString();
                currentChartComponent.gridXData = Array(this.priceChartComponent.gridXData.length);
                for (let i = 0; i < this.priceChartComponent.gridXData.length; i++) {
                    const x: string = this.priceChartComponent.gridXData[i].x1;
                    currentChartComponent.gridXData[i] = new LineData(x, y1, x, y2);
                }
            });
        }, 0);
    }
    // Choose a linear scale for the graph
    // https://stackoverflow.com/questions/326679/choosing-an-attractive-linear-scale-for-a-graphs-y-axis
    private getStudyGridYLevels(minY: number, maxY: number): number[] {
        // How to choose a linear s
        let range: number = maxY - minY;
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
        let lowerBound: number = tick * Math.round(minY / tick);
        let upperBound: number = tick * Math.round(maxY / tick);
        const linearScale: number[] = [];
        while (lowerBound <= upperBound) {
            linearScale.push(lowerBound);
            lowerBound += tick;
        }
        return linearScale;
    }

    private createPriceGridAndSetLabels(): void {
        const priceSvg: SVGSVGElement = this.priceChartComponent.mainSvgRef.nativeElement as SVGSVGElement;
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
        this.priceChartComponent.minY = Math.min(...low) * 0.98;
        this.priceChartComponent.maxY = Math.max(...high) * 1.02;
        // Smaller margin for the X-axis because there is more space
        this.minX = priceSvg.clientWidth * 0.01;
        this.maxX = priceSvg.clientWidth * 0.99;
        if (this._priceChartIsLogScale) {
            this.priceChartComponent.minY = Math.log10(this.priceChartComponent.minY);
            this.priceChartComponent.maxY = Math.log10(this.priceChartComponent.maxY);
            localMin = Math.log10(localMin);
            localMax = Math.log10(localMax);
        }
        this.priceChartComponent.dy = priceSvg.clientHeight / (this.priceChartComponent.maxY - this.priceChartComponent.minY);
        const horizontalSpace: number = this.maxX - this.minX;
        if (this._priceChartType === PriceChartType.Line)
            this.width = 0;
        else {
            this.width = 3;
            let minGraphWidth: number = this._marketData.length * (this.width + 1); // Min. 3 pixels for each candle plus one pixel for separation
            // Add width to candles if possible
            while (minGraphWidth <= horizontalSpace) {
                minGraphWidth += this._marketData.length * 2;
                this.width += 2;
            }
            if (minGraphWidth > horizontalSpace && this.width > 3) {
                minGraphWidth -= this._marketData.length * 2;
                this.width -= 2;
            }
        }
        this.separation = (horizontalSpace - this._marketData.length * this.width) / this._marketData.length;
        if (this.separation < 1) this.separation = 1;
        // Create the Y-axis Grid
        this.priceChartComponent.priceLabelData = Array(this.priceGridLineNum);
        const x1: string = '0';
        const x2: string = priceSvg.clientWidth.toString();
        let lowest: number = (this.priceChartComponent.maxY - localMin) * this.priceChartComponent.dy;
        let highest: number = (this.priceChartComponent.maxY - localMax) * this.priceChartComponent.dy;
        let separation: number = (highest - lowest) / (this.priceGridLineNum - 1);
        let lineArray: LineData[] = Array(this.priceGridLineNum);
        let currentYPos: number = lowest;
        for (let i = 0; i < this.priceGridLineNum; i++) {
            const currentYPosAsString: string = currentYPos.toString();
            let dollarValue: number = this.priceChartComponent.maxY - currentYPos / this.priceChartComponent.dy;
            if (this._priceChartIsLogScale) dollarValue = Math.pow(10, dollarValue);
            this.priceChartComponent.priceLabelData[i] = new PriceLabelData(currentYPosAsString, dollarValue.toFixed(4));
            lineArray[i] = new LineData(x1, currentYPosAsString, x2, currentYPosAsString);
            currentYPos += separation;
        }
        this.priceChartComponent.gridYData = lineArray;
        // Create the X-axis grid
        lowest = this.minX;
        highest = this.maxX;
        separation = Math.floor(this._marketData.length / (this.priceGridLineNum - 1));
        lineArray = Array(this.priceGridLineNum);
        let currentXPos = lowest;
        const y1: string = '0';
        const y2: string = priceSvg.clientHeight.toString();
        for (let i = 0; i < this.priceGridLineNum; i++) {
            let currentXPosAsString = currentXPos.toString();
            lineArray[i] = new LineData(currentXPosAsString, y1, currentXPosAsString, y2);
            currentXPos += separation * (this.width + this.separation);
        }
        this.priceChartComponent.gridXData = lineArray;
    }

    private plotPriceLineChart(): void {
        let close: number[] = this.marketData.close.values;
        if (this._priceChartIsLogScale) 
            close = close.map((value) => Math.log10(value));
        let x1 = this.minX, x2;
        let y1, y2;
        let prevValue = close[0];
        for (let i = 1; i < this._marketData.length; i++) {
            y1 = (this.priceChartComponent.maxY - prevValue) * this.priceChartComponent.dy;
            x2 = x1 + this.separation;
            y2 = (this.priceChartComponent.maxY - close[i]) * this.priceChartComponent.dy;
            if (prevValue > close[i]) {
                this.priceChartComponent.priceLineChartData.downLines.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString()));
            }
            else if (prevValue < close[i])
                this.priceChartComponent.priceLineChartData.upLines.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString()));
            else
                this.priceChartComponent.priceLineChartData.neutralLines.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString()));
            prevValue = close[i];
            x1 = x2;
        }
    }
    
    private plotPriceBarChart(): void {
        let open: number[] = this.marketData.open.values;
        let high: number[] = this.marketData.high.values;
        let low: number[] = this.marketData.low.values;
        let close: number[] = this.marketData.close.values;
        if (this._priceChartIsLogScale) {
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
                arrayInUse = this.priceChartComponent.priceBarChartData.downLines;
                // Open line
                y1 = (this.priceChartComponent.maxY - open[i]) * this.priceChartComponent.dy;
                x2 = x1 + this.width / 2;
                // Horizontal line, so use the same y value
                arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
                // Close line
                x1 = x2;
                y1 = (this.priceChartComponent.maxY - close[i]) * this.priceChartComponent.dy;
                x2 += this.width / 2;
                // Horizontal line, so use the same y value
                arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
            }
            else if (open[i] < close[i]) {
                arrayInUse = this.priceChartComponent.priceBarChartData.upLines;
                // Open line
                y1 = (this.priceChartComponent.maxY - close[i]) * this.priceChartComponent.dy;
                x2 = x1 + this.width / 2;
                // Horizontal line, so use the same y value
                arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
                // Close line
                x1 = x2;
                y1 = (this.priceChartComponent.maxY - open[i]) * this.priceChartComponent.dy;
                x2 += this.width / 2;
                // Horizontal line, so use the same y value
                arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
            }
            else {
                arrayInUse = this.priceChartComponent.priceBarChartData.neutralLines;
                // Open and close line
                y1 = (this.priceChartComponent.maxY - open[i]) * this.priceChartComponent.dy;
                x2 = x1 + this.width;
                // Horizontal line, so use the same y value
                arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
                x1 += this.width / 2;
            }
            // Middle line
            y1 = (this.priceChartComponent.maxY - high[i]) * this.priceChartComponent.dy;
            y2 = (this.priceChartComponent.maxY - low[i]) * this.priceChartComponent.dy;
            x2 = x1;
            arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString()));
            x1 += this.width / 2 + this.separation;
        }
    }
    
    private plotPriceCandlestickChart(): void {
        let open: number[] = this.marketData.open.values;
        let high: number[] = this.marketData.high.values;
        let low: number[] = this.marketData.low.values;
        let close: number[] = this.marketData.close.values;
        if (this.priceChartIsLogScale) {
            open = open.map((value) => Math.log10(value));
            high = high.map((value) => Math.log10(value));
            low = low.map((value) => Math.log10(value));
            close = close.map((value) => Math.log10(value));
        }
        let x1 = this.minX - this.width / 2, x2;
        let y1, y2;
        let height;
        this.priceChartComponent.candlestickChartData.width = this.width;
        let arrayInUse: LineData[];
        for (let i = 0; i < this._marketData.length; i++) {
            if (open[i] > close[i]) {
                y1 = (this.priceChartComponent.maxY - open[i]) * this.priceChartComponent.dy;
                height = (open[i] - close[i]) * this.priceChartComponent.dy;
                this.priceChartComponent.candlestickChartData.downBodies.push(new RectangleData(x1.toString(), y1.toString(), height.toString()));
                arrayInUse = this.priceChartComponent.candlestickChartData.downWicks;
            }
            else if (open[i] < close[i]) {
                y1 = (this.priceChartComponent.maxY - close[i]) * this.priceChartComponent.dy;
                height = (close[i] - open[i]) * this.priceChartComponent.dy;
                this.priceChartComponent.candlestickChartData.upBodies.push(new RectangleData(x1.toString(), y1.toString(), height.toString()));
                arrayInUse = this.priceChartComponent.candlestickChartData.upWicks;
            }
            else {
                y1 = (this.priceChartComponent.maxY - close[i]) * this.priceChartComponent.dy;
                x2 = x1 + this.width;
                this.priceChartComponent.candlestickChartData.neutralBodies.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y1.toString()));
                arrayInUse = this.priceChartComponent.candlestickChartData.neutralWicks;
            }
            x1 += this.width / 2;
            y1 = (this.priceChartComponent.maxY - high[i]) * this.priceChartComponent.dy;
            x2 = x1;
            y2 = (this.priceChartComponent.maxY - low[i]) * this.priceChartComponent.dy;
            arrayInUse.push(new LineData(x1.toString(), y1.toString(), x2.toString(), y2.toString()));
            x1 += this.width / 2 + this.separation;
        }
    }
}

export class PriceLabelData {
    constructor(public y: string, public text: string) { }
}
export class CircleData {
    constructor(public cx: string, public cy: string) { }
}
export class LineData {
    constructor(public x1: string, public y1: string, public x2: string, public y2: string) { }
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
export class StudyLineChartData {
    constructor(public color: string = '#000000', public lineData: LineData[] = []) { }
}
export class StudyCircleChartData {
    constructor(public color: string = '#000000', public r: string, public circleData: CircleData[] = []) { }
}
export class StudyRectangleChartData {
    constructor(public color: string = '#000000', public width: string = '0', public rectangleData: RectangleData[] = []) { }
}