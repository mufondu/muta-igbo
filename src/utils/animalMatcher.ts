import type { AnimalId } from '../components/illustrations/AnimalIllustration';

const ANIMAL_ALIASES: Record<AnimalId, string[]> = {
  dog: ['dog', 'nkita'],
  cat: ['cat', 'pusi', 'nwamba'],
  chicken: ['chicken', 'hen', 'rooster', 'okuko', 'ọkụkọ'],
  goat: ['goat', 'ewu'],
  fish: ['fish', 'azu', 'azụ'],
  bird: ['bird', 'birds', 'nnunu', 'ụmụ nnunu', 'umu nnunu'],
  leopard: ['leopard', 'agu', 'agụ'],
  lion: ['lion', 'odum', 'ọdụm'],
  elephant: ['elephant', 'enyi'],
  rabbit: ['rabbit', 'oke bekee'],
  rat: ['rat', 'oke'],
  python: ['python', 'eke'],
  tortoise: ['tortoise', 'turtle', 'mbe'],
  grasshopper: ['grasshopper', 'igurube'],
};

export function findAnimalIdFromText(...values: Array<string | undefined | null>): AnimalId | null {
  const haystack = values
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .normalize('NFC');

  if (!haystack.trim()) return null;

  for (const [animalId, aliases] of Object.entries(ANIMAL_ALIASES) as Array<[AnimalId, string[]]>) {
    if (aliases.some(alias => haystack.includes(alias.toLowerCase().normalize('NFC')))) {
      return animalId;
    }
  }

  return null;
}

export { ANIMAL_ALIASES };
