import { AreaValueWithUnit } from "./AddressSearchResult";

export interface AddressVerifyDetail {
    buildingType: string;
    storey: number;
    hasFinishedBasement: boolean;
    otherExistingBuildings: string[];
    mainHouseArea: AreaValueWithUnit | undefined;
}