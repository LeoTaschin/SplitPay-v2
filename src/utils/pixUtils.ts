// Utilitárias para BR Code Pix
import { User } from '../types';

// Gerar ID de referência único para transações Pix
export const generateReferenceId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 6);
  return `REF${timestamp}${random}`.toUpperCase();
};

// Validar CPF
export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Validar CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  // Validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleanCNPJ.charAt(13))) return false;
  
  return true;
};

// Validar email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar telefone (formato brasileiro)
export const validatePhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
  
  // Verifica se começa com DDD válido (11-99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  return true;
};

// Validar chave Pix baseada no tipo
export const validatePixKey = (key: string, type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'): boolean => {
  switch (type) {
    case 'cpf':
      return validateCPF(key);
    case 'cnpj':
      return validateCNPJ(key);
    case 'email':
      return validateEmail(key);
    case 'phone':
      return validatePhone(key);
    case 'random':
      // Chave aleatória deve ter entre 32 e 77 caracteres
      return key.length >= 32 && key.length <= 77;
    default:
      return false;
  }
};

// Formatar CPF para exibição
export const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Formatar CNPJ para exibição
export const formatCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// Formatar telefone para exibição
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
};

// Formatar chave Pix para exibição baseada no tipo
export const formatPixKey = (key: string, type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'): string => {
  switch (type) {
    case 'cpf':
      return formatCPF(key);
    case 'cnpj':
      return formatCNPJ(key);
    case 'phone':
      return formatPhone(key);
    case 'email':
    case 'random':
      return key;
    default:
      return key;
  }
};

// Mascarar chave Pix para exibição (ocultar parte dos dados sensíveis)
export const maskPixKey = (key: string, type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'): string => {
  switch (type) {
    case 'cpf':
      return key.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '$1.***.***-$4');
    case 'cnpj':
      return key.replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})-(\d{2})/, '$1.***.***/****-$5');
    case 'email':
      const [local, domain] = key.split('@');
      const maskedLocal = local.length > 2 ? local.substring(0, 2) + '***' : '***';
      return `${maskedLocal}@${domain}`;
    case 'phone':
      return key.replace(/(\(\d{2}\)) (\d{5})-(\d{4})/, '$1 *****-$3');
    case 'random':
      return key.length > 8 ? key.substring(0, 4) + '***' + key.substring(key.length - 4) : '***';
    default:
      return '***';
  }
};

// Função para remover acentos (necessário para o padrão EMV)
const removerAcentos = (texto: string): string => {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '');
};

// Função para calcular CRC16 (checksum obrigatório para EMV)
const calcularCRC16 = (payload: string): string => {
  let crc = 0xFFFF;
  const polynomial = 0x1021;
  
  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }
  }
  
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
};

// Gerar payload Pix BR Code seguindo o padrão EMV/BR Code
export const generatePixPayload = (params: {
  toUser: User;
  amount: number;
  referenceId: string;
}): string => {
  const { toUser, amount, referenceId } = params;
  
  // Processar nome do recebedor
  let nomeRecebedor = removerAcentos(toUser.name || 'Teste Pagamento');
  if (nomeRecebedor.length > 25) {
    nomeRecebedor = nomeRecebedor.substring(0, 25);
  }
  
  // Processar cidade
  const cidade = removerAcentos(toUser.city || 'Sao Paulo');
  
  // Chave Pix
  const chavePix = toUser.pixKey || '123e4567-e89b-12d3-a456-426614174000';
  
  // Valor formatado
  const valor = amount.toFixed(2);
  
  // GUI (Globally Unique Identifier) - fixo para Pix
  const gui = 'BR.GOV.BCB.PIX';
  
  // Informação da chave Pix (subcampo "01" do campo 26)
  const infoChave = '01' + String(chavePix.length).padStart(2, '0') + chavePix;
  
  // Informação da conta do comerciante (campo "26")
  const merchantAccountInfo = '26' + 
    String(4 + gui.length + infoChave.length).padStart(2, '0') +
    '00' + String(gui.length).padStart(2, '0') + gui + infoChave;
  
  // Construir payload EMV Pix
  const payload = '000201' + // Payload Format Indicator
    merchantAccountInfo + // Merchant Account Information
    '52040000' + // Merchant Category Code
    '5303986' + // Transaction Currency
    '54' + String(valor.length).padStart(2, '0') + valor + // Transaction Amount
    '5802BR' + // Country Code
    '59' + String(nomeRecebedor.length).padStart(2, '0') + nomeRecebedor + // Merchant Name
    '60' + String(cidade.length).padStart(2, '0') + cidade + // Merchant City
    '62070503***'; // Additional Data Field Template
  
  // Calcular CRC16
  const crc = calcularCRC16(payload + '6304');
  
  // Retornar payload completo
  return payload + '6304' + crc;
};
