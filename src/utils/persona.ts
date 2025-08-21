export function hashNameToIndex(name: string, maxValue: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % maxValue;
}

export function getPersonaForRecipient(
  recipientName: string,
  recipientGender: string,
  personaVariants: ComponentNode[]
): ComponentNode | null {
  // Filter variants by gender
  const genderKey = recipientGender.charAt(0).toUpperCase() + recipientGender.slice(1);
  const genderVariants = personaVariants.filter((v) => v.name.includes(genderKey));

  if (genderVariants.length === 0) return null;

  // Use name hash to consistently select a persona
  const index = hashNameToIndex(recipientName, genderVariants.length);
  return genderVariants[index];
}
