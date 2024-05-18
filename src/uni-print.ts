function fixedHex(number: number, length: number) {
  var str = number.toString(16).toUpperCase();
  while (str.length < length) str = "0" + str;
  return str;
}

/* Creates a unicode literal based on the string */
function uniPrint(str: string): string {
  var i;
  var result = "";
  for (i = 0; i < str.length; ++i) {
    /* You should probably replace this by an isASCII test */
    if (str.charCodeAt(i) > 126 || str.charCodeAt(i) < 32)
      result += "\\u" + fixedHex(str.charCodeAt(i), 4);
    else result += str[i];
  }

  return result;
}

export default uniPrint;
