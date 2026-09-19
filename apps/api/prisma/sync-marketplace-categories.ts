import { PrismaClient } from "@prisma/client";
const db=new PrismaClient();

const tree:Record<string,string[]>={
 "Vehicles":["Vehicle Parts & Accessories","Cars","Motorcycles & Scooters","Buses & Microbuses","Trucks & Trailers","Construction & Heavy Machinery","Watercraft & Boats","Personal Mobility","Car Services"],
 "Property":["New Builds","Houses & Apartments For Rent","Houses & Apartments For Sale","Short Let","Land & Plots For Rent","Land & Plots For Sale","Event Centres, Venues & Workstations","Commercial Property For Rent","Commercial Property For Sale"],
 "Phones & Tablets":["Mobile Phones","Accessories for Phones & Tablets","Smart Watches","Tablets","Headphones"],
 "Electronics":["Laptops & Computers","TV & Video Equipment","Video Game Consoles","Audio & Music Equipment","Headphones","Photo & Video Cameras","Security & Surveillance","Networking Products","Printers & Scanners","Computer Monitors","Computer Hardware","Computer Accessories","Accessories & Supplies for Electronics","Video Games","Software"],
 "Home, Furniture & Appliances":["Furniture","Lighting","Storage & Organization","Home Accessories","Home Appliances","Kitchen Appliances","Kitchenware & Cookware","Household Chemicals","Garden Supplies"],
 "Fashion":["Women's Fashion","Men's Fashion","Baby&Kids' Fashion"],
 "Beauty & Personal Care":["Hair Beauty","Face Care","Oral Care","Body Care","Fragrance","Makeup","Sexual Wellness","Tools & Accessories","Vitamins & Supplements","Massagers","Health & Beauty Services"],
 "Services":["Building & Trades Services","Car Services","Computer & IT Services","Repair Services","Cleaning Services","Printing Services","Manufacturing Services","Logistics Services","Legal Services","Tax & Financial Services","Recruitment Services","Rental Services","Chauffeur & Airport Transfer Services","Travel Agents & Tours","Classes & Courses","Child Care & Education Services","Health & Beauty Services","Fitness & Personal Training Services","Party, Catering & Event Services","DJ & Entertainment Services","Wedding Venues & Services","Photography & Video Services","Landscaping & Gardening Services","Pet Services","Other Services"],
 "Repair & Construction":["Building Materials","Electrical Equipment","Plumbing & Water Systems","Hand Tools","Power Tools","Hardware & Fasteners","Paints & Finishes","Construction Equipment","Safety Equipment"],
 "Commercial Equipment & Tools":["Construction Equipment","Industrial Equipment","Office Equipment","Restaurant & Catering Equipment","Retail & Store Equipment","Manufacturing Equipment","Measuring & Testing Tools","Printing & Graphics Equipment","Electrical Equipment","Electrical Hand Tools","Solar & Renewable","Tools"],
 "Leisure & Activities":["Sports Equipment","Musical Instruments","Books & Hobbies","Arts, Crafts & Awards","Camping & Hiking","Fitness Equipment","Games & Recreation"],
 "Babies & Kids":["Baby & Kids Clothing","Baby Gear & Equipment","Toys & Games","Babies & Kids Accessories","Transport & Safety","Care & Feeding","School Supplies"],
 "Food, Agriculture & Farming":["Farm Produce","Farm Equipment","Livestock & Poultry","Seeds & Seedlings","Fertilizers & Chemicals","Animal Feed","Farm Tools","Agricultural Services"],
 "Animals & Pets":["Birds","Cats & Kittens","Dogs","Fish","Other Pets","Pet Supplies","Livestock"],
 "Jobs & Work":["Jobs","Seeking Work / CVs"],
 "Business & Industry":["Business Opportunities","Office & Retail","Manufacturing Materials & Supplies","Business Equipment","Wholesale & Distribution","Other Business & Industry"]
};

