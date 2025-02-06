export enum PriceChartType {
    Bar = 'Bar',
    Candle = 'Candle',
    Line = 'Line'
}

export enum BooleanStudyChartType {
    ArrowDownAtHigh = 'ArrowDownAtHigh',
    ArrowUpAtLow = 'ArrowUpAtLow'
}

export enum ConstantStudyChartType {
    Dot = 'Dot',
    Line = 'Line'
}

export enum NumericStudyChartType {
    Bar = 'Bar',
    Dot = 'Dot',
    Histogram = 'Histogram',
    Line = 'Line'
}

export enum StudyValueType {
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