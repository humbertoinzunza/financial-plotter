import { Candle } from "../data-models/candle.model";

export interface PriceHistoryDto {
    symbolFound: boolean;
    dataFound: boolean;
    candles: Candle[];
}