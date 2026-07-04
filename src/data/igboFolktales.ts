import type { AnimalId } from '../utils/animalMatcher';

export type IgboFolktale = {
  id: string;
  title: string;
  subtitle: string;
  animal: AnimalId;
  character: string;
  moral: string;
  story: string;
};

export const IGBO_FOLKTALES: IgboFolktale[] = [
  {
    id: 'mbe-sky-feast',
    title: 'Mbe and the Sky Feast',
    subtitle: 'A clever tortoise learns about greed.',
    animal: 'tortoise',
    character: 'Mbe',
    moral: 'Share with others and do not trick your friends.',
    story: 'Mbe heard that the birds were going to a feast in the sky. He borrowed feathers from them and gave himself a big name. At the feast, he tried to take more than his share. When the birds discovered his trick, they took back their feathers. Mbe learned that cleverness without kindness can bring trouble.',
  },
  {
    id: 'odum-and-mbe',
    title: 'Ọdụm and Mbe',
    subtitle: 'Strength meets wisdom in the forest.',
    animal: 'lion',
    character: 'Ọdụm',
    moral: 'Wisdom can be stronger than force.',
    story: 'Ọdụm was proud of his power and believed every animal should fear him. Mbe did not fight him with strength. Instead, Mbe used patience and wise words to escape danger. The forest learned that a calm mind can solve what strong muscles cannot.',
  },
  {
    id: 'nkita-and-ewu',
    title: 'Nkịta and Ewu',
    subtitle: 'A dog and goat learn about trust.',
    animal: 'goat',
    character: 'Ewu',
    moral: 'Good friends keep their promises.',
    story: 'Nkịta and Ewu agreed to help each other find food. When Ewu found fresh leaves, he forgot his promise and ate alone. Later, when trouble came, he wished he had treated his friend better. From then on, he learned that friendship grows when promises are kept.',
  },
  {
    id: 'nnunu-and-azu',
    title: 'Nnụnụ and Azụ',
    subtitle: 'Two friends learn that gifts are different.',
    animal: 'bird',
    character: 'Nnụnụ',
    moral: 'Everyone has a special gift.',
    story: 'Nnụnụ could fly high above the trees, and Azụ could swim deep in the river. Each one wished to be like the other. After trying and failing, they laughed and understood that their gifts were different, but both were beautiful.',
  },
  {
    id: 'eke-and-the-drum',
    title: 'Eke and the Village Drum',
    subtitle: 'A python learns when to listen.',
    animal: 'python',
    character: 'Eke',
    moral: 'Listening carefully keeps the community safe.',
    story: 'When the village drum sounded, every animal stopped to listen. Eke ignored the warning and kept moving through the path. Soon he discovered why the drum was speaking. From that day, Eke learned that wise ears can protect the whole village.',
  },
  {
    id: 'agu-and-the-footprints',
    title: 'Agụ and the Footprints',
    subtitle: 'A leopard follows the wrong path.',
    animal: 'leopard',
    character: 'Agụ',
    moral: 'Do not follow every path without thinking.',
    story: 'Agụ saw fresh footprints and followed them quickly, hoping to find an easy meal. The path twisted and turned until he became lost. When he finally returned home, he learned to slow down, think, and choose his path carefully.',
  },
];
