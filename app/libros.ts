import { config } from '../lib/appwrite';
import { Book } from './types';

export const getBooks = async (): Promise<Book[]> => {
  try {
    const response = await fetch(`${config.endpoint}/databases/${config.dbId}/collections/${config.collectionId}/documents`, {
      headers: {
        'X-Appwrite-Project': config.projectId,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Mapeamos manualmente los campos a tu tipo Book
    return data.documents.map((doc: any) => ({
      $id: doc.$id,
      title: doc.title,
      author: doc.author,
      cover_url: doc.cover_url,
      file_url: doc.file_url,
      category: doc.category,
      created_at: doc.created_at,
      description: doc.description,
    }));
  } catch (error) {
    console.error('Error al obtener libros:', error);
    return [];
  }
};
