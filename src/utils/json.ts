function cleanAndParseJSON(text: string) {
  try {
    const start = text.indexOf('[') !== -1 ? text.indexOf('[') : text.indexOf('{');
    const end = text.lastIndexOf(']') !== -1 ? text.lastIndexOf(']') + 1 : text.lastIndexOf('}') + 1;

    if (start === -1 || end === -1) {
      throw new Error('No valid JSON found');
    }

    const jsonString = text.substring(start, end);
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
}

export default cleanAndParseJSON;
