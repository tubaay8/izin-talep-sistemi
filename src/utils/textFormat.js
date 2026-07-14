function toTitleCaseTR(str) {
  if (!str) return str;
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => {
      if (!word) return word;
      const first = word.charAt(0).toLocaleUpperCase('tr-TR');
      const rest = word.slice(1).toLocaleLowerCase('tr-TR');
      return first + rest;
    })
    .join(' ');
}

module.exports = { toTitleCaseTR };
