function hashNameToIndex(name: string, maxValue: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 2147483647; // Use multiplication instead of bitwise
  }
  return Math.abs(hash) % maxValue;
}

// Cache to track persona assignments per chat session
const personaAssignmentCache = new Map<string, ComponentNode>();
const usedPersonas = new Set<string>();

export function clearPersonaCache(): void {
  personaAssignmentCache.clear();
  usedPersonas.clear();
}

export default function getPersonaForRecipient(
  recipientName: string,
  recipientGender: string,
  personaVariants: ComponentNode[]
): ComponentNode | null {
  // Check if we already assigned a persona to this recipient
  const cacheKey = `${recipientName}-${recipientGender}`;
  if (personaAssignmentCache.has(cacheKey)) {
    return personaAssignmentCache.get(cacheKey)!;
  }

  // Filter variants by gender
  const genderKey = recipientGender.charAt(0).toUpperCase() + recipientGender.slice(1);
  const genderVariants = personaVariants.filter((v) => v.name.includes(genderKey));

  if (genderVariants.length === 0) return null;

  // Find available personas (not yet used)
  const availableVariants = genderVariants.filter((v) => !usedPersonas.has(v.id));

  // If all personas are used, fall back to all gender variants
  const variantsToChooseFrom = availableVariants.length > 0 ? availableVariants : genderVariants;

  // Use name hash to select from available personas
  const index = hashNameToIndex(recipientName, variantsToChooseFrom.length);
  const selectedVariant = variantsToChooseFrom[index];

  // Track this assignment
  personaAssignmentCache.set(cacheKey, selectedVariant);
  usedPersonas.add(selectedVariant.id);

  return selectedVariant;
}
