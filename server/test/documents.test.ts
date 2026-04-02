import request from 'supertest';
import app from '../app';
import * as documentManager from '../src/managers/document.manager';
import * as documentVersionManager
    from '../src/managers/documentVersion.manager';

const ORIGINAL_ENV = process.env.NODE_ENV;

interface Image {
    imagePath?: string;
}

interface Block {
    text?: string;
    step: number;
    nbOfRepeats?: number;
    images?: Image[];
    canvasData?: string;
}

interface DocumentShape {
    id: number;
    title: string;
    version: number;
    blocks: Block[];
}

interface CreateInput {
    title: string;
    version: number;
    blocks?: Block[];
}

interface DocumentVersionShape {
    id: number;
    documentId: number;
    version: number;
    title: string;
    state: string;
    createdAt?: string;
    snapshot?: {
        title: string,
        state: string,
        blocks: Block[],
    } | null;
}

// Mock the DocumentManager used by controllers to avoid DB access
jest.mock('../src/managers/document.manager', () => {
    const create = jest.fn<Promise<DocumentShape>, [CreateInput]>((data) =>
        Promise.resolve({ id: 1, ...data, blocks: data.blocks ?? [] }));

    const getAll = jest.fn<Promise<DocumentShape[]>, []>(() =>
        Promise.resolve([
            {
                id: 1,
                title: 'Doc',
                version: 1,
                blocks: [],
            },
        ],
        ));

    const getById = jest.fn<Promise<DocumentShape | null>, [number]>((id) =>
        Promise.resolve(
            id === 1
                ? {
                    id,
                    title: 'Doc',
                    version: 1,
                    blocks: [],
                }
                : null,
        ),
    );

    const update = jest.fn<Promise<DocumentShape | null>,
    [number, CreateInput]>(
        (id, data) =>
            Promise.resolve({
                id,
                ...data,
                blocks: data.blocks ?? [],
            },
            ));

    return { create, getAll, getById, update };
});

jest.mock('../src/managers/documentVersion.manager', () => {
    const getDocumentVersions =
    jest.fn<Promise<DocumentVersionShape[]>, [number]>(
        (documentId) => Promise.resolve([
            {
                id: 1,
                documentId,
                version: 2,
                title: 'Doc',
                state: 'En édition',
                createdAt: new Date().toISOString(),
            },
            {
                id: 2,
                documentId,
                version: 1,
                title: 'Doc',
                state: 'En édition',
                createdAt: new Date().toISOString(),
            },
        ]),
    );

    const getDocumentVersion =
    jest.fn<Promise<DocumentVersionShape | null>, [number, number]>(
        (documentId, version) => Promise.resolve(
            version === 1
                ? {
                    id: 2,
                    documentId,
                    version,
                    title: 'Doc',
                    state: 'En édition',
                    createdAt: new Date().toISOString(),
                    snapshot: {
                        title: 'Doc',
                        state: 'En édition',
                        blocks: [],
                    },
                }
                : null,
        ),
    );

    const updateVersionState =
    jest.fn<Promise<DocumentVersionShape | null>, [number, string]>(
        (versionId, state) => Promise.resolve({
            id: versionId,
            documentId: 1,
            version: 2,
            title: 'Doc',
            state,
            createdAt: new Date().toISOString(),
        }),
    );

    return { getDocumentVersions, getDocumentVersion, updateVersionState };
});

afterEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = ORIGINAL_ENV;
});

