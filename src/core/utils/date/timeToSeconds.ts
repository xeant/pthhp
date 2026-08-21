const timeToSeconds = (timeStr: string) => {
  const regex = /(\d+)([a-zA-Z]+)/;
  const match = timeStr.match(regex);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s": // 초
      return value;
    case "m": // 분
      return value * 60;
    case "h": // 시간
      return value * 60 * 60;
    case "d": // 일
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
};

export { timeToSeconds };
