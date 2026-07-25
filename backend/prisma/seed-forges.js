import { PrismaClient } from "@prisma/client";
import { FORGES } from "../src/config/forgeConfig.js";

const prisma = new PrismaClient();

async function main() {
  let order = 0;
  for (const [key, def] of Object.entries(FORGES)) {
    await prisma.forge.upsert({
      where: { key },
      update: { name: def.name, superCategory: def.superCategory, icon: def.icon },
      create: {
        key,
        name: def.name,
        superCategory: def.superCategory,
        icon: def.icon,
        order: order++
      }
    });
  }
  console.log(`Seeded ${Object.keys(FORGES).length} forges.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
