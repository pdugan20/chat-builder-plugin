function cleanAndParseJSON(text) {
  const cleanedText = text.replace(/```json|```/g, '');
  return JSON.parse(cleanedText);
}

export default cleanAndParseJSON;
