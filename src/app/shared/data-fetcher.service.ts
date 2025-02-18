import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { EventEmitter, Injectable } from "@angular/core";
import { PriceHistoryDto } from "../dtos/priceHistoryDto";
import { TimeframeData } from "../multi-chart/timeframe-selector/timeframe-selector.component";
import { Study } from "../data-models/study.model";
import { StudiesDto } from "../dtos/studiesDto";
import { HttpRequest,HttpHandlerFn,HttpEvent } from "@angular/common/http";
import { ReportDto } from "../dtos/reportDto";

@Injectable({
    providedIn: 'root'
})
export class DataFetcherService {
    private baseUrl: string = "http://localhost:5154"
    public newReportError: EventEmitter<any> = new EventEmitter<any>();

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
            "symbol": symbol,
            "timeframeData": {
                "periodType": timeframeData.periodType,
                "period": timeframeData.period,
                "frequencyType": timeframeData.frequencyType,
                "frequency": timeframeData.frequency
            },
            "studies": studiesData  
        };
        return this.httpClient.post<StudiesDto>(`${this.baseUrl}/studies`, body);
    }

    getReport(reportType: string, jsonPayload: any): Observable<ReportDto> {
        return this.httpClient.post<any>(`${this.baseUrl}/reports?reportType=${reportType}`, jsonPayload);
    }
}

      

export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {  console.log(req.url);  return next(req);}
