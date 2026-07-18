import type { QcmData } from "@/lib/types";

// Quiz de diagnostic autonome, independant du contenu des lecons : une
// question par filiere (hors Langues) pour ne favoriser aucune filiere en
// particulier. Le score (0 a 5) determine le niveau suggere -- voir
// suggestLevelFromScore ci-dessous.
export interface PlacementQuestion {
  id: string;
  prompt: string;
  data: QcmData;
}

export const PLACEMENT_TEST_QUESTIONS: PlacementQuestion[] = [
  {
    id: "pt-cuisine",
    prompt: "Que signifie « mise en place » en cuisine ?",
    data: {
      options: [
        { id: "a", text: "Préparer et organiser ses ingrédients avant de cuisiner" },
        { id: "b", text: "Nettoyer le poste de travail en fin de service" },
        { id: "c", text: "Dresser l'assiette juste avant l'envoi" },
      ],
      correct_option_id: "a",
    },
  },
  {
    id: "pt-patisserie",
    prompt: "Qu'est-ce qui fait gonfler une pâte à choux à la cuisson ?",
    data: {
      options: [
        { id: "a", text: "La levure boulangère" },
        { id: "b", text: "La vapeur d'eau contenue dans la pâte" },
        { id: "c", text: "Le bicarbonate de soude" },
      ],
      correct_option_id: "b",
    },
  },
  {
    id: "pt-bar",
    prompt: "Que signifie « allonger » un cocktail ?",
    data: {
      options: [
        { id: "a", text: "Ajouter un liquide non alcoolisé pour le diluer" },
        { id: "b", text: "Ajouter plus d'alcool" },
        { id: "c", text: "Le servir dans un verre plus grand, sans rien ajouter" },
      ],
      correct_option_id: "a",
    },
  },
  {
    id: "pt-service",
    prompt: "Par quel côté du client sert-on généralement les boissons ?",
    data: {
      options: [
        { id: "a", text: "Par la gauche" },
        { id: "b", text: "Par la droite" },
        { id: "c", text: "Peu importe le côté" },
      ],
      correct_option_id: "b",
    },
  },
  {
    id: "pt-hotellerie",
    prompt: "Que désigne le « check-out » à la réception d'un hôtel ?",
    data: {
      options: [
        { id: "a", text: "L'arrivée du client et la remise des clés" },
        { id: "b", text: "La demande de réveil matinal" },
        { id: "c", text: "Le départ du client et la restitution de la chambre" },
      ],
      correct_option_id: "c",
    },
  },
];

export type NiveauUtilisateurValue = "debutant" | "intermediaire" | "avance";

export function suggestLevelFromScore(score: number): NiveauUtilisateurValue {
  if (score <= 1) return "debutant";
  if (score <= 3) return "intermediaire";
  return "avance";
}
