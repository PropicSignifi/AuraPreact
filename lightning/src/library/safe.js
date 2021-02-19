export function $get(key) {
    return window.$A ? window.$A.get(key) : key;
}
