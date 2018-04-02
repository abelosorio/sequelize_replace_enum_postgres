/**
 * Remove white space from string
 *
 * @param {string} str - string
 * @return {string} same string with white space removed
 */
export function removeWhiteSpace(str) {
  return str.replace(/\s/g, ' ').replace(/ +(?= )/g, '');
}
