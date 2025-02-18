export class StudyDto {
    constructor(public columns: {name: string, values: any[]}[] = []) { }
}

export class StudiesDto {
    constructor(public symbolFound: boolean, public studies: StudyDto[] = []) {}
}