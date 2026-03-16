BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[DocumentVersion] (
    [id] INT NOT NULL IDENTITY(1,1),
    [documentId] INT NOT NULL,
    [version] INT NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [state] NVARCHAR(1000) NOT NULL,
    [snapshot] NVARCHAR(MAX) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DocumentVersion_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DocumentVersion_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DocumentVersion_documentId_version_idx] ON [dbo].[DocumentVersion]([documentId], [version]);

-- CreateIndex
CREATE UNIQUE NONCLUSTERED INDEX [DocumentVersion_documentId_version_key] ON [dbo].[DocumentVersion]([documentId], [version]);

-- AddForeignKey
ALTER TABLE [dbo].[DocumentVersion] ADD CONSTRAINT [DocumentVersion_documentId_fkey]
FOREIGN KEY ([documentId]) REFERENCES [dbo].[Document]([id])
ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW;

END CATCH
