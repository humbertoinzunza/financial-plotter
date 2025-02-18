export enum PriceChartType {
    Bar = 'Bar',
    Candle = 'Candle',
    Line = 'Line'
}

export enum BooleanChartType {
    ArrowDownAtHigh = 'ArrowDownAtHigh',
    ArrowUpAtLow = 'ArrowUpAtLow'
}

export enum ConstantChartType {
    Dot = 'Dot',
    Line = 'Line'
}

export enum NumericChartType {
    Bar = 'Bar',
    Dot = 'Dot',
    Histogram = 'Histogram',
    Line = 'Line'
}

export enum ChartValueType {
    Boolean,
    Constant,
    Numeric
}

export enum ParameterType {
    Decimal,
    Enum,
    Integer,
    String
}
// Input types: numeric integer, numeric decimal, color picker, enum