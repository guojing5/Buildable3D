export function GetBuildingTypeText(type: string) {
    const map: any = {
        'detached': 'Detached House',
        'triplex': 'Triplex',
        'semidetached': 'Semi-detached House',
        'fourplex': 'Fourplex',
        'duplex': 'Duplex',
        'townhouse': 'Townhouse'
    };
    return map[type];
}

export function GetAdditionBuildingType(type: string) {
    const map: any = {
        'detachedgarage': 'Detached garage',
        'lanewaysuite': 'Laneway Suite'
    };
    return map[type];
}