describe('Documents routes', () => {
    describe('POST /documents', () => {
        it('returns 400 on invalid payload', async () => {
            const res = await request(app)
                .post('/documents')
                .send({})
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Données invalides');
        });

        it('creates document and returns 201 on valid payload', async () => {
            const payload = {
                title: 'Document test',
                version: 1,
                state: 'En édition',
                blocks: [
                    {
                        text: 'ceci est un test',
                        step: 1,
                        nbOfRepeats: 1,
                        images: [],
                    },
                ],
            };

            const res = await request(app)
                .post('/documents')
                .send(payload)
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(201);
            const body = res.body as DocumentShape;
            expect(body).toHaveProperty('id');
            expect(body.title).toBe('Document test');
        });

        it('returns validation errors with details', async () => {
            const payload = {
                title: '',
                version: 0,
            };

            const res = await request(app)
                .post('/documents')
                .send(payload)
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(400);
            const body = res.body as { errors?: unknown[], };
            expect(body).toHaveProperty('errors');
            expect(Array.isArray(body.errors)).toBe(true);
        });
    });

    describe('GET /documents', () => {
        it('returns list of documents', async () => {
            const res = await request(app).get('/documents');
            expect(res.status).toBe(200);
            const body = res.body as DocumentShape[];
            expect(Array.isArray(body)).toBe(true);
            expect(body[0]).toHaveProperty('title');
        });
    });

    describe('GET /documents/:id', () => {
        it('returns document when found', async () => {
            const res = await request(app).get('/documents/1');
            expect(res.status).toBe(200);
            const body = res.body as DocumentShape;
            expect(body).toHaveProperty('id', 1);
        });

        it('returns 400 when id is invalid', async () => {
            const res = await request(app).get('/documents/abc');
            expect(res.status).toBe(400);
            expect((res.body as { message?: string, }).message)
                .toBe('ID invalide');
        });

        it('returns 400 when id is not positive', async () => {
            const res = await request(app).get('/documents/0');
            expect(res.status).toBe(400);
            expect((res.body as { message?: string, }).message)
                .toBe('ID invalide');
        });

        it('returns 404 when not found', async () => {
            const res = await request(app).get('/documents/9999');
            expect(res.status).toBe(404);
            expect((res.body as { message?: string, })
                .message).toBe('Document non trouvé');
        });
    });

    describe('GET /documents/:id/versions', () => {
        it('returns document versions', async () => {
            const res = await request(app).get('/documents/1/versions');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect((res.body as DocumentVersionShape[])[0])
                .toHaveProperty('version');
        });

        it('returns 400 when id is invalid', async () => {
            const res = await request(app).get('/documents/abc/versions');
            expect(res.status).toBe(400);
            expect((res.body as { message?: string, }).message)
                .toBe('ID invalide');
        });
    });

    describe('GET /documents/:id/versions/:version', () => {
        it('returns one document version when found', async () => {
            const res = await request(app).get('/documents/1/versions/1');

            expect(res.status).toBe(200);
            expect((res.body as DocumentVersionShape))
                .toHaveProperty('version', 1);
        });

        it('returns 404 when version is not found', async () => {
            const res = await request(app).get('/documents/1/versions/999');

            expect(res.status).toBe(404);
            expect((res.body as { message?: string, })
                .message).toBe('Version non trouvée');
        });

        it('returns 400 when version param is invalid', async () => {
            const res = await request(app).get('/documents/1/versions/abc');
            expect(res.status).toBe(400);
            expect((res.body as { message?: string, }).message)
                .toBe('Paramètres invalides');
        });
    });

    describe('PATCH /documents/:id/versions/:versionId/state', () => {
        it('updates version state when payload is valid', async () => {
            const res = await request(app)
                .patch('/documents/1/versions/2/state')
                .send({ state: 'Actif' })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(200);
            expect((res.body as DocumentVersionShape).state)
                .toBe('Actif');
            expect(documentVersionManager.updateVersionState as jest.Mock)
                .toHaveBeenCalledWith(2, 'Actif');
        });

        it('returns 400 when params are invalid', async () => {
            const res = await request(app)
                .patch('/documents/abc/versions/2/state')
                .send({ state: 'Actif' })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(400);
            expect((res.body as { message?: string, }).message)
                .toBe('Paramètres invalides');
        });

        it('returns 400 when versionId is not positive', async () => {
            const res = await request(app)
                .patch('/documents/1/versions/0/state')
                .send({ state: 'Actif' })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(400);
            expect((res.body as { message?: string, }).message)
                .toBe('Paramètres invalides');
        });

        it('returns 400 when state is missing', async () => {
            const res = await request(app)
                .patch('/documents/1/versions/2/state')
                .send({})
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(400);
            expect((res.body as { message?: string, }).message)
                .toBe('Le champ "state" est requis et doit être une chaîne');
        });

        it('returns 400 when state is not a string', async () => {
            const res = await request(app)
                .patch('/documents/1/versions/2/state')
                .send({ state: 123 })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(400);
            expect((res.body as { message?: string, }).message)
                .toBe('Le champ "state" est requis et doit être une chaîne');
        });

        it('returns 404 when version is not found', async () => {
            (documentVersionManager.updateVersionState as jest.Mock)
                .mockResolvedValueOnce(null);

            const res = await request(app)
                .patch('/documents/1/versions/2/state')
                .send({ state: 'Actif' })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(404);
            expect((res.body as { message?: string, }).message)
                .toBe('Version non trouvée');
        });

        it('returns 500 when updateVersionState throws', async () => {
            (documentVersionManager.updateVersionState as jest.Mock)
                .mockImplementationOnce(() => {
                    throw new Error('fail');
                });

            const res = await request(app)
                .patch('/documents/1/versions/2/state')
                .send({ state: 'Actif' })
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(500);
            expect((res.body as { message?: string, }).message)
                .toBe('Erreur interne du serveur');
        });
    });

    describe('PUT /documents/:id', () => {
        it('updates document and returns 200 on valid payload', async () => {
            const payload = {
                title: 'Document mis à jour',
                version: 2,
                state: 'Actif',
                blocks: [
                    {
                        text: 'mis à jour',
                        step: 1,
                        nbOfRepeats: 2,
                        images: [],
                    },
                ],
            };

            const res = await request(app)
                .put('/documents/1')
                .send(payload)
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(200);
            const body = res.body as DocumentShape;
            expect(body).toHaveProperty('id', 1);
            expect(body.title).toBe('Document mis à jour');
        });

        it('returns 400 on invalid update payload', async () => {
            const res = await request(app)
                .put('/documents/1')
                .send({})
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(400);
        });

        it('returns 400 when id is invalid', async () => {
            const payload = {
                title: 'Document test',
                version: 1,
                state: 'En édition',
                blocks: [{ text: 'ok', step: 1, nbOfRepeats: 1, images: [] }],
            };

            const res = await request(app)
                .put('/documents/abc')
                .send(payload)
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(400);
            expect((res.body as { message?: string, }).message)
                .toBe('ID invalide');
        });

        it('returns 404 when updating a missing document', async () => {
            (documentManager.update as jest.Mock)
                .mockResolvedValueOnce(null);

            const payload = {
                title: 'Document absent',
                version: 1,
                state: 'En édition',
                blocks: [{ text: 'ok', step: 1, nbOfRepeats: 1, images: [] }],
            };

            const res = await request(app)
                .put('/documents/9999')
                .send(payload)
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(404);
            expect((res.body as { message?: string, }).message)
                .toBe('Document non trouvé');
        });

        it('returns validation errors with details on update', async () => {
            const payload = {
                title: '',
                version: 0,
            };

            const res = await request(app)
                .put('/documents/1')
                .send(payload)
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(400);
            const body = res.body as { errors?: unknown[], };
            expect(body).toHaveProperty('errors');
            expect(Array.isArray(body.errors)).toBe(true);
        });
    });

    describe('Global error and edge cases', () => {
        it('returns 404 on unknown route', async () => {
            const res = await request(app).get('/unknownroute');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('message', 'Not Found');
        });

        it('returns 500 if DocumentManager.create throws', async () => {
            (documentManager.create as jest.Mock).mockImplementationOnce(() => {
                throw new Error('fail');
            });
            const payload = {
                title: 'err',
                version: 1,
                blocks: [],
            };
            const res = await request(app)
                .post('/documents')
                .send(payload)
                .set('Content-Type', 'application/json');
            expect(res.status).toBe(500);
            expect(res.body)
                .toHaveProperty('message', 'Erreur interne du serveur');
        });

        it('returns 500 if DocumentManager.getAll throws', async () => {
            (documentManager.getAll as jest.Mock).mockImplementationOnce(() => {
                throw new Error('fail');
            });
            const res = await request(app).get('/documents');
            expect(res.status).toBe(500);
            expect(res.body)
                .toHaveProperty('message', 'Erreur interne du serveur');
        });

        it('returns 500 if DocumentManager.getById throws', async () => {
            (documentManager.getById as jest.Mock)
                .mockImplementationOnce(() => {
                    throw new Error('fail');
                });
            const res = await request(app).get('/documents/1');
            expect(res.status).toBe(500);
            expect(res.body)
                .toHaveProperty('message', 'Erreur interne du serveur');
        });

        it('returns 500 if DocumentManager.update throws', async () => {
            (documentManager.update as jest.Mock).mockImplementationOnce(() => {
                throw new Error('fail');
            });
            const payload = {
                title: 'err',
                version: 1,
                blocks: [],
            };
            const res = await request(app)
                .put('/documents/1')
                .send(payload)
                .set('Content-Type', 'application/json');
            expect(res.status).toBe(500);
            expect(res.body)
                .toHaveProperty('message', 'Erreur interne du serveur');
        });

        it('returns 500 if getDocumentVersions throws', async () => {
            (documentVersionManager.getDocumentVersions as jest.Mock)
                .mockImplementationOnce(() => {
                    throw new Error('fail');
                });
            const res = await request(app).get('/documents/1/versions');
            expect(res.status).toBe(500);
            expect(res.body)
                .toHaveProperty('message', 'Erreur interne du serveur');
        });

        it('returns 500 if getDocumentVersion throws', async () => {
            (documentVersionManager.getDocumentVersion as jest.Mock)
                .mockImplementationOnce(() => {
                    throw new Error('fail');
                });
            const res = await request(app).get('/documents/1/versions/1');
            expect(res.status).toBe(500);
            expect(res.body)
                .toHaveProperty('message', 'Erreur interne du serveur');
        });

        describe('Environment specific diagnostics', () => {
            it('omits error details outside development', async () => {
                process.env.NODE_ENV = 'test';
                (documentManager.create as jest.Mock)
                    .mockRejectedValueOnce('string error');
                const payload = { title: 'err', version: 1, blocks: [] };
                const res = await request(app)
                    .post('/documents')
                    .send(payload)
                    .set('Content-Type', 'application/json');
                expect(res.status).toBe(500);
                expect(res.body).not.toHaveProperty('error');
            });

            it('returns 500 with diagnostics when create rejects with string in development',
                async () => {
                    process.env.NODE_ENV = 'development';
                    (documentManager.create as jest.Mock)
                        .mockRejectedValueOnce('string error');
                    const payload = { title: 'err', version: 1, blocks: [] };
                    const res = await request(app)
                        .post('/documents')
                        .send(payload)
                        .set('Content-Type', 'application/json');
                    expect(res.status).toBe(500);
                    expect(res.body)
                        .toHaveProperty('error', 'string error');
                },
            );

            it('returns 500 with diagnostics when getAll rejects with string in development',
                async () => {
                    process.env.NODE_ENV = 'development';
                    (documentManager.getAll as jest.Mock)
                        .mockRejectedValueOnce('getAll failure');
                    const res = await request(app).get('/documents');
                    expect(res.status).toBe(500);
                    expect(res.body)
                        .toHaveProperty('error', 'getAll failure');
                },
            );

            it('returns 500 with diagnostics when getById rejects with string in development',
                async () => {
                    process.env.NODE_ENV = 'development';
                    (documentManager.getById as jest.Mock)
                        .mockRejectedValueOnce('getById failure');
                    const res = await request(app).get('/documents/1');
                    expect(res.status).toBe(500);
                    expect(res.body)
                        .toHaveProperty('error', 'getById failure');
                },
            );

            it('returns 500 with diagnostics when update rejects with string in development',
                async () => {
                    process.env.NODE_ENV = 'development';
                    (documentManager.update as jest.Mock)
                        .mockRejectedValueOnce('update failure');
                    const payload = { title: 'err', version: 1, blocks: [] };
                    const res = await request(app)
                        .put('/documents/1')
                        .send(payload)
                        .set('Content-Type', 'application/json');
                    expect(res.status).toBe(500);
                    expect(res.body)
                        .toHaveProperty('error', 'update failure');
                },
            );

            it('surfaces Error details for create failures in development',
                async () => {
                    process.env.NODE_ENV = 'development';
                    (documentManager.create as jest.Mock)
                        .mockImplementationOnce(() => {
                            throw new Error('create boom');
                        });
                    const payload = {
                        title: 'err',
                        version: 1,
                        blocks: [],
                    };
                    const res = await request(app)
                        .post('/documents')
                        .send(payload)
                        .set('Content-Type', 'application/json');
                    expect(res.status).toBe(500);
                    expect(res.body).toHaveProperty('error', 'create boom');
                });

            it('surfaces Error details for getAll in development', async () => {
                process.env.NODE_ENV = 'development';
                (documentManager.getAll as jest.Mock)
                    .mockImplementationOnce(() => {
                        throw new Error('getAll boom');
                    });
                const res = await request(app).get('/documents');
                expect(res.status).toBe(500);
                expect(res.body).toHaveProperty('error', 'getAll boom');
            });

            it('surfaces Error details for getById in development',
                async () => {
                    process.env.NODE_ENV = 'development';
                    (documentManager.getById as jest.Mock)
                        .mockImplementationOnce(() => {
                            throw new Error('getById boom');
                        });
                    const res = await request(app).get('/documents/1');
                    expect(res.status).toBe(500);
                    expect(res.body).toHaveProperty('error', 'getById boom');
                });

            it('surfaces Error details for update in development', async () => {
                process.env.NODE_ENV = 'development';
                (documentManager.update as jest.Mock)
                    .mockImplementationOnce(() => {
                        throw new Error('update boom');
                    });
                const payload = {
                    title: 'err',
                    version: 1,
                    blocks: [],
                };
                const res = await request(app)
                    .put('/documents/1')
                    .send(payload)
                    .set('Content-Type', 'application/json');
                expect(res.status).toBe(500);
                expect(res.body).toHaveProperty('error', 'update boom');
            });
        });

        describe('Environment diagnostics for version routes', () => {
            it('surfaces Error details for getDocumentVersions in development',
                async () => {
                    process.env.NODE_ENV = 'development';
                    (documentVersionManager.getDocumentVersions as jest.Mock)
                        .mockImplementationOnce(() => {
                            throw new Error('versions boom');
                        });
                    const res = await request(app).get('/documents/1/versions');
                    expect(res.status).toBe(500);
                    expect(res.body).toHaveProperty('error', 'versions boom');
                });

            it('surfaces Error details for getDocumentVersion in development',
                async () => {
                    process.env.NODE_ENV = 'development';
                    (documentVersionManager.getDocumentVersion as jest.Mock)
                        .mockImplementationOnce(() => {
                            throw new Error('version boom');
                        });
                    const res = await request(app).get('/documents/1/versions/1');
                    expect(res.status).toBe(500);
                    expect(res.body).toHaveProperty('error', 'version boom');
                });

            it('surfaces Error details for updateDocumentVersionState in development',
                async () => {
                    process.env.NODE_ENV = 'development';
                    (documentVersionManager.updateVersionState as jest.Mock)
                        .mockImplementationOnce(() => {
                            throw new Error('state boom');
                        });
                    const res = await request(app)
                        .patch('/documents/1/versions/2/state')
                        .send({ state: 'Actif' })
                        .set('Content-Type', 'application/json');
                    expect(res.status).toBe(500);
                    expect(res.body).toHaveProperty('error', 'state boom');
                });
        });

        it('creates document with canvasData and returns 201', async () => {
            const payload = {
                title: 'Canvas document',
                version: 1,
                state: 'En édition',
                blocks: [
                    {
                        text: '',
                        step: 1,
                        nbOfRepeats: 1,
                        images: [],
                        canvasData: 'data:image/png;base64,abc==',
                    },
                ],
            };
            const res = await request(app)
                .post('/documents')
                .send(payload)
                .set('Content-Type', 'application/json');
            expect(res.status).toBe(201);
        });
    });
});