const deeper:Record<string,string[]>={
 "Mobile Phones":["Smartphones","Feature Phones","Protected Phones"],
 "Accessories for Phones & Tablets":["Chargers & Cables","Cases & Covers","Screen Protectors","Power Banks","Car Chargers","Holders & Mounts","Other Accessories"],
 "Cars":["Toyota","Nissan","Subaru","Mercedes-Benz","BMW","Mitsubishi","Honda","Hyundai","Kia","Mazda","Land Rover","Lexus","Other Cars"],
 "Motorcycles & Scooters":["Motorcycles","Scooters","Electric Motorcycles","Motorcycle Parts"],
 "Vehicle Parts & Accessories":["Tyres & Wheels","Engine Parts","Body Parts","Electrical Parts","Interior Accessories","Car Care","Car Audio","Other Parts"],
 "Laptops & Computers":["Laptops","Desktop Computers","Computer Components","Monitors"],
 "TV & Video Equipment":["LED TVs","Smart TVs","Projectors","TV Accessories","Streaming Devices"],
 "Home Appliances":["Fridges & Freezers","Washing Machines","Cookers & Ovens","Microwaves","Air Conditioners","Fans","Vacuum Cleaners","Irons","Water Heaters","Sewing Machines"],
 "Kitchen Appliances":["Blenders & Juicers","Cookers","Microwaves","Air Fryers","Fridges & Freezers","Kettles","Coffee Machines"],
 "Furniture":["Beds & Mattresses","Sofas","Tables & Desks","Chairs","Wardrobes","TV Stands","Outdoor Furniture"],
 "Women's Fashion":["Dresses","Tops & Shirts","Trousers & Jeans","Skirts","Traditional Wear","Women's Shoes","Women's Bags","Jewelry"],
 "Men's Fashion":["Shirts","Trousers & Jeans","Suits","Traditional Wear","Men's Shoes","Men's Bags","Watches"],
 "Baby&Kids' Fashion":["Baby Clothing","Girls' Clothing","Boys' Clothing","Kids' Shoes","School Uniforms"],
 "Hair Beauty":["Wigs","Hair Extensions","Hair Products","Barbershop Equipment","Salon Equipment"],
 "Face Care":["Cleansers","Moisturizers","Serums","Masks","Sunscreen"],
 "Fragrance":["Perfumes","Body Sprays","Deodorants"],
 "Makeup":["Foundation","Lip Makeup","Eye Makeup","Makeup Sets"],
 "Building & Trades Services":["Plumbing","Electrical","Carpentry","Masonry","Painting","Roofing","Welding","Tiling"],
 "Car Services":["Car Repair","Car Wash","Auto Electrical","Tyre Services","Towing","Vehicle Inspection"],
 "Computer & IT Services":["Computer Repair","Phone Repair","Software Services","Web Design","Networking","CCTV Installation"],
 "Repair Services":["Appliance Repair","Electronics Repair","Phone Repair","Furniture Repair","Other Repairs"],
 "Farm Produce":["Cereals","Fruits","Vegetables","Coffee","Dairy","Honey","Other Produce"],
 "Farm Equipment":["Tractors","Irrigation","Sprayers","Harvesting Equipment","Animal Husbandry Equipment"],
 "Livestock & Poultry":["Cattle","Goats","Sheep","Pigs","Chicken","Ducks","Rabbits","Other Livestock"],
 "Pet Supplies":["Pet Food","Cages & Kennels","Aquariums","Pet Accessories","Grooming Supplies"],
 "Birds":["Parrots","Canaries","Pigeons","Finches","Other Birds"],
 "Dogs":["Puppies","Adult Dogs","Dog Accessories"],
 "Cats & Kittens":["Kittens","Adult Cats","Cat Accessories"],
 "Jobs":["Accounting & Finance Jobs","Advertising & Marketing Jobs","Arts & Entertainment Jobs","Construction & Skilled Trade Jobs","Customer Service Jobs","Driver Jobs","Education Jobs","Engineering Jobs","Health & Beauty Jobs","Hospitality Jobs","IT Jobs","Office Jobs","Sales Jobs","Security Jobs","Other Jobs"],
 "Seeking Work / CVs":["Accounting & Finance CVs","Advertising & Marketing CVs","Construction & Skilled Trade CVs","Customer Service CVs","Driver CVs","Education CVs","Health & Beauty CVs","IT CVs","Manual Labour CVs","Office CVs","Sales CVs","Security CVs","Other CVs"]
};

const slug=(s:string)=>s.toLowerCase().replace(/&/g,"and").replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

async function ensure(name:string,parentId:string){
 const matches=await db.category.findMany({where:{name}});
 const same=matches.find(x=>x.parentId===parentId);
 if(same)return same;
 return db.category.create({data:{name,slug:slug(name),parentId}});
}
async function main(){
 const roots=await db.category.findMany({where:{parentId:null}});
 const rootByName=new Map(roots.map(x=>[x.name,x]));
 for(const rootName of Object.keys(tree)){
   let root=rootByName.get(rootName);
   if(!root && rootName==="Animals & Pets") root=rootByName.get("Pets");
   if(!root) continue;
   for(const name of tree[rootName]) await ensure(name,root.id);
 }
 const all=await db.category.findMany();
 const byName=new Map(all.map(x=>[x.name,x]));
 for(const [parent,names] of Object.entries(deeper)){
   const p=byName.get(parent); if(!p) continue;
   for(const name of names) await ensure(name,p.id);
 }
 // Remove exact duplicate leaf entries, retaining the oldest record and its descendants.
 const groups=await db.category.findMany({orderBy:{createdAt:"asc"}});
 const seen=new Set<string>();
 for(const c of groups){
   const key=`${c.parentId||"root"}::${c.name.toLowerCase()}`;
   if(seen.has(key)) await db.category.delete({where:{id:c.id}});
   else seen.add(key);
 }
 console.log("Deep marketplace category catalog synced");
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>db.$disconnect());
