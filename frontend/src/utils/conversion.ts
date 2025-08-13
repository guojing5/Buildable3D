export function SquareMeterToSquareFeet(squareMeter: number): number {
    return squareMeter * 3.28084 * 3.28084;
}

export function SquareFeetToSquareMeter(squareFeet: number): number {
    return squareFeet / 3.28084 / 3.28084;
}

export function RoundToDecimal(num: number, decimal: number): number {
    return Math.round(num * Math.pow(10, decimal)) / Math.pow(10, decimal);
}