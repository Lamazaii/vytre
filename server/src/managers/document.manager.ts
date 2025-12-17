import { prisma } from '../lib/prisma';

// fonction qui reçoit les données validées et les enregistre
export const create = async (data: { title: string; version: string; blocks?: any[] }) => {
  
  return await prisma.document.create({
    data: {
      title: data.title,
      version: data.version,
      // Ici, on crée les blocs en même temps que le document
      blocks: {
        create: data.blocks?.map((block) => ({
          text: block.text,
          step: block.step,
          nbOfRepeats: block.nbOfRepeats
        }))
      }
    },
    // Le "include" permet de récupérer l'objet créé avec ses blocs dans la réponse
    include: {
      blocks: true
    }
  });
};