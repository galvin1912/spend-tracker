export const convertCurrency = (value) => {
  const numValue = Number(value);
  if (isNaN(numValue) || !isFinite(numValue)) {
    return "0₫";
  }
  return `${numValue.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}₫`;
};

export const convertShorterCurrency = (value) => {
  const numValue = Number(value);
  if (isNaN(numValue) || !isFinite(numValue)) {
    return "0";
  }
  if (numValue >= 1000000000) {
    return `${(numValue / 1000000000).toFixed(1)}B`;
  } else if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M`;
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(1)}K`;
  } else if (numValue < -1000000000) {
    return `-${(-numValue / 1000000000).toFixed(1)}B`;
  } else if (numValue < -1000000) {
    return `-${(-numValue / 1000000).toFixed(1)}M`;
  } else if (numValue < -1000) {
    return `-${(-numValue / 1000).toFixed(1)}K`;
  }
  return numValue.toString();
};

export const numberWithCommas = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
