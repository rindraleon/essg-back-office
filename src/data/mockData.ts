export const categories = [
  'Annonce',
  'Événement',
  'Formation',
  'Partenariat',
  'Publication',
  'Actualité générale',
];

export const statuts = [
  { value: 'publie', label: 'Publié' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'archive', label: 'Archivé' },
];

export const postes = [
  'Directeur',
  'Enseignant',
  'Administratif',
  'Technicien',
  'Responsable',
  'Autre',
];

export const initialActualites: ActualiteItem[] = [
  {
    id: '1',
    titre: 'Lancement du nouveau programme de formation',
    contenu:
      "Nous sommes ravis d'annoncer le lancement de notre nouveau programme de formation professionnelle destiné aux jeunes entrepreneurs. Ce programme vise à renforcer les capacités des jeunes dans le domaine de l'entrepreneuriat et de la gestion d'entreprise.",
    categorie: 'Formation',
    auteur: 'Jean Dupont',
    date: '2024-01-15',
    statut: 'publie',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  },
  {
    id: '2',
    titre: "Partenariat stratégique avec l'ONG Internationale",
    contenu:
      "L'ESSG a signé un partenariat stratégique avec une ONG internationale pour renforcer ses actions sur le terrain. Ce partenariat permettra d'étendre nos interventions et d'avoir un impact plus significatif dans nos communautés.",
    categorie: 'Partenariat',
    auteur: 'Marie Curie',
    date: '2024-01-20',
    statut: 'publie',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
  },
  {
    id: '3',
    titre: 'Événement annuel de collecte de fonds',
    contenu:
      'Rejoignez-nous pour notre événement annuel de collecte de fonds qui aura lieu le 15 février 2024. Cet événement est une occasion unique de soutenir nos actions et de rencontrer notre équipe et nos bénéficiaires.',
    categorie: 'Événement',
    auteur: 'Pierre Martin',
    date: '2024-02-01',
    statut: 'brouillon',
  },
  {
    id: '4',
    titre: 'Publication du rapport annuel 2023',
    contenu:
      "Nous sommes heureux de vous présenter notre rapport annuel 2023 qui retrace toutes nos actions et réalisations de l'année écoulée. Ce rapport témoigne de l'engagement de notre équipe et du soutien de nos partenaires.",
    categorie: 'Publication',
    auteur: 'Sophie Bernard',
    date: '2024-01-10',
    statut: 'publie',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  },
  {
    id: '5',
    titre: "Nouveau projet d'éducation communautaire",
    contenu:
      "Nous lançons un nouveau projet d'éducation communautaire visant à améliorer l'accès à l'éducation dans les zones rurales. Ce projet bénéficiera à plus de 500 enfants dans les régions reculées.",
    categorie: 'Annonce',
    auteur: 'Jean Dupont',
    date: '2024-02-05',
    statut: 'brouillon',
  },
];

export const initialRessourcesHumaines: RessourceHumaineItem[] = [
  {
    id: 1,
    slug: 'jean-dupont',
    nom: 'Dupont',
    prenom: 'Jean',
    poste: 'Directeur',
    description:
      "Directeur général de l'ESSG avec plus de 15 ans d'expérience dans le secteur associatif.",
    email: 'jean.dupont@essg.org',
    telephone: '+261 34 12 345 67',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    actif: true,
    ordre: 1,
    creeLe: new Date('2024-01-01'),
    misAJourLe: new Date('2024-01-15'),
  },
  {
    id: 2,
    slug: 'marie-curie',
    nom: 'Curie',
    prenom: 'Marie',
    poste: 'Responsable',
    description: 'Responsable des programmes de développement communautaire et des partenariats.',
    email: 'marie.curie@essg.org',
    telephone: '+261 34 98 765 43',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    actif: true,
    ordre: 2,
    creeLe: new Date('2024-01-05'),
    misAJourLe: new Date('2024-01-20'),
  },
  {
    id: 3,
    slug: 'pierre-martin',
    nom: 'Martin',
    prenom: 'Pierre',
    poste: 'Enseignant',
    description: "Enseignant et formateur spécialisé dans les programmes d'alphabétisation.",
    email: 'pierre.martin@essg.org',
    telephone: '+261 34 55 123 89',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    actif: true,
    ordre: 3,
    creeLe: new Date('2024-01-10'),
    misAJourLe: new Date('2024-02-01'),
  },
  {
    id: 4,
    slug: 'sophie-bernard',
    nom: 'Bernard',
    prenom: 'Sophie',
    poste: 'Administratif',
    description: "Gestionnaire administrative et financière de l'organisation.",
    email: 'sophie.bernard@essg.org',
    telephone: '+261 34 77 456 12',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    actif: true,
    ordre: 4,
    creeLe: new Date('2024-01-12'),
    misAJourLe: new Date('2024-02-05'),
  },
  {
    id: 5,
    slug: 'thomas-dubois',
    nom: 'Dubois',
    prenom: 'Thomas',
    poste: 'Technicien',
    description: 'Technicien en maintenance et support informatique.',
    email: 'thomas.dubois@essg.org',
    telephone: '+261 34 33 789 45',
    photo: '',
    actif: false,
    ordre: 5,
    creeLe: new Date('2024-01-08'),
    misAJourLe: new Date('2024-01-25'),
  },
];

import type { ActualiteItem } from '../types/actualite.types';
import type { RessourceHumaineItem } from '../types/ressource-humaine.types';
