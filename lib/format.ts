export function formatScientific(value: number, precision: number = 3): string {
  if (!isFinite(value)) {
    return value > 0 ? "∞" : "-∞";
  }
  if (value === 0) return "0";

  const absVal = Math.abs(value);

  if (absVal >= 0.001 && absVal < 1000) {
    return value.toFixed(precision);
  }

  const exp = Math.floor(Math.log10(absVal));
  const mantissa = value / Math.pow(10, exp);

  return `${mantissa.toFixed(precision - 1)}e${exp >= 0 ? "+" : ""}${exp}`;
}

export function formatFixed(value: number, decimals: number = 4): string {
  if (!isFinite(value)) {
    return value > 0 ? "∞" : "-∞";
  }
  return value.toFixed(decimals);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function padLeft(str: string, length: number, char: string = " "): string {
  while (str.length < length) {
    str = char + str;
  }
  return str;
}
