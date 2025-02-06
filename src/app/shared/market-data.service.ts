import { Injectable } from "@angular/core";
import { FrequencyType, PeriodType } from "../data-models/market-data.enums";
import { MarketData } from "../data-models/market-data.model";
import { DataFetcherService } from "./data-fetcher.service";
import { Subject } from "rxjs";
import { TimeframeData } from "../multi-chart/timeframe-selector/timeframe-selector.component";
import { Study } from "../data-models/study.model";
import { StudiesDto } from "../dtos/studiesDto";

@Injectable()
export class MarketDataService {
    private _symbol: string = "";
    private _timeframeData: TimeframeData = new TimeframeData(365, PeriodType.Day, 1, FrequencyType.Daily);
    public marketData: MarketData | undefined;
    private _upperStudies: Study[] = [];
    private _lowerStudies: Study[] = [];
    // Subject will notify subscribers of new data fetched
    public newData$: Subject<MarketData> = new Subject<MarketData>();
    // Notify the user of an error. Like symbol not found, or market data not found for the selected timeframe
    public newError$: Subject<string> = new Subject<string>();
    // Notify of new studies
    public newUpperStudies$: Subject<Study[]> = new Subject<Study[]>();
    public newLowerStudies$: Subject<Study[]> = new Subject<Study[]>();

    constructor(private dataFetcherService: DataFetcherService) { }

    get symbol(): string {
        return this._symbol;
    }
    set symbol(symbol: string) {
        this._symbol = symbol;
        this.updateMarketData();
    }
    get periodType(): PeriodType {
        return this._timeframeData.periodType;
    }
    set periodType(periodType: PeriodType) {
        this._timeframeData.periodType = periodType;
        this.updateMarketData();
    }
    get period(): number {
        return this.timeframeData.period;
    }
    set period(period: number) {
        this.timeframeData.period = period;
        this.updateMarketData();
    }
    get frequencyType(): FrequencyType {
        return this.timeframeData.frequencyType;
    }
    set frequencyType(frequencyType: FrequencyType) {
        this.timeframeData.frequencyType = frequencyType;
        this.updateMarketData();
    }
    get frequency(): number {
        return this.timeframeData.frequency;
    }
    set frequency(frequency: number) {
        this.timeframeData.frequency = frequency;
        this.updateMarketData();
    }
    get timeframeData(): TimeframeData {
        return this._timeframeData;
    }
    set timeframeData(timeframeData: TimeframeData) {
        this.timeframeData = timeframeData;
        this.updateMarketData();
    }
    get upperStudies(): Study[] {
        return this._upperStudies;
    }
    set upperStudies(studies: Study[]) {
        this._upperStudies = studies;
        this.updateUpperStudies();
    }
    get lowerStudies(): Study[] {
        return this._lowerStudies;
    }
    set lowerStudies(studies: Study[]) {
        this._lowerStudies = studies;
        this.updateLowerStudies();
    }
    public updateMarketData(): void {
        this.dataFetcherService.getPriceHistory(this._symbol, this._timeframeData)
            .subscribe((priceHistoryDto) => {
                if (!priceHistoryDto.symbolFound) 
                    this.newError$.next('notFound');
                else if (priceHistoryDto.candles.length == 0)
                    this.newError$.next('dataNotFound');
                else {
                    this.marketData = new MarketData(priceHistoryDto.candles);
                    // Notify subscribers that new data is available
                    this.newData$.next(this.marketData);
                    // Update studies
                    this.updateUpperStudies();
                    this.updateLowerStudies();
                }
        });
    }

    public updateUpperStudies(): void {
        if (this._upperStudies.length === 0) {
            this.newUpperStudies$.next(this._upperStudies);
            return;
        }
        this.dataFetcherService.getStudies(this._symbol, this._timeframeData, this._upperStudies)
            .subscribe((studiesDto: StudiesDto) => {
                if (studiesDto.studies.length > 0) {
                    this._upperStudies.forEach((study, index) => {
                        study.setValues(studiesDto.studies[index]);
                    });
                    this.newUpperStudies$.next(this._upperStudies);
                }
        });
    }

    public updateLowerStudies(): void {
        if (this._lowerStudies.length === 0) {
            this.newLowerStudies$.next(this._lowerStudies);
            return;
        }
        this.dataFetcherService.getStudies(this._symbol, this._timeframeData, this._lowerStudies)
            .subscribe((studiesDto : StudiesDto) => {
                if (studiesDto.studies.length > 0) {
                    this._lowerStudies.forEach((study, index) => {
                        study.setValues(studiesDto.studies[index]);
                    });
                    this.newLowerStudies$.next(this._lowerStudies);
                }
        });
    }
}