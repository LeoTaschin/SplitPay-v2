import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  arrayUnion, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface Group {
  id: string;
  name: string;
  description?: string;
  photoURL?: string;
  members: string[];
  createdBy: string;
  createdAt: any;
  updatedAt?: any;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  photoURL?: string;
  members: string[];
  createdBy: string;
}

export class GroupService {
  private static COLLECTION_NAME = 'groups';

  /**
   * Cria um novo grupo no Firebase
   */
  static async createGroup(groupData: CreateGroupData): Promise<string> {
    try {
      console.log('GroupService: Criando grupo:', groupData);

      // Preparar dados do grupo
      const groupToCreate = {
        ...groupData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Adicionar documento na coleção de grupos
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), groupToCreate);
      
      console.log('GroupService: Grupo criado com ID:', docRef.id);
      return docRef.id;

    } catch (error) {
      console.error('GroupService: Erro ao criar grupo:', error);
      throw new Error('Erro ao criar grupo no Firebase');
    }
  }

  /**
   * Faz upload da foto do grupo para o Storage
   */
  static async uploadGroupPhoto(photoUri: string, groupId: string): Promise<string> {
    try {
      console.log('GroupService: Fazendo upload da foto do grupo:', groupId);

      // Converter URI para blob
      const response = await fetch(photoUri);
      const blob = await response.blob();

      // Criar referência no Storage
      const photoRef = ref(storage, `groups/${groupId}/photo.jpg`);
      
      // Fazer upload
      await uploadBytes(photoRef, blob);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(photoRef);
      
      console.log('GroupService: Foto do grupo enviada:', downloadURL);
      return downloadURL;

    } catch (error) {
      console.error('GroupService: Erro ao fazer upload da foto:', error);
      throw new Error('Erro ao fazer upload da foto do grupo');
    }
  }

  /**
   * Busca grupos de um usuário
   */
  static async getUserGroups(userId: string): Promise<Group[]> {
    try {
      console.log('GroupService: Buscando grupos do usuário:', userId);

      const groupsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('members', 'array-contains', userId)
      );

      const querySnapshot = await getDocs(groupsQuery);
      const groups: Group[] = [];

      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        groups.push({
          id: doc.id,
          ...doc.data()
        } as Group);
      });

      console.log('GroupService: Grupos encontrados:', groups.length);
      return groups;

    } catch (error) {
      console.error('GroupService: Erro ao buscar grupos:', error);
      throw new Error('Erro ao buscar grupos do usuário');
    }
  }

  /**
   * Atualiza um grupo existente
   */
  static async updateGroup(groupId: string, updates: Partial<Group>): Promise<void> {
    try {
      console.log('GroupService: Atualizando grupo:', groupId);

      const groupRef = doc(db, this.COLLECTION_NAME, groupId);
      await updateDoc(groupRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      console.log('GroupService: Grupo atualizado com sucesso');

    } catch (error) {
      console.error('GroupService: Erro ao atualizar grupo:', error);
      throw new Error('Erro ao atualizar grupo');
    }
  }

  /**
   * Adiciona membros a um grupo
   */
  static async addMembersToGroup(groupId: string, memberIds: string[]): Promise<void> {
    try {
      console.log('GroupService: Adicionando membros ao grupo:', groupId, memberIds);

      const groupRef = doc(db, this.COLLECTION_NAME, groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(...memberIds),
        updatedAt: serverTimestamp(),
      });

      console.log('GroupService: Membros adicionados com sucesso');

    } catch (error) {
      console.error('GroupService: Erro ao adicionar membros:', error);
      throw new Error('Erro ao adicionar membros ao grupo');
    }
  }
}
