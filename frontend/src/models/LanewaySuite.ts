export interface LanewaySuite {
    propertyId: string;
    language: string;
    name: string;
    studioName: string;
    priceStarting: Price;
    size: ValueWithUnit;
    bed: number;
    bath: number;
    description: string;
    features: string[];
    featuresSustainability: string[];
    financialIncentive: string[];
    aduModelInfo: AduModelInfo
}

export interface Price {
    amount: number;
    currency: string;
}

export interface ValueWithUnit {
    value: number;
    unit: string;
}

export interface AduModelInfo {
    data: string;
    type: string;
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    scale: number;
    height: number;
    length: number;
    width: number;
    wedge: boolean;
    isDefault?: boolean;
}