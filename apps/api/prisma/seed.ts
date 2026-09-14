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

  const roots = [
    ["Phones & Tablets","phones-tablets"],["Vehicles","vehicles"],["Property","property"],["Electronics","electronics"],["Home, Furniture & Appliances","home-furniture-appliances"],["Fashion","fashion"],["Beauty & Personal Care","beauty-personal-care"],["Services","services"],["Jobs & Work","jobs-work"],["Babies & Kids","babies-kids"],["Food, Agriculture & Farming","food-agriculture-farming"],["Animals & Pets","animals-pets"],["Commercial Equipment & Tools","commercial-equipment-tools"],["Leisure & Activities","leisure-activities"],["Business & Industry","business-industry"]
  ];
  const rootIds = new Map<string,string>();
  for (const [name,slug] of roots) { const c=await db.category.upsert({where:{slug},update:{name,parentId:null},create:{name,slug}}); rootIds.set(slug,c.id); }
  const children: Array<[string,string,string]> = [
    ["Phones & Tablets","Mobile Phones","mobile-phones"],["Phones & Tablets","Tablets","tablets"],["Phones & Tablets","Smart Watches","smart-watches"],["Phones & Tablets","Phone & Tablet Accessories","phone-tablet-accessories"],["Phones & Tablets","Headphones","headphones"],
    ["Vehicles","Cars","cars"],["Vehicles","Motorcycles & Scooters","motorcycles-scooters"],["Vehicles","Buses & Microbuses","buses-microbuses"],["Vehicles","Trucks & Trailers","trucks-trailers"],["Vehicles","Vehicle Parts & Accessories","vehicle-parts-accessories"],
    ["Property","Houses & Apartments For Rent","houses-apartments-rent"],["Property","Houses & Apartments For Sale","houses-apartments-sale"],["Property","Land & Plots For Sale","land-plots-sale"],["Property","Land & Plots For Rent","land-plots-rent"],["Property","Commercial Property","commercial-property"],
    ["Electronics","Laptops & Computers","laptops-computers"],["Electronics","TV & Video","tv-video"],["Electronics","Audio & Music","audio-music"],["Electronics","Cameras","cameras"],["Electronics","Gaming Consoles & Games","gaming-consoles-games"],["Electronics","Networking & Internet","networking-internet"],["Electronics","Printers & Scanners","printers-scanners"],["Electronics","Computer Accessories","computer-accessories"],
    ["Home, Furniture & Appliances","Furniture","furniture"],["Home, Furniture & Appliances","Home Appliances","home-appliances"],["Home, Furniture & Appliances","Kitchen Appliances & Cookware","kitchen-appliances-cookware"],["Home, Furniture & Appliances","Lighting","lighting"],["Home, Furniture & Appliances","Home Accessories","home-accessories"],["Home, Furniture & Appliances","Garden & Outdoor","garden-outdoor"],
    ["Fashion","Women's Fashion","womens-fashion"],["Fashion","Men's Fashion","mens-fashion"],["Fashion","Kids' Fashion","kids-fashion"],["Fashion","Shoes","shoes"],["Fashion","Bags & Accessories","bags-accessories"],
    ["Beauty & Personal Care","Hair & Beauty","hair-beauty"],["Beauty & Personal Care","Skin Care","skin-care"],["Beauty & Personal Care","Fragrances","fragrances"],["Beauty & Personal Care","Makeup","makeup"],["Beauty & Personal Care","Tools & Accessories","beauty-tools-accessories"],
    ["Services","Building & Trades","building-trades"],["Services","Car Services","car-services"],["Services","Computer & IT Services","computer-it-services"],["Services","Repair Services","repair-services"],["Services","Cleaning Services","cleaning-services"],["Services","Photography & Video","photography-video"],["Services","Delivery & Logistics","delivery-logistics"],["Services","Education & Training","education-training"],["Services","Events & Entertainment","events-entertainment"],["Services","Beauty & Wellness Services","beauty-wellness-services"],["Services","Other Services","other-services"],
    ["Jobs & Work","Jobs","jobs"],["Jobs & Work","Seeking Work / CVs","seeking-work-cvs"],["Babies & Kids","Baby & Kids Clothing","baby-kids-clothing"],["Babies & Kids","Toys & Games","toys-games"],["Babies & Kids","Baby Equipment","baby-equipment"],["Food, Agriculture & Farming","Farm Produce","farm-produce"],["Food, Agriculture & Farming","Farm Equipment","farm-equipment"],["Food, Agriculture & Farming","Livestock & Poultry","livestock-poultry"],["Animals & Pets","Dogs","dogs"],["Animals & Pets","Cats","cats"],["Animals & Pets","Other Pets","other-pets"],["Animals & Pets","Pet Supplies","pet-supplies"],["Commercial Equipment & Tools","Industrial Equipment","industrial-equipment"],["Commercial Equipment & Tools","Construction Equipment","construction-equipment"],["Commercial Equipment & Tools","Office Equipment","office-equipment"],["Commercial Equipment & Tools","Tools","tools"],["Leisure & Activities","Sports Equipment","sports-equipment"],["Leisure & Activities","Musical Instruments","musical-instruments"],["Leisure & Activities","Books & Hobbies","books-hobbies"],["Business & Industry","Business Opportunities","business-opportunities"],["Business & Industry","Office & Retail","office-retail"],["Business & Industry","Other Business & Industry","other-business-industry"]
  ];
  for (const [parentName,name,slug] of children) { const root=roots.find(([n])=>n===parentName); const parentId=root?rootIds.get(root[1]):undefined; if(parentId) await db.category.upsert({where:{slug},update:{name,parentId},create:{name,slug,parentId}}); }
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