import type { Document } from '../types/Document';
import type { DocumentVersion } from '../types/DocumentVersion';

const API_BASE_URL = 'http://localhost:3000';

type SaveDocumentPayload = Omit<
  Document,
  'id' | 'createdAt' | 'updatedAt' | 'versions'
>;

export const documentService = {
  async create(document: SaveDocumentPayload): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...document, state: document.state ?? 'En édition' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du document');
    }

    return response.json();
  },

  async getById(id: number): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du document');
    }

    return response.json();
  },

  async update(id: number, document: Partial<SaveDocumentPayload>): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...document, state: document.state ?? 'En édition' }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du document');
    }

    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du document');
    }
  },

  async getAll(): Promise<Document[]> {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des documents');
    }

    return response.json();
  },

  async getVersions(id: number): Promise<DocumentVersion[]> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des versions');
    }

    return response.json();
  },

  async getVersion(id: number, version: number): Promise<DocumentVersion> {
    const response = await fetch(
      `${API_BASE_URL}/documents/${id}/versions/${version}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la version');
    }

    return response.json();
  },

  async checkNameExists(title: string, excludeId?: number): Promise<boolean> {
    const documents = await this.getAll();
    return documents.some(doc => doc.title === title && doc.id !== excludeId);
  },

  async updateState(id: number, state: string): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/state`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de l\'état du document');
    }

    return response.json();
  },

  async updateVersionState(documentId: number, versionId: number, state: string): Promise<DocumentVersion> {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/versions/${versionId}/state`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de l\'état de la version');
    }

    return response.json();
  },
};
