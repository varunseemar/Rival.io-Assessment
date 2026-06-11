import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", passwordHash: password, role: "ADMIN" },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: { email: "user@example.com", passwordHash: password, role: "USER" },
  });

  // Give the demo user a few tasks if they have none.
  const count = await prisma.task.count({ where: { userId: user.id } });
  if (count === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: "Write project README",
          description: "Document setup and trade-offs",
          status: "IN_PROGRESS",
          priority: "HIGH",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
          userId: user.id,
        },
        {
          title: "Buy groceries",
          description: "Milk, eggs, bread",
          status: "TODO",
          priority: "LOW",
          userId: user.id,
        },
        {
          title: "Deploy backend to Render",
          status: "TODO",
          priority: "MEDIUM",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
          userId: user.id,
        },
      ],
    });
  }

  console.log("Seeded users:");
  console.log(`  ADMIN  -> ${admin.email} / password123`);
  console.log(`  USER   -> ${user.email} / password123`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
