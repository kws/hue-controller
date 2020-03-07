import convertColor from "color-convert";
import parseColor from "parse-color";

const MIN_OFFSET = 90;

/**
 * Ensure random color is sufficiently different from previous one
 * @param prevValue
 * @returns {number}
 */
const random = prevValue => {
    let diff = 0;
    let hsv = 0;
    while (diff < MIN_OFFSET) {
        hsv = Math.floor(Math.random() * 360);
        diff = prevValue >= 0 ? Math.abs(prevValue - hsv) : MIN_OFFSET;
    }
    return hsv;
};

/**
 * Returns a random value that is either sufficiently different that the previous,
 * or otherwise snap to the same value
 * @param prevValue
 * @returns {number}
 */
const randomSnapToSame = prevValue => {
    const hsv = Math.floor(Math.random() * 360);
    const diff = prevValue >= 0 ? Math.abs(prevValue - hsv) : MIN_OFFSET;
    return diff < MIN_OFFSET ? prevValue : hsv;
};

/**
 * Parse an array and return color values instead
 * @param array
 * @return {*[]}
 */
const generateColors = (array) => {
    const newColors = new Array(array.length);
    for (let index = 0; index < array.length; index++) {
        let currentValue = array[index];
        if (currentValue === 'random') {
            const hsv = randomSnapToSame(index === 0 ? -1 : newColors[index - 1]);
            currentValue = '#' + convertColor.hsv.hex(hsv, 100, 100);
        } else if (currentValue.startsWith('offset')) {
            const prevColor = parseColor(index === 0 ? '#000' : newColors[index - 1]);
            let hsv = prevColor.hsv[0];
            let offset = 360 / array.length;
            if (currentValue.length > 6) {
                offset = parseInt(currentValue.substring(6));
            }
            hsv += offset;
            hsv = hsv >= 360 ? hsv - 360 : hsv;
            currentValue = '#' + convertColor.hsv.hex(hsv, 100, 100);
        }
        newColors[index] = currentValue;
    }
    return newColors.map(c => parseColor(c));
};

export { generateColors }