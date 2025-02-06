import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { PriceHistoryDto } from "../dtos/priceHistoryDto";
import { TimeframeData } from "../multi-chart/timeframe-selector/timeframe-selector.component";
import { Study } from "../data-models/study.model";
import { StudiesDto } from "../dtos/studiesDto";

@Injectable({
    providedIn: 'root'
})
export class DataFetcherService {
    private baseUrl: string = "http://localhost:5154"

    constructor(private httpClient: HttpClient) { }

    getPriceHistory(symbol: string, timeframeData: TimeframeData): Observable<PriceHistoryDto> {
        const params = new URLSearchParams({
            periodType: timeframeData.periodType,
            period: timeframeData.period.toString(),
            frequencyType: timeframeData.frequencyType,
            frequency: timeframeData.frequency.toString()
        });
        return this.httpClient.get<PriceHistoryDto>(`${this.baseUrl}/pricehistory/${symbol}?${params}`);
    }

    getStudies(symbol: string, timeframeData: TimeframeData, studies: Study[]): Observable<StudiesDto> {
        let studiesData: {"type": string, "parameters": any}[] = [];
        studies.forEach((study) => {
            let parameterMap: {[key: string]: string} = {};
            study.parameters.forEach((parameter) => {
                parameterMap[parameter.info.camelCaseName] = parameter.value.toString();
            });
            studiesData.push({"type": study.name, "parameters": parameterMap});
        });
        const body = {
            "marketData": {
                "symbol": symbol,
                "periodType": timeframeData.periodType,
                "period": timeframeData.period,
                "frequencyType": timeframeData.frequencyType,
                "frequency": timeframeData.frequency
            },
            "studies": studiesData
        };
        return this.httpClient.post<StudiesDto>(`${this.baseUrl}/studies`, body);
    }
}