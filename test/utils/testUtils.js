
export function removeWhiteSpace(str) {
	return str.replace(/\s/g, ' ').replace(/ +(?= )/g, '');
}
