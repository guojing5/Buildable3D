export interface SeparationDistanceState {
    separationLine: {
        length: number;
    }
}

export interface ADUState {
    adu: {
        length: number;
        width: number;
        area: number;
        perimeter: number;
        validation?: {
            angularPlane: boolean;
            height: boolean;
            length: boolean;
            separation: boolean;
            setback: boolean;
            width: boolean;
        }
    }
}

export interface MaxSuiteState {
    maxSuite: {
        area: number;
        perimeter: number;
        length: number;
        width: number;
    }
}

export interface SetbackState {
    setbacks: {
        rear: number;
    }
}