/**
 * 날짜형식을 특정 포맷으로 변경하여 보여준다.
 */
Date.prototype.dateFormat = function(f) {
    if (!this.valueOf()) return " ";
    if (!f) return this;

    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
        shortWeekName = ["일", "월", "화", "수", "목", "금", "토"],
        d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        let h = 0

        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "e": return shortWeekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};
String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};
String.prototype.dateFormat = function(f) {
    var d = new Date(this);
    return ( d == 'Invalid Date') ? '' : d.dateFormat(f);
}

/**
 * 파일 용량을 사람이 읽기 좋은 형태로 변환한다.
 */
global.sizeFormat = (bytes) => {
    const thresh = 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = ['Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
    let u = -1;
    const r = 10**1;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(1) + ' ' + units[u];
}

/**
 * IP주소를 숫자로 변환한다.
 */
global.ip2long = (ip) => {
    const multipliers = [0x1000000, 0x10000, 0x100, 1];

    let longValue = 0;
    ip.split('.').forEach(function(part, i) {longValue += part * multipliers[i];});
    return longValue;
}

/**
 * 숫자형태를 IP로 변환한다.
 */
global.long2ip = (longValue) => {
    const multipliers = [0x1000000, 0x10000, 0x100, 1];

    return multipliers.map(function(multiplier) {
        return Math.floor((longValue % (multiplier * 0x100)) / multiplier);
    }).join('.');
}