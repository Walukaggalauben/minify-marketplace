import {Body,Controller,Delete,Get,Param,Patch,Post,Query,Request,UseGuards,ForbiddenException,NotFoundException} from "@nestjs/common";
import {PrismaService} from "../prisma.service";
import {JwtAuthGuard} from "../auth/auth.guard";

@Controller("ads")
export class AdsController {
 constructor(private readonly db:PrismaService){}
 private async assertSellerAccess(req:any){
  if(req.user?.role==='ADMIN')return;
  if(req.user?.role!=='SELLER')throw new ForbiddenException('Only sellers can post adverts.');
  const user=await this.db.user.findUnique({where:{id:req.user.sub},select:{sellerTrialStartedAt:true,subscriptionStatus:true,subscriptionEndsAt:true}});
  if(!user)throw new ForbiddenException('Seller account not found.');
  const trialEnd=user.sellerTrialStartedAt?new Date(user.sellerTrialStartedAt.getTime()+180*86400000):null;
  const trialActive=!!trialEnd&&trialEnd.getTime()>Date.now();
  const paidActive=user.subscriptionStatus==='ACTIVE'&&!!user.subscriptionEndsAt&&user.subscriptionEndsAt.getTime()>Date.now();
  if(!trialActive&&!paidActive)throw new ForbiddenException('Your seller access has expired. Choose a seller package to continue.');
 } @Get()
 async list(@Query() q:any){
  const now=new Date();
  const where:any={status:"ACTIVE",AND:[{OR:[{expiresAt:null},{expiresAt:{gt:now}}]}]};
  if(q.q)where.AND.push({OR:[{title:{contains:String(q.q),mode:"insensitive"}},{description:{contains:String(q.q),mode:"insensitive"}}]});
  if(q.categoryId)where.AND.push({categoryId:String(q.categoryId)});
  if(q.category&&!q.categoryId){
   const category=await this.db.category.findFirst({where:{name:{equals:String(q.category),mode:"insensitive"}}});
   if(!category)return {items:[],total:0,page:1,limit:Math.min(48,Math.max(1,Number(q.limit)||24)),pages:0};
   const ids=[category.id]; let parents=[category.id];
   while(parents.length){const children=await this.db.category.findMany({where:{parentId:{in:parents}},select:{id:true}});const next=children.map(x=>x.id).filter(id=>!ids.includes(id));ids.push(...next);parents=next;}
   where.AND.push({categoryId:{in:ids}});
  }
  if(q.sellerId)where.AND.push({sellerId:String(q.sellerId)});
  if(q.condition)where.AND.push({condition:String(q.condition)});
  if(q.city)where.AND.push({city:{contains:String(q.city),mode:"insensitive"}});
  if(q.attributeKey&&q.attributeValue)where.AND.push({attributes:{path:[String(q.attributeKey)],equals:String(q.attributeValue)}});\n  for(const [key,value] of Object.entries(q)){if(key.startsWith('attr_')&&String(value).trim()){const attrKey=key.slice(5);where.AND.push({attributes:{path:[attrKey],equals:String(value)}});}}
  const min=Number(q.minPrice),max=Number(q.maxPrice);
  if(q.minPrice||q.maxPrice)where.price={...(Number.isFinite(min)?{gte:min}:{}),...(Number.isFinite(max)?{lte:max}:{})};
  const allowed=["createdAt","price","views","title"];const sort=allowed.includes(String(q.sort))?String(q.sort):"createdAt";
  const order=String(q.order)==="asc"?"asc":"desc";const page=Math.max(1,Number(q.page)||1);const limit=Math.min(48,Math.max(1,Number(q.limit)||24));
  const [items,total]=await Promise.all([this.db.ad.findMany({where,include:{images:true,seller:{select:{id:true,name:true,verified:true,city:true}},category:true},orderBy:{[sort]:order},skip:(page-1)*limit,take:limit}),this.db.ad.count({where})]);
  return {items,total,page,limit,pages:Math.ceil(total/limit)};
 }
 @UseGuards(JwtAuthGuard) @Get("mine")
 async mine(@Request() req:any){return this.db.ad.findMany({where:{sellerId:req.user.sub},include:{images:true,category:true,_count:{select:{favorites:true,conversations:true,orders:true}}},orderBy:{createdAt:"desc"}})}
 @UseGuards(JwtAuthGuard) @Get("manage/:id")
 async manage(@Param("id") id:string,@Request() req:any){
  const ad=await this.db.ad.findUnique({where:{id},include:{images:true,category:true}});
  if(!ad)throw new NotFoundException("Advert not found.");
  if(ad.sellerId!==req.user.sub&&!['ADMIN','MODERATOR'].includes(req.user.role))throw new ForbiddenException("You cannot edit this advert.");
  return ad;
 }
 @UseGuards(JwtAuthGuard) @Delete("images/:imageId")
 async deleteImage(@Param("imageId") imageId:string,@Request() req:any){
  const image=await this.db.adImage.findUnique({where:{id:imageId},include:{ad:{select:{sellerId:true}}}});
  if(!image)throw new NotFoundException("Image not found.");
  if(image.ad.sellerId!==req.user.sub&&!['ADMIN','MODERATOR'].includes(req.user.role))throw new ForbiddenException("You cannot remove this image.");
  await this.db.adImage.delete({where:{id:imageId}});
  return {success:true};
 }
 @Get(":id")
 async one(@Param("id") id:string){
  const ad=await this.db.ad.findUnique({where:{id},include:{images:true,seller:{select:{id:true,name:true,phone:true,createdAt:true,city:true,verified:true}},category:true}});
  if(!ad)throw new NotFoundException("Advert not found.");
  return ad;
 }
 @UseGuards(JwtAuthGuard) @Post()
 async create(@Body() data:any,@Request() req:any){
  await this.assertSellerAccess(req);
  const {images,attributes,sellerId:_s,id:_i,status:_st,publishedAt:_p,...x}=data;
  const title=String(x.title||"").trim(),description=String(x.description||"").trim();
  if(title.length<5)throw new ForbiddenException("Title must be at least 5 characters.");
  if(description.length<10)throw new ForbiddenException("Description must be at least 10 characters.");
  if(!x.categoryId)throw new ForbiddenException("Category is required.");
  const price=Number(x.price);if(!Number.isFinite(price)||price<0)throw new ForbiddenException("Enter a valid price.");
  const category=await this.db.category.findUnique({where:{id:String(x.categoryId)}});if(!category)throw new NotFoundException("Category not found.");
  return this.db.ad.create({data:{...x,title,description,sellerId:req.user.sub,slug:x.slug||`${title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${Date.now()}`,price,attributes:attributes&&typeof attributes==="object"?attributes:undefined,images:Array.isArray(images)?{create:images.filter((u:any)=>typeof u==="string"&&u.trim()).map((url:string,i:number)=>({url:url.trim(),sortOrder:i}))}:undefined},include:{images:true,seller:{select:{id:true,name:true}}}});
 }
 @UseGuards(JwtAuthGuard) @Patch(":id")
 async update(@Param("id") id:string,@Body() data:any,@Request() req:any){
  const e=await this.db.ad.findUnique({where:{id},select:{sellerId:true}});
  if(!e)throw new NotFoundException("Advert not found.");
  if(e.sellerId!==req.user.sub&&!['ADMIN','MODERATOR'].includes(req.user.role))throw new ForbiddenException("You cannot edit this advert.");
  const {sellerId:_s,id:_i,status:_st,publishedAt:_p,images:_im,slug:_slug,attributes,...safe}=data;
  if(safe.title!==undefined&&String(safe.title).trim().length<5)throw new ForbiddenException("Title must be at least 5 characters.");
  if(safe.description!==undefined&&String(safe.description).trim().length<10)throw new ForbiddenException("Description must be at least 10 characters.");
  if(safe.price!==undefined){const price=Number(safe.price);if(!Number.isFinite(price)||price<0)throw new ForbiddenException("Enter a valid price.");safe.price=price;}
  if(safe.categoryId!==undefined){const category=await this.db.category.findUnique({where:{id:String(safe.categoryId)}});if(!category)throw new NotFoundException("Category not found.");}
  return this.db.ad.update({where:{id},data:{...safe, ...(attributes===undefined?{}:{attributes:attributes&&typeof attributes==="object"?attributes:null})},include:{images:true,seller:{select:{id:true,name:true}}}});
 }
 @UseGuards(JwtAuthGuard) @Post(":id/publish")
 async publish(@Param("id") id:string,@Request() req:any){await this.assertSellerAccess(req);const e=await this.db.ad.findUnique({where:{id},select:{sellerId:true}});if(!e)throw new NotFoundException("Advert not found.");if(e.sellerId!==req.user.sub&&!['ADMIN','MODERATOR'].includes(req.user.role))throw new ForbiddenException("You cannot publish this advert.");return this.db.ad.update({where:{id},data:{status:"PENDING_REVIEW",publishedAt:null}});}
 @UseGuards(JwtAuthGuard) @Post(":id/sold")
 async sold(@Param("id") id:string,@Request() req:any){const e=await this.db.ad.findUnique({where:{id},select:{sellerId:true,status:true}});if(!e)throw new NotFoundException("Advert not found.");if(e.sellerId!==req.user.sub&&!['ADMIN','MODERATOR'].includes(req.user.role))throw new ForbiddenException("You cannot change this advert.");return this.db.ad.update({where:{id},data:{status:"SOLD"}});}
 @UseGuards(JwtAuthGuard) @Post(":id/renew")
 async renew(@Param("id") id:string,@Request() req:any){
  const ad=await this.db.ad.findUnique({where:{id},select:{sellerId:true,status:true}});
  if(!ad)throw new NotFoundException("Advert not found.");
  if(ad.sellerId!==req.user.sub&&!['ADMIN','MODERATOR'].includes(req.user.role))throw new ForbiddenException("You cannot renew this advert.");
  if(!['EXPIRED','REJECTED'].includes(ad.status))throw new ForbiddenException("Only expired or rejected adverts can be renewed.");
  return this.db.ad.update({where:{id},data:{status:"PENDING_REVIEW",publishedAt:null,expiresAt:null}});
 }
 @Post(":id/view")
 async view(@Param("id") id:string){return this.db.ad.update({where:{id},data:{views:{increment:1}}});}
}
export class AdsService{constructor(private readonly db:PrismaService){}}
