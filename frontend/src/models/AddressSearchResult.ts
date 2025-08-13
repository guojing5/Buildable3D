export interface AddressSearchResult {
    objectId: string;
    name: string;
    zoneCategory: string;
    lotDetail: {
        area: AreaValue;
        frontage: LengthValue;
        depth: LengthValue;
    };
    latitude: number;
    longitude: number;
    adu0: boolean;
    adu1: boolean;
}

export interface AreaValue {
    squareMeter: number;
    squareFoot: number;
}

export interface AreaValueWithUnit {
    value: number;
    unit: string;
}

export interface LengthValue {
    meter: number;
    foot: number;
}