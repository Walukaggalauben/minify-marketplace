import { PrismaClient } from "@prisma/client";
const db=new PrismaClient();
const tree:Record<string,string[]>={
  "Phones & Tablets":["Mobile Phones","Tablets","Smart Watches","Phone & Tablet Accessories","Headphones"],
  "Vehicles":["Cars","Motorcycles & Scooters","Buses & Microbuses","Trucks & Trailers","Vehicle Parts & Accessories"],
  "Property":["Houses & Apartments For Rent","Houses & Apartments For Sale","Land & Plots For Sale","Land & Plots For Rent","Commercial Property"],
  "Electronics":["Laptops & Computers","TV & Video","Audio & Music","Cameras","Gaming Consoles & Games","Networking & Internet","Printers & Scanners","Computer Accessories"],
  "Home, Furniture & Appliances":["Furniture","Home Appliances","Kitchen Appliances & Cookware","Lighting","Home Accessories","Garden & Outdoor"],
  "Fashion":["Women's Fashion","Men's Fashion","Kids' Fashion","Shoes","Bags & Accessories"],
  "Beauty & Personal Care":["Hair & Beauty","Skin Care","Fragrances","Makeup","Tools & Accessories"],
  "Services":["Building & Trades","Car Services","Computer & IT Services","Repair Services","Cleaning Services","Photography & Video","Delivery & Logistics","Education & Training","Events & Entertainment","Beauty & Wellness Services","Other Services"],
  "Jobs & Work":["Jobs","Seeking Work / CVs"],
  "Babies & Kids":["Baby & Kids Clothing","Toys & Games","Baby Equipment"],
  "Food, Agriculture & Farming":["Farm Produce","Farm Equipment","Livestock & Poultry"],
  "Pets":["Birds","Cats & Kittens","Dogs","Fish","Other Pets","Pet Supplies"],
  "Commercial Equipment & Tools":["Industrial Equipment","Construction Equipment","Office Equipment","Tools"],
  "Leisure & Activities":["Sports Equipment","Musical Instruments","Books & Hobbies"],
  "Business & Industry":["Business Opportunities","Office & Retail","Other Business & Industry"]
};
const slug=(s:string)=>s.toLowerCase().replace(/&/g,'and').replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
async function main(){
 const roots=await db.category.findMany({where:{parentId:null}});
 const byName=new Map(roots.map(r=>[r.name,r]));
 const pets=byName.get('Animals & Pets'); if(pets){await db.category.update({where:{id:pets.id},data:{name:'Pets',slug:'pets'}});byName.delete('Animals & Pets');byName.set('Pets',{...pets,name:'Pets',slug:'pets'} as any);}
 for(const [rootName,names] of Object.entries(tree)){let root=byName.get(rootName);if(!root && rootName==='Pets')root=await db.category.findUnique({where:{slug:'pets'}})||undefined;if(!root)continue;
   for(const name of names){const s=slug(name);await db.category.upsert({where:{slug:s},update:{name,parentId:root.id},create:{name,slug:s,parentId:root.id}})}
 }
 const deeper:Record<string,string[]>={
  "Phone & Tablet Accessories":["Chargers & Cables","Cases & Covers","Screen Protectors","Power Banks","Car Chargers"],
  "Cars":["Toyota","Nissan","Subaru","Mercedes-Benz","BMW","Other Cars"],
  "Laptops & Computers":["Laptops","Desktop Computers","Monitors","Computer Components"],
  "TV & Video":["LED TVs","Smart TVs","Projectors","TV Accessories"],
  "Women's Fashion":["Dresses","Tops & Shirts","Trousers & Jeans","Skirts","Traditional Wear"],
  "Men's Fashion":["Shirts","Trousers & Jeans","Suits","Traditional Wear","Jackets"],
  "Shoes":["Women's Shoes","Men's Shoes","Kids' Shoes","Sneakers","Sandals"],
  "Home Appliances":["Fridges & Freezers","Washing Machines","Cookers & Ovens","Microwaves","Air Conditioners"],
  "Farm Produce":["Cereals","Fruits","Vegetables","Coffee","Other Produce"],
  "Livestock & Poultry":["Cattle","Goats","Sheep","Pigs","Chicken","Other Livestock"],
  "Birds":["Parrots","Canaries","Pigeons","Other Birds"],
  "Cats & Kittens":["Kittens","Adult Cats","Other Cats"],
  "Dogs":["Puppies","Adult Dogs","Other Dogs"],
  "Fish":["Aquarium Fish","Pond Fish","Other Fish"],
  "Pet Supplies":["Pet Food","Cages & Kennels","Aquariums","Pet Accessories"]
 };
 const all=await db.category.findMany(); const map=new Map(all.map(c=>[c.name,c]));
 for(const [parent,names] of Object.entries(deeper)){const p=map.get(parent);if(!p)continue;for(const name of names){const s=slug(parent+'-'+name);await db.category.upsert({where:{slug:s},update:{name,parentId:p.id},create:{name,slug:s,parentId:p.id}})}}
 console.log('Category catalog synced');
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>db.$disconnect());
