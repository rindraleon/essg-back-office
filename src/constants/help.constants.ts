/**
 * Manuel complet du back-office ESSG — 100 % données, aucune logique.
 * Chaque notice décrit le comportement réel de l'application ; les règles
 * métier (unicité, protections à la suppression, hiérarchie) sont vérifiées
 * par le serveur et rappelées ici à titre indicatif.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Folder,
  GraduationCap,
  Handshake,
  KeyRound,
  Layers,
  LayoutDashboard,
  Mail,
  Newspaper,
  ScrollText,
  Settings,
  UserCheck,
  UserCircle,
  Users,
} from 'lucide-react';

export interface AideSection {
  /** Ancre d'URL (#id) pour le sommaire. */
  id: string;
  title: string;
  /** Emplacement dans l'application, ex. « Menu « Formations » — /formations ». */
  location: string;
  /** Icône du menu latéral correspondant, reprise dans la navigation du manuel. */
  icon: LucideIcon;
  /** Libellé court de la navigation latérale : le nom de l’entrée de menu. */
  menuLabel: string;
  adminOnly?: boolean;
  resume: string;
  /** Prérequis métier à satisfaire avant d'utiliser la page. */
  prerequis: string[];
  /** Mode d'emploi numéroté. */
  etapes: string[];
  /** Bonnes pratiques, erreurs fréquentes, précisions. */
  aNoter: string[];
}

/** Ordre de démarrage recommandé (dépendances réelles entre modules). */
export const DEMARRAGE: { sectionId: string; label: string; detail: string }[] = [
  {
    sectionId: 'utilisateurs',
    label: 'Comptes & rôles',
    detail: 'Créez les comptes administrateurs, éditeurs et lecteurs.',
  },
  {
    sectionId: 'parametres',
    label: 'Paramètres',
    detail: 'Ouvrez ou fermez les admissions ; réglages partagés par tous.',
  },
  {
    sectionId: 'mentions-parcours',
    label: 'Mentions & parcours',
    detail: 'Structurez la hiérarchie avant toute formation.',
  },
  {
    sectionId: 'equipes',
    label: 'Équipes pédagogiques',
    detail: 'Ajoutez les enseignants, futurs responsables de formation.',
  },
  {
    sectionId: 'formations',
    label: 'Formations',
    detail: 'Rattachez chaque formation à un parcours de mention.',
  },
  {
    sectionId: 'partenaires',
    label: 'Partenaires',
    detail: 'Référencez les organismes, prérequis des projets.',
  },
  {
    sectionId: 'projets',
    label: 'Projets',
    detail: 'Publiez les projets et liez-leur des partenaires.',
  },
  {
    sectionId: 'actualites',
    label: 'Actualités',
    detail: 'Animez la une du site public.',
  },
];

