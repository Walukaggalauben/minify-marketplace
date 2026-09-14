import {Controller,Get,Param,NotFoundException,Patch,Post,Body,Request,UseGuards,ForbiddenException} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {JwtAuthGuard} from '../auth/auth.guard';

@Controller('users')
export class UsersController{
 constructor(private readonly db:PrismaService){}
 @UseGuards(JwtAuthGuard) @Get('me/profile') async me(@Request() req:any){return this.db.user.findUnique({where:{id:req.user.sub},select:{id:true,name:true,email:true,phone:true,city:true,avatarUrl:true,verified:true,verificationStatus:true,verificationNote:true,role:true,flutterwaveSubaccountStatus:true}});}
 @UseGuards(JwtAuthGuard) @Get('me/metrics') async metrics(@Request() req:any){const id=req.user.sub;const [ads,favorites,orders,messages]=await Promise.all([this.db.ad.findMany({where:{sellerId:id},select:{views:true,status:true}}),this.db.favorite.count({where:{Ad:{sellerId:id}}}),this.db.order.findMany({where:{sellerId:id},select:{status:true,total:true}}),this.db.message.count({where:{conversation:{sellerId:id}}})]);return {adverts:ads.length,active:ads.filter(a=>a.status==='ACTIVE').length,views:ads.reduce((n,a)=>n+a.views,0),favorites,conversations:messages,orders:orders.length,completed:orders.filter(o=>o.status==='COMPLETED').length,revenue:orders.filter(o=>o.status==='COMPLETED').reduce((n,o)=>n+Number(o.total),0)};}
 @UseGuards(JwtAuthGuard) @Patch('me/profile') async update(@Request() req:any,@Body() body:any){const name=String(body.name||'').trim();const city=String(body.city||'').trim();if(!name)throw new ForbiddenException('Name is required.');return this.db.user.update({where:{id:req.user.sub},data:{name,city:city||null},select:{id:true,name:true,email:true,phone:true,city:true,avatarUrl:true,verified:true,verificationStatus:true,verificationNote:true,role:true}});}
 @UseGuards(JwtAuthGuard) @Post('me/verification') async requestVerification(@Request() req:any){const user=await this.db.user.findUnique({where:{id:req.user.sub},select:{id:true,name:true,role:true,verificationStatus:true}});if(!user)throw new NotFoundException('User not found.');if(!['SELLER','ADMIN'].includes(user.role))throw new ForbiddenException('Seller verification is available after you become a seller.');if(user.verificationStatus==='VERIFIED')return user;return this.db.user.update({where:{id:req.user.sub},data:{verificationStatus:'PENDING',verificationNote:'Verification requested by seller.'},select:{id:true,name:true,verificationStatus:true,verificationNote:true}});}
 @UseGuards(JwtAuthGuard) @Post('me/flutterwave-subaccount') async createFlutterwaveSubaccount(@Request() req:any,@Body() body:any){
  const user=await this.db.user.findUnique({where:{id:req.user.sub},select:{id:true,name:true,email:true,phone:true,role:true,flutterwaveSubaccountId:true,flutterwaveSubaccountStatus:true}});
  if(!user)throw new NotFoundException('User not found.');
  if(!['SELLER','ADMIN'].includes(user.role))throw new ForbiddenException('Only sellers can configure marketplace payouts.');
  if(user.flutterwaveSubaccountId)return {status:user.flutterwaveSubaccountStatus,subaccountId:user.flutterwaveSubaccountId,message:'Seller payout account is already configured.'};
  const key=process.env.FLW_SECRET_KEY;if(!key)throw new ForbiddenException('Flutterwave is not configured yet.');
  const bankCode=String(body.accountBank||'').trim(),accountNumber=String(body.accountNumber||'').trim(),branchCode=String(body.branchCode||'').trim();
  const businessName=String(body.businessName||user.name).trim(),businessMobile=String(body.businessMobile||user.phone).trim(),businessEmail=String(body.businessEmail||user.email).trim();
  if(!bankCode||!accountNumber||!branchCode||!businessName||!businessMobile||!businessEmail)throw new ForbiddenException('Bank, account number, branch code and seller contact details are required.');
  if(!/^\d{5,30}$/.test(accountNumber))throw new ForbiddenException('Enter a valid bank account number.');
  // Seller subaccounts default to 100%; platform commission is applied per transaction.
  const response=await fetch('https://api.flutterwave.com/v3/subaccounts',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({account_bank:bankCode,account_number:accountNumber,business_name:businessName,business_mobile:businessMobile,business_email:businessEmail,business_contact:businessName,country:'UG',split_type:'percentage',split_value:1,meta:[{bank_branch:branchCode}]})});
  const data:any=await response.json().catch(()=>({}));
  if(!response.ok||data?.status!=='success'||!data?.data?.subaccount_id)throw new ForbiddenException(data?.message||'Flutterwave could not configure this seller payout account.');
  await this.db.user.update({where:{id:user.id},data:{flutterwaveSubaccountId:String(data.data.subaccount_id),flutterwaveSubaccountStatus:'ACTIVE'}});
  return {status:'ACTIVE',subaccountId:String(data.data.subaccount_id),message:'Seller payout account configured successfully.'};
 }
 @Get(':id') async one(@Param('id') id:string){const user=await this.db.user.findUnique({where:{id},select:{id:true,name:true,avatarUrl:true,city:true,verified:true,verificationStatus:true,createdAt:true,role:true,phone:true}});if(!user)throw new NotFoundException('Seller not found.');return user;}
}
