import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("ChangeMe123!", 12);

  const admin = await db.user.upsert({
    where: {
      email: "admin@minifygadgets.com",
    },
    update: {},
    create: {
      name: "MINIFY Admin",
      email: "admin@minifygadgets.com",
      phone: "0700000000",
      passwordHash: hash,
      role: "ADMIN",
      verified: true,
    },
  });

  const seller = await db.user.upsert({
    where: {
      email: "seller@minifygadgets.com",
    },
    update: {},
    create: {
      name: "MINIFY GADGETS",
      email: "seller@minifygadgets.com",
      phone: "0703080566",
      passwordHash: hash,
      role: "SELLER",
      verified: true,
    },
  });

  await db.user.upsert({
    where: {
      email: "buyer@minifygadgets.com",
    },
    update: {},
    create: {
      name: "Demo Buyer",
      email: "buyer@minifygadgets.com",
      phone: "0700000001",
      passwordHash: hash,
      role: "BUYER",
      verified: false,
    },
  });

  const categories = [
    ["Phones & Tablets", "phones-tablets"],
    ["Mobile Phones", "mobile-phones"],
    ["Accessories", "accessories"],
    ["Laptops & Computers", "laptops-computers"],
    ["TV & Video", "tv-video"],
    ["Audio", "audio"],
  ];

  for (const [name, slug] of categories) {
    await db.category.upsert({
      where: {
        slug,
      },
      update: {},
      create: {
        name,
        slug,
      },
    });
  }

  const phoneCategory = await db.category.findUnique({
    where: {
      slug: "mobile-phones",
    },
  });

  if (phoneCategory) {
    const existingAd = await db.ad.findFirst({
      where: {
        sellerId: seller.id,
        title: "iPhone 15 Pro 256GB",
      },
    });

    if (!existingAd) {
      await db.ad.create({
        data: {
          sellerId: seller.id,
          categoryId: phoneCategory.id,
          title: "iPhone 15 Pro 256GB",
          slug: "iphone-15-pro-256gb-demo",
          description:
            "MINIFY GADGETS demo listing. Clean condition, checked and ready for purchase.",
          price: 3200000,
          condition: "USED",
          city: "Kampala",
          location: "Downtown Kampala",
          status: "ACTIVE",
          publishedAt: new Date(),
          images: {
            create: [
              {
                url: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=1200&q=80",
                sortOrder: 0,
              },
            ],
          },
        },
      });
    }
  }

  console.log("MINIFY MARKET database seed completed successfully.");
  console.log(`Admin: ${admin.email}`);
  console.log(`Seller: ${seller.email}`);
  console.log("Buyer: buyer@minifygadgets.com");
  console.log("Demo password: ChangeMe123!");
}

main()
  .catch((error) => {
    console.error("MINIFY MARKET database seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });