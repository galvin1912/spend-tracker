export const convertCurrency = (value) => {
  return `${value.toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}₫`;
};

export const convertShorterCurrency = (value) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else if (value < -1000000000) {
    return `-${(-value / 1000000000).toFixed(1)}B`;
  } else if (value < -1000000) {
    return `-${(-value / 1000000).toFixed(1)}M`;
  } else if (value < -1000) {
    return `-${(-value / 1000).toFixed(1)}K`;
  }
  return value;
};

export const numberWithCommas = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
