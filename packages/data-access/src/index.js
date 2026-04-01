export const repositoryContracts = {
  auth: ["login", "logout", "getCurrentUser"],
  plans: ["getActivePlanForUser", "getDayPlanForUser", "updateUserPlanDay"],
  sessions: ["saveSessionRun", "listSessionsForUser"],
};
