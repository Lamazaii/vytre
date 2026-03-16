import { createDocumentSchema } from '../src/validators/document.validator';

describe('Document validator', () => {
    describe('createDocumentSchema', () => {
        it('should validate a valid document', () => {
            const validDoc = {
                title: 'Test Document',
                version: 1,
                state: 'En édition',
                blocks: [
                    {
                        text: 'Sample text',
                        step: 1,
                        nbOfRepeats: 2,
                        images: [{ imagePath: '/path/to/image.jpg' }],
                        textZones: ['zone1', 'zone2'],
                    },
                ],
            };

            const result = createDocumentSchema.safeParse(validDoc);
            expect(result.success).toBe(true);
        });

        it('should reject empty title', () => {
            const invalidDoc = {
                title: '',
                version: 1,
            };

            const result = createDocumentSchema.safeParse(invalidDoc);
            expect(result.success).toBe(false);
        });

        it('should reject version less than 1', () => {
            const invalidDoc = {
                title: 'Test',
                version: 0,
            };

            const result = createDocumentSchema.safeParse(invalidDoc);
            expect(result.success).toBe(false);
        });

        it('should handle missing title', () => {
            const invalidDoc = {
                version: 1,
            };

            const result = createDocumentSchema.safeParse(invalidDoc);
            expect(result.success).toBe(false);
        });

        it('should handle document without blocks', () => {
            const doc = {
                title: 'No blocks document',
                version: 1,
            };

            const result = createDocumentSchema.safeParse(doc);
            expect(result.success).toBe(true);
        });

        describe('block validation', () => {
            it('should accept block with text only', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'Some text',
                            step: 1,
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.blocks![0].text).toBe('Some text');
                }
            });

            it('should reject block with step less than 1', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 0,
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(false);
            });

            it('should handle nbOfRepeats as string with comma', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 1,
                            nbOfRepeats: '2,5',
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.blocks![0].nbOfRepeats).toBe(2.5);
                }
            });

            it('should handle nbOfRepeats as string with dot', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 1,
                            nbOfRepeats: '3.75',
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.blocks![0].nbOfRepeats).toBe(3.75);
                }
            });

            it('should handle nbOfRepeats as number', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 1,
                            nbOfRepeats: 4,
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.blocks![0].nbOfRepeats).toBe(4);
                }
            });

            it('should default nbOfRepeats to 1 when NaN string provided',
                () => {
                    const doc = {
                        title: 'Test',
                        version: 1,
                        blocks: [
                            {
                                text: 'text',
                                step: 1,
                                nbOfRepeats: 'invalid',
                            },
                        ],
                    };

                    const result = createDocumentSchema.safeParse(doc);
                    expect(result.success).toBe(true);
                    if (result.success) {
                        expect(result.data.blocks![0].nbOfRepeats).toBe(1);
                    }
                });

            it('should reject nbOfRepeats less than 0.001', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 1,
                            nbOfRepeats: 0.0001,
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(false);
            });

            it('should reject nbOfRepeats greater than 9999', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 1,
                            nbOfRepeats: 10000,
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(false);
            });

            it('should default to empty text when not provided', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            step: 1,
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.blocks![0].text).toBe('');
                }
            });

            it('should default to empty images array when not provided', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 1,
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.blocks![0].images).toEqual([]);
                }
            });

            it('should default to empty textZones array when not provided',
                () => {
                    const doc = {
                        title: 'Test',
                        version: 1,
                        blocks: [
                            {
                                text: 'text',
                                step: 1,
                            },
                        ],
                    };

                    const result = createDocumentSchema.safeParse(doc);
                    expect(result.success).toBe(true);
                    if (result.success) {
                        expect(result.data.blocks![0].textZones).toEqual([]);
                    }
                });

            it('should reject image with empty imagePath', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 1,
                            images: [{ imagePath: '' }],
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(false);
            });

            it('should accept multiple images', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 1,
                            images: [
                                { imagePath: '/path1.jpg' },
                                { imagePath: '/path2.jpg' },
                            ],
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.blocks![0].images.length).toBe(2);
                }
            });

            it('should accept multiple textZones', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 1,
                            textZones: ['zone 1', 'zone 2', 'zone 3'],
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.blocks![0].textZones.length).toBe(3);
                }
            });

            it('should accept block with canvasData', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [
                        {
                            text: 'text',
                            step: 1,
                            canvasData: 'data:image/png;base64,abc123==',
                        },
                    ],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.blocks![0].canvasData)
                        .toBe('data:image/png;base64,abc123==');
                }
            });

            it('should allow canvasData to be omitted (optional)', () => {
                const doc = {
                    title: 'Test',
                    version: 1,
                    blocks: [{ text: 'text', step: 1 }],
                };

                const result = createDocumentSchema.safeParse(doc);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.blocks![0].canvasData).toBeUndefined();
                }
            });

            it('should accept a fully populated block including canvasData',
                () => {
                    const doc = {
                        title: 'Full block',
                        version: 1,
                        blocks: [
                            {
                                text: 'some text',
                                step: 2,
                                nbOfRepeats: 3,
                                images: [{ imagePath: '/img.png' }],
                                textZones: ['zone A'],
                                canvasData: 'canvas-json-string',
                            },
                        ],
                    };

                    const result = createDocumentSchema.safeParse(doc);
                    expect(result.success).toBe(true);
                    if (result.success) {
                        const block = result.data.blocks![0];
                        expect(block.canvasData).toBe('canvas-json-string');
                        expect(block.images.length).toBe(1);
                        expect(block.textZones.length).toBe(1);
                    }
                });
        });
    });
});
