import { badgeService } from './badgeService';
import { initializeBadges } from './initializeBadges';

export const testBadgeSystem = async () => {
  try {
    console.log('🧪 Testando sistema de badges...');

    // 1. Testar carregamento de badges
    console.log('\n1. Carregando todos os badges...');
    const allBadges = await badgeService.getAllBadges();
    console.log(`✅ ${allBadges.length} badges carregados`);

    // 2. Testar se há badges no sistema
    if (allBadges.length === 0) {
      console.log('\n⚠️ Nenhum badge encontrado. Inicializando badges padrão...');
      await initializeBadges();
      console.log('✅ Badges inicializados!');
    }

    console.log('\n🎉 Teste básico concluído!');
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
};

export const initializeBadgeSystem = async () => {
  try {
    console.log('🚀 Inicializando sistema de badges...');
    
    // Inicializar badges padrão
    await initializeBadges();
    
    console.log('✅ Sistema de badges inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema:', error);
  }
};

// Função para testar com um usuário específico
export const testUserBadges = async (userId: string) => {
  try {
    console.log(`🧪 Testando badges do usuário: ${userId}`);

    // 1. Testar progresso do usuário
    console.log('\n1. Testando progresso do usuário...');
    const progress = await badgeService.getBadgeProgress(userId);
    console.log('✅ Progresso carregado:', progress);

    // 2. Testar carregamento de badges do usuário
    console.log('\n2. Carregando badges do usuário...');
    const userBadges = await badgeService.getUserBadges(userId);
    console.log('✅ Badges do usuário carregados:', userBadges);

    console.log('\n🎉 Teste do usuário concluído!');
  } catch (error) {
    console.error('❌ Erro nos testes do usuário:', error);
  }
};
