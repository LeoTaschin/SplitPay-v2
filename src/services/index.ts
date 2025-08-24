// Serviços de autenticação
export * from './auth';

// Serviços de dívidas
export * from './debtService';

// Serviços de usuário
export * from './userService';

// Serviços de analytics
export * from './analyticsService';

// Serviços de migração
export * from './migrationService';

// Serviços de presença
export * from './presenceService';

// Serviços de busca de usuários
export * from './userSearchService';

// Serviços de amizade
export { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend as removeFriendFromFriends,
  getPendingFriendRequests,
  areUsersFriends 
} from './friendService'; 