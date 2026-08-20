// src/hooks/useTitle.tsx

export const useTitle = (title: string) => {
  document.title = `${title} - ESSG Admin`;
};
