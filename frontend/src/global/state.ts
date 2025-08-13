import { AddressSearchResult, AreaValueWithUnit } from "../models/AddressSearchResult";
import { AddressVerifyDetail } from "../models/AddressVerifyDetail";
import { LanewaySuite } from "../models/LanewaySuite";
import { ADU, Buildable } from "../models/ParcelResponse";

export interface PlaceInfo {
    name: string;
    id: string;
    reference: string;
    latitude?: number;
    longitude?: number;
    detail?: AddressSearchResult;
    extraInfo?: AddressVerifyDetail;
    buildable0?: Buildable
    adu0?: ADU
}

export let placeInfo: PlaceInfo | undefined = undefined;

export let lanewaySuites: LanewaySuite[] = [];

export function setLanewaySuites(suites: LanewaySuite[]) {
    lanewaySuites = suites;
}

export function setPlaceInfo(info: PlaceInfo) {
    placeInfo = info;
}

export function setCoordinate(latitude: number, longitude: number) {
    if (!!placeInfo) {
        placeInfo.latitude = latitude;
        placeInfo.longitude = longitude;
    }
}

export function setExtraInfo(extraInfo: AddressVerifyDetail) {
    if (!!placeInfo) {
        placeInfo.extraInfo = extraInfo;
    }
}

export function setArea(area: AreaValueWithUnit) {
    if (!!placeInfo?.extraInfo) {
        placeInfo.extraInfo.mainHouseArea = area;
    }
}

export function setBuildable0(buildable0: Buildable) {
    if (!!placeInfo) {
        placeInfo.buildable0 = buildable0;
    }
}

export function setAdu0(adu0: ADU) {
    if (!!placeInfo) {
        placeInfo.adu0 = adu0;
    }
}