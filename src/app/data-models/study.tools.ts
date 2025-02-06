import { MovingAverage } from "./studies/movingAverage";
import { RelativeStrengthIndex } from "./studies/relativeStrengthIndex";
import { AvailableStudies } from "./study.enums";
import { Study } from "./study.model";

export function getDefaultStudy(studyType: AvailableStudies): Study {
    switch(studyType) {
        case AvailableStudies.MovingAverage:
            return new MovingAverage();
        case AvailableStudies.RelativeStrengthIndex:
            return new RelativeStrengthIndex();
        default:
            throw new Error(`The study ${studyType} has not been implemented.`);
    }
}