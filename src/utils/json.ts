function cleanAndParseJSON(text: string) {
  try {
    // eslint-disable-next-line no-console
    console.log('Raw API response:', text);

    const start = text.indexOf('[') !== -1 ? text.indexOf('[') : text.indexOf('{');
    const end = text.lastIndexOf(']') !== -1 ? text.lastIndexOf(']') + 1 : text.lastIndexOf('}') + 1;

    if (start === -1 || end === -1) {
      throw new Error('No valid JSON found in response');
    }

    const jsonString = text.substring(start, end);
    // eslint-disable-next-line no-console
    console.log('Extracted JSON string:', jsonString);

    const parsed = JSON.parse(jsonString);
    // eslint-disable-next-line no-console
    console.log('Parsed data:', parsed);

    if (!parsed || (typeof parsed !== 'object' && !Array.isArray(parsed))) {
      throw new Error('Invalid JSON structure in response');
    }

    return parsed;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse JSON response: ${error.message}`);
    }
    throw new Error('Failed to parse JSON response');
  }
}

export default cleanAndParseJSON;
