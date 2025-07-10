import { Transition } from 'framer-motion';

export const maxLengths = {
  title: 100,
  content: 5000,
  list: 50,
};

// Randomly-assigned value in order to identify the default list from the name
export const defaultListName = '2a030440-0f91-455b-a8ee-41dc8dbd3e75';
export const defaultListLabel = 'Default Collection';

export const decoyListId = 'decoy';

export const notesPerPage = 12;

export const repoUrl = 'https://github.com/Oded2/Ninja-Notes/';

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};
