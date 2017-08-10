export function isObject(value: any) {
    return Object.prototype.toString.call(value).slice(8, -1) === "Object";
}