export const MANUEL_SECTIONS: AideSection[] = [
  {
    id: 'connexion',
    title: 'Se connecter & récupérer un accès',
    location: 'Pages publiques /login et /forgot-password',
    icon: KeyRound,
    menuLabel: 'Connexion',
    resume:
      "L'accès au back-office nécessite un compte créé par un administrateur. La page de connexion accepte l'email et le mot de passe ; en cas d'oubli, un email de réinitialisation est envoyé.",
    prerequis: ["Disposer d'un compte (demande à un administrateur, voir « Utilisateurs »)."],
    etapes: [
      'Saisissez votre email et votre mot de passe sur la page de connexion, puis validez.',
      'En cas d’oubli : « Mot de passe oublié », saisissez votre email et suivez le lien reçu pour définir un nouveau mot de passe.',
      'Après connexion, vous arrivez sur le tableau de bord ; le menu latéral affiche les pages autorisées pour votre rôle.',
    ],
    aNoter: [
      'Trois rôles : admin (tout), éditeur (contenus, sans Utilisateurs / Journal / Paramètres) et lecteur (consultation).',
      'Le lien de réinitialisation nécessite la configuration SMTP du serveur ; en l’absence d’email, un administrateur peut définir un mot de passe via la page Utilisateurs.',
      'Vos sessions actives sont visibles et révocables depuis votre profil (« Mon profil »).',
    ],
  },
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    location: 'Menu « Accueil » — /dashboard',
    icon: LayoutDashboard,
    menuLabel: 'Accueil',
    resume:
      "Vue d'ensemble en lecture seule : statistiques des contenus, activités récentes et compteurs utiles (messages non lus, admissions en attente).",
    prerequis: [],
    etapes: [
      'Consultez les cartes de statistiques (formations, actualités, partenaires, projets…).',
      'Suivez les activités récentes pour savoir ce qui vient d’être publié ou modifié.',
      'Utilisez les cloches de l’en-tête (Messages, Admissions) pour traiter directement les éléments en attente.',
    ],
    aNoter: [
      'Aucune action d’édition ici : chaque carte renvoie vers la page concernée.',
      'Les chiffres proviennent des mêmes données que les listes ; après une modification, revenez au tableau de bord pour le voir à jour.',
    ],
  },
  {
    id: 'mentions-parcours',
    title: 'Mentions / Parcours',
    location: 'Menu « Mentions / Parcours » — /mentions-parcours',
    icon: Layers,
    menuLabel: 'Mentions',
    resume:
      "Cœur de la hiérarchie des formations : Domaine → Mention → Parcours → Formation. Une mention regroupe plusieurs parcours ; le parcours est l'identité de la formation. Cette page est le prérequis obligatoire de toute création de formation.",
    prerequis: [],
    etapes: [
      'Cliquez sur « Nouvelle mention » : saisissez le nom (obligatoire) et le domaine (libre ou suggéré en auto-complétion).',
      'Ajoutez les parcours un par un dans le formulaire (« Ajouter un parcours ») ; chaque ligne porte le nom complet du parcours.',
      'Enregistrez : la mention et ses parcours sont créés en une seule opération ; le nom de la mention doit être unique et celui d’un parcours unique dans sa mention.',
      'Pour modifier une mention existante : bouton « Modifier » de la ligne — ajoutez, renommez ou retirez des parcours dans le même formulaire.',
      'Pour consulter le détail : cliquez sur l’œil ; la fiche liste les parcours, le nombre de formations rattachées et permet d’ajouter, modifier ou supprimer un parcours précis.',
      'Recherchez par nom de mention, slug, description ou nom de parcours ; filtrez par statut (active/inactive) ou domaine.',
    ],
    aNoter: [
      'Désactiver une mention la retire des sélecteurs de formation sans supprimer les formations existantes.',
      'Un parcours utilisé par des formations ne peut pas être supprimé : le message d’erreur indique combien de formations le bloquent — réaffectez-les d’abord.',
      'Supprimer une mention propose la cascade : seuls les parcours libres sont supprimés avec elle ; la demande est refusée si des formations y sont encore rattachées.',
      'Les noms de parcours saisis ici deviennent les titres des formations : soignez l’orthographe, ils s’affichent tels quels sur le site public.',
    ],
  },
  {
    id: 'equipes',
    title: 'Équipes pédagogiques (ressources humaines)',
    location: 'Menu « Équipes pédagogiques » — /ressources-humaines',
    icon: Users,
    menuLabel: 'Équipes',
    resume:
      'Fiches des enseignants et intervenants : identité, coordonnées, photo, expériences professionnelles, formations, diplômes, compétences et langues. Ces fiches alimentent le champ « Responsable » des formations et les équipes affichées sur le site public.',
    prerequis: [],
    etapes: [
      'Cliquez sur « Nouvelle ressource » et complétez les champs obligatoires : nom, prénom et poste.',
      'Ajoutez email, téléphone, adresse et description pour la fiche publique (tous optionnels).',
      'Téléversez une photo (formats image courants, quelques Mo maximum).',
      'Complétez si besoin les listes dynamiques : expériences, formations, diplômes, compétences, langues (« ajouter » / croix pour retirer une ligne).',
      "Réglez l'ordre d’affichage (petit numéro = affiché en premier sur le site) et l'interrupteur « actif ».",
      'Enregistrez ; la personne est immédiatement proposable comme responsable dans le formulaire de formation.',
    ],
    aNoter: [
      'Une ressource inactive disparaît du site public mais reste liée aux formations existantes.',
      'Pour présenter un CV scanné lors d’un recrutement, utilisez l’import du formulaire public côté candidat, pas cette page.',
      'La suppression d’une ressource utilisée comme responsable est refusée : réaffectez la formation concernée d’abord.',
    ],
  },
  {
    id: 'formations',
    title: 'Formations',
    location: 'Menu « Formations » — /formations',
    icon: GraduationCap,
    menuLabel: 'Formations',
    resume:
      "Gestion des formations de l'école. Une formation EST un parcours de mention : le formulaire sélectionne la mention puis la formation (parcours) sous son nom complet — jamais un identifiant — et le titre, la mention et le domaine se déduisent automatiquement.",
    prerequis: [
      'Au moins une mention contenant au moins un parcours (page « Mentions / Parcours »).',
      'Pour désigner un responsable : la personne doit d’abord exister dans « Équipes pédagogiques ».',
    ],
    etapes: [
      'Cliquez sur « Nouvelle formation » (formulaire en trois étapes).',
      'Étape 1 « Informations » : choisissez la mention, puis la formation (parcours) dans la liste déroulante — son nom complet devient le titre de la formation.',
      'Complétez les obligatoires : niveau (Licence, Master, Doctorat), durée, nombre de crédits et description.',
      'Étape 2 « Pédagogie » : ajoutez au moins un objectif et un débouché ; programme, compétences visées et conditions d’accès sont optionnels (champs libres acceptés).',
      'Étape 3 « Détails » : sélectionnez le responsable (liste des équipes pédagogiques), l’email de contact, téléversez une image et activez « Mettre en vedette » pour la une du site.',
      'Enregistrez. En modification, le parcours déjà rattaché est pré-sélectionné et se recharge par son nom.',
      'Liste : recherche par titre, mention ou parcours ; filtres « Niveau », « Mention » et « En vedette » dans le panneau des filtres avancés.',
    ],
    aNoter: [
      'Aucun parcours dans la mention choisie ? Créez-le d’abord dans « Mentions / Parcours » — le formulaire vous le rappelle.',
      'Changer le parcours d’une formation change automatiquement son titre, son slug et ses rattachements ; l’opération reste sans risque pour les anciens dossiers.',
      'Les doublons de formation (même parcours) sont refusés par le serveur avec un message explicite.',
      'Désactiver une mention ou un parcours n’affecte pas les formations publiées, mais bloque les nouvelles créations dessus.',
    ],
  },
  {
    id: 'actualites',
    title: 'Actualités',
    location: 'Menu « Actualités » — /actualites',
    icon: Newspaper,
    menuLabel: 'Actualités',
    resume:
      'Publication des news du site public : annonces, événements, réussites. Chaque actualité possède un statut (brouillon, publié, archivé) qui pilote sa visibilité.',
    prerequis: [],
    etapes: [
      'Cliquez sur « Nouvelle actualité ».',
      'Saisissez les champs obligatoires : titre, auteur, date, catégorie et contenu.',
      'Ajoutez un résumé (affiché sur les cartes du site) — recommandé, il sert aussi d’accroche dans le fil d’actualités.',
      'Téléversez l’image à la une puis, si besoin, une galerie d’images complémentaires.',
      'Choisissez le statut : « brouillon » pour préparer, « publié » pour rendre visible sur le site, « archivé » pour retirer sans supprimer.',
      'Enregistrez ; « Mettre en vedette » place l’actualité en avant sur la page d’accueil publique.',
    ],
    aNoter: [
      'Seules les actualités publiées apparaissent sur le site public et dans les flux.',
      'Filtres de la liste : catégorie, statut et période (dates de début/fin) pour retrouver rapidement un article.',
      'Le slug est dérivé du titre et sert d’URL publique (/actualites/mon-titre) : renommez un titre seulement si le lien public peut changer.',
    ],
  },
  {
    id: 'partenaires',
    title: 'Partenaires',
    location: 'Menu « Partenaires » — /partenaires',
    icon: Handshake,
    menuLabel: 'Partenaires',
    resume:
      "Annuaire des organismes coopérants (entreprises, universités, institutions). C'est le prérequis de tout projet qui affiche des partenaires, et il alimente les stage/coopération du site public.",
    prerequis: [],
    etapes: [
      'Cliquez sur « Nouveau partenaire ».',
      'Renseignez les champs obligatoires : nom, type (entreprise, université, institution…), secteur, description.',
      'Ajoutez les dates de partenariat (début, fin), le logo téléversé, le site web et un contact si disponible.',
      'Enregistrez ; le partenaire est immédiatement sélectionnable dans la page « Projets ».',
    ],
    aNoter: [
      'Un partenaire référencé par des projets ne peut pas être supprimé sans risque : retirez d’abord les liaisons dans les projets concernés.',
      'Filtres de liste : type, secteur et période.',
      'Le logo sert d’illustration sur la carte du site public : privilégiez une image carrée lisible en petit.',
    ],
  },
  {
    id: 'projets',
    title: 'Projets',
    location: 'Menu « Projets » — /projets',
    icon: Folder,
    menuLabel: 'Projets',
    resume:
      'Valorisation des projets scientifiques, étudiants ou communautaires : description, localisation cartographique, galerie, sources et partenaires rattachés.',
    prerequis: [
      'Pour rattacher des partenaires (recommandé) : créez-les d’abord dans la page « Partenaires ».',
    ],
    etapes: [
      'Cliquez sur « Nouveau projet ».',
      'Saisissez les champs obligatoires : titre, type, statut, date et description.',
      'Dans le champ « Partenaires », sélectionnez un ou plusieurs organismes déjà enregistrés (recherche par nom).',
      'Ajoutez une image principale puis une galerie complète.',
      'Localisez le projet : ville, pays, adresse puis latitude/longitude directement sur le sélecteur de carte.',
      'Renseignez les sources (titre + URL) pour créditer les données ou publications liées.',
      'Enregistrez ; le projet rejoint la carte et la liste publiques selon son statut.',
    ],
    aNoter: [
      'Le champ partenaires est une liste de contrôle : un projet peut exister sans partenaire, mais la sélection reste vide si l’annuaire est vide — d’où le prérequis.',
      'Filtres : type de projet, statut et période.',
      'Suppression possible tant qu’aucune donnée critique ne dépend du projet ; le serveur refuse et explique en cas de blocage.',
    ],
  },
  {
    id: 'admissions',
    title: 'Admissions',
    location: 'Menu « Admissions » — /admissions',
    icon: UserCheck,
    menuLabel: 'Admissions',
    resume:
      'Traitement des candidatures déposées par les étudiants sur le site public. Le back-office ne crée pas les dossiers : il les consulte, vérifie les pièces et rend la décision.',
    prerequis: [
      'Pour recevoir des candidatures : activez « Admissions ouvertes » dans Paramètres.',
      'La formation demandée par le candidat est issue de la hiérarchie Mentions / Parcours — elle doit donc exister avant la campagne.',
    ],
    etapes: [
      'Filtrez la liste : statut (en attente, en cours d’étude, accepté, refusé), formation/parcours, période ou recherche par nom.',
      'Ouvrez un dossier (œil) : identité complète, baccalauréat, formation demandée, documents téléversés.',
      'Consultez les pièces jointes (relevés de notes, diplômes, pièce d’identité…) depuis l’onglet des documents.',
      'Si la vérification automatique des pièces est disponible, lancez-la et consultez l’historique des contrôles dans le panneau dédié.',
      'Cliquez sur « Décision » : passez le dossier « en cours d’étude », puis « accepté » ou « refusé » avec vos remarques ; le statut est enregistré immédiatement.',
    ],
    aNoter: [
      'Les compteurs de l’en-tête (cloche « Admissions ») signalent les dossiers « en attente » à traiter.',
      'Un dossier refusé ou accepté reste consultable ; seul l’administrateur peut supprimer définitivement un dossier.',
      'Les noms de mention/parcours affichés proviennent de la hiérarchie : une coquille corrigée dans « Mentions / Parcours » se reflète ici et sur le site.',
    ],
  },
  {
    id: 'contacts',
    title: 'Contacts (messages)',
    location: 'Menu « Contacts » — /contacts',
    icon: Mail,
    menuLabel: 'Contacts',
    resume:
      "Boîte de réception des messages envoyés depuis le formulaire de contact du site public : lecture, réponse par email et suivi de l'état de lecture.",
    prerequis: [],
    etapes: [
      'Parcourez la liste (filtres : lu / non lu, période) ou utilisez la recherche par nom, objet ou email.',
      'Ouvrez un message pour lire le contenu complet et les coordonnées de l’expéditeur.',
      'Cliquez sur « Répondre » : rédigez votre réponse — elle est envoyée à l’adresse de l’expéditeur — le message est marqué comme lu.',
      'Marquez manuellement un message comme lu pour le retirer des compteurs.',
    ],
    aNoter: [
      'La cloche « Messages » de l’en-tête affiche le nombre de messages non lus.',
      'La réponse par email nécessite la configuration SMTP du serveur ; sinon, notez le traitement dans l’objet du suivi et répondez hors outil.',
      'Suppression : confirmation systématique, l’action est définitive.',
    ],
  },
  {
    id: 'utilisateurs',
    title: 'Utilisateurs',
    location: 'Menu « Utilisateurs » — /utilisateurs · administrateur uniquement',
    icon: Users,
    menuLabel: 'Utilisateurs',
    resume:
      'Comptes du back-office : création, rôles, activation, mot de passe et gestion des sessions ouvertes.',
    prerequis: [],
    adminOnly: true,
    etapes: [
      'Cliquez sur « Nouvel utilisateur » : nom, prénom, email, mot de passe initial, rôle (admin, éditeur ou lecteur) et éventuellement un avatar.',
      'Pour modifier un compte : champ par champ ; le mot de passe se met à jour en laissant le champ vide (inchangé) ou en saisissant un nouveau mot de passe.',
      'Activez ou désactivez un compte : un compte désactivé ne peut plus se connecter, l’historique de ses actions reste dans le journal.',
      'Ouvrez « Sessions » sur une ligne pour voir les connexions actives (appareil, IP, durée) et les révoquer une par une ou toutes d’un coup.',
      'Filtrez par rôle ou recherchez par nom/email.',
    ],
    aNoter: [
      'Un utilisateur ne peut pas se rétrograder ou se désactiver lui-même quand il est le seul administrateur actif : prévoyez toujours un second compte admin.',
      'Le rôle éditeur gère les contenus (actualités, formations, mentions/parcours, équipes, partenaires, projets, admissions, messages) sans accès aux comptes, au journal ni aux paramètres.',
      'La révocation de sessions déconnecte immédiatement la personne concernée.',
    ],
  },
  {
    id: 'journal',
    title: 'Journal des actions',
    location: 'Menu « Journal » — /activity-logs · administrateur uniquement',
    icon: ScrollText,
    menuLabel: 'Journal',
    resume:
      'Historique vérifiable des actions d’administration : qui a créé, modifié, supprimé ou publié quoi, et quand. Utile pour l’audit et pour comprendre une incohérence de données.',
    prerequis: [],
    adminOnly: true,
    etapes: [
      'Filtrez par utilisateur, type d’action ou période.',
      'Ouvrez une entrée pour voir le détail (ressource concernée, identifiants, résumé des changements).',
      'Recherchez une occurrence précise (titre de ressource, champ modifié…) via la recherche plein texte.',
    ],
    aNoter: [
      'Le journal est en lecture seule : aucune modification ni suppression possible, c’est voulu.',
      'Les connexions et déconnexions y figurent aussi — premier réflexe en cas de compte suspect.',
    ],
  },
  {
    id: 'parametres',
    title: 'Paramètres',
    location: 'Menu « Paramètres » — /parametres · administrateur uniquement',
    icon: Settings,
    menuLabel: 'Paramètres',
    resume:
      'Réglages partagés entre tous les utilisateurs et toutes les sessions, appliqués au site public comme au back-office.',
    prerequis: [],
    adminOnly: true,
    etapes: [
      'Basculez « Admissions ouvertes » pour rendre visible (ou masquer) le formulaire de candidature du site public.',
      'Ajustez les autres réglages disponibles ; chaque interrupteur s’enregistre immédiatement, avec message de confirmation.',
    ],
    aNoter: [
      'Fermer les admissions masque le formulaire public : les dossiers déjà déposés restent traitables dans « Admissions ».',
      'En cas d’échec d’enregistrement, un message le signale et le bouton « Réessayer » relance la requête.',
    ],
  },
  {
    id: 'profil',
    title: 'Mon profil',
    location: 'Menu avatar « Profil » — /profil',
    icon: UserCircle,
    menuLabel: 'Profil',
    resume:
      'Vos informations personnelles : identité, avatar et mot de passe, avec la liste de vos propres sessions actives.',
    prerequis: [],
    etapes: [
      'Ouvrez « Profil » depuis le menu de l’avatar (en-tête) ou le bouton « Modifier » du haut de page.',
      'Mettez à jour nom, prénom, avatar ; l’image s’affiche dès l’enregistrement.',
      'Pour changer votre mot de passe, saisissez le mot de passe actuel puis le nouveau.',
      'Depuis la page, vous pouvez révoquer vos propres sessions ouvertes sur d’autres appareils.',
    ],
    aNoter: [
      'L’email de connexion n’est pas modifiable depuis le profil : demandez à un administrateur (page Utilisateurs) si votre adresse change.',
      'Changer son mot de passe conserve la session courante ; les autres sont déconnectées à la prochaine vérification.',
    ],
  },
];

/** Contenu toujours vrai, affiché en pied de manuel. */
export const AIDE_PIED: string[] = [
  'Dans toute l’application, les identifiants techniques ne sont jamais affichés : sélectionnez et retrouvez toujours les éléments par leur nom complet.',
  'Chaque enregistrement affiche un message de succès ou d’échec rédigé pour vous ; les erreurs bloquantes viennent du serveur et expliquent la cause exacte (doublon, donnée utilisée…).',
  'Après suppression confirmée, l’action est définitive : privilégiez la désactivation quand vous voulez masquer temporairement une donnée.',
];
