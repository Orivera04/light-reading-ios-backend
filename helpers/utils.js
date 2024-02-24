
const dehumanizeString = (string) => {
  return string.toLowerCase().replace(/ /g, '_');
}

module.exports = {
  dehumanizeString
}