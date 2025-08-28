// Configuração de debug centralizada
export const DEBUG_CONFIG = {
  // Controle geral de debug
  ENABLED: true,
  
  // Controles específicos
  FRIEND_REMOVAL: true,
  FRIEND_SEARCH: true,
  FRIEND_VERIFICATION: true,
  FAVORITES: true,
  UI_INTERACTIONS: true,
  
  // Função de log centralizada
  log: (category: string, message: string, data?: any) => {
    if (!DEBUG_CONFIG.ENABLED) return;
    
    const emojis: { [key: string]: string } = {
      'REMOVAL': '🗑️',
      'SEARCH': '🔍',
      'VERIFICATION': '👥',
      'FAVORITES': '⭐',
      'CACHE': '💾',
      'SYNC': '🔄',
      'ERROR': '❌',
      'SUCCESS': '✅',
      'INFO': '📊',
      'UI': '👆'
    };
    
    const emoji = emojis[category] || '📝';
    const prefix = `${emoji} ${category}`;
    
    if (data) {
      console.log(`${prefix}: ${message}`, data);
    } else {
      console.log(`${prefix}: ${message}`);
    }
  }
};
