import { Body, Controller, Post, Request, UseGuards, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { JwtAuthGuard } from "../auth/auth.guard";

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly db: PrismaService) {}

  @Post()
  async create(@Body() data: any, @Request() req: any) {
    const adId=String(data.adId||'').trim();
    const reason=String(data.reason||'Other').trim();
    const details=data.details?String(data.details).trim():null;
    if(!adId) throw new BadRequestException('Advert is required.');
    if(reason.length<3||reason.length>120) throw new BadRequestException('Please provide a valid report reason.');
    if(details&&details.length>1000) throw new BadRequestException('Report details are too long.');
    const ad=await this.db.ad.findUnique({where:{id:adId},select:{id:true,sellerId:true,title:true}});
    if(!ad) throw new NotFoundException('Advert not found.');
    if(ad.sellerId===req.user.sub) throw new BadRequestException('You cannot report your own advert.');
    const existing=await this.db.report.findFirst({where:{adId,reporterId:req.user.sub,resolved:false}});
    if(existing) return existing;
    const report=await this.db.report.create({
      data: {
        reporterId: req.user.sub,
        adId,
        reason,
        details,
      },
    });
    await this.db.notification.create({data:{userId:ad.sellerId,type:'REPORT_RECEIVED',title:'Advert reported',body:`A buyer reported your advert "${ad.title}". Our team will review it.`,link:`/ad/${ad.id}`}});
    return report;
  }
}

