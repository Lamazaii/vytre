import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const documents = await prisma.document.findMany({
    include: {
      blocks: {
        include: {
          images: true,
        },
      },
    },
  });

  console.log(documents);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
