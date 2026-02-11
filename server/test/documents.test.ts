import request from 'supertest';
import app from '../app';
import * as documentManager from '../src/managers/document.manager';

interface Image {
    imagePath?: string;
}

interface Block {
    text?: string;
    step: number;
    nbOfRepeats?: number;
    images?: Image[];
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

    const update = jest.fn<Promise<DocumentShape>, [number, CreateInput]>(
        (id, data) =>
            Promise.resolve({
                id,
                ...data,
                blocks: data.blocks ?? [],
            },
            ));

    return { create, getAll, getById, update };
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
            const body = res.body as { errors?: unknown[] };
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

        it('returns 404 when not found', async () => {
            const res = await request(app).get('/documents/9999');
            expect(res.status).toBe(404);
            expect((res.body as { message?: string, })
                .message).toBe('Document non trouvé');
        });
    });

    describe('PUT /documents/:id', () => {
        it('updates document and returns 200 on valid payload', async () => {
            const payload = {
                title: 'Document mis à jour',
                version: 2,
                state: 'Actif',
                blocks: [
                    { text: 'mis à jour', step: 1, nbOfRepeats: 2, images: [] },
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
            const body = res.body as { errors?: unknown[] };
            expect(body).toHaveProperty('errors');
            expect(Array.isArray(body.errors)).toBe(true);
        });
    });

    describe('Global error and edge cases', () => {
        it('returns 404 on unknown route', async () => {
            const res = await request(app).get('/unknownroute');
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error');
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
    });
});