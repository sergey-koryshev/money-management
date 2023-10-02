export function Shade(color: string, amount: number) {
  var num = parseHexColor(color);

  var red = limitInt(getByte(num, 2) + amount);
  var green = limitInt(getByte(num, 1) + amount);
  var blue = limitInt(getByte(num) + amount);

  return (color[0] == "#" ? color[0] : "") + (blue | (green << 8) | (red << 16)).toString(16);
}

function parseHexColor(color: string) {
  if (color[0] == "#") {
    color = color.slice(1);
  }
  return parseInt(color, 16);
}

function getByte(num: number, byteNumber: number = 0) {
  return (num >> (8 * byteNumber)) & 0xFF;
}

function limitInt(num: number, limit: number = 255) {
  if (num > limit) {
    return limit;
  } else if (num < 0) {
    return 0;
  }
  return num;
}
