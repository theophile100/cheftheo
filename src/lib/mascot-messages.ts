const ENCOURAGEMENT_MESSAGES = [
  "Prêt à progresser aujourd'hui ?",
  "Une leçon de plus, un pas de plus !",
  "On continue sur notre lancée ?",
  "Chaque leçon compte, bravo pour votre régularité.",
  "Aujourd'hui est un bon jour pour apprendre.",
  "C'est reparti pour une nouvelle leçon !",
  "Petit à petit, on devient un vrai pro.",
];

const CORRECT_MESSAGES = [
  "Bien joué !",
  "Exactement !",
  "Parfait, continuez comme ça.",
  "Belle réponse !",
  "C'est exactement ça.",
];

const INCORRECT_MESSAGES = [
  "Pas grave, on apprend de ses erreurs.",
  "Presque ! Regardez l'explication.",
  "Ce n'est rien, on continue.",
  "On la retiendra pour la prochaine fois.",
];

const CELEBRATE_MESSAGES = [
  "Bravo, leçon terminée !",
  "Excellent travail aujourd'hui !",
  "Vous progressez à vue d'œil !",
  "Belle leçon, à bientôt pour la suite.",
];

function pickDaily(messages: string[]): string {
  return messages[new Date().getDay() % messages.length];
}

function pickRandom(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getEncouragementMessage() {
  return pickDaily(ENCOURAGEMENT_MESSAGES);
}

export function getCorrectMessage() {
  return pickRandom(CORRECT_MESSAGES);
}

export function getIncorrectMessage() {
  return pickRandom(INCORRECT_MESSAGES);
}

export function getCelebrateMessage() {
  return pickRandom(CELEBRATE_MESSAGES);
}
