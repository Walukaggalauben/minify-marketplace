import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { JwtAuthGuard } from "../auth/auth.guard";

@Controller("favorites")
export class FavoritesController {
  constructor(private readonly db: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get(":userId")
  list(@Param("userId") userId: string, @Request() req: any) {
    userId=req.user.sub;
    return this.db.favorite.findMany({
      where: {
        userId,
      },
      include: {
        Ad: {
          include: {
            images: true,
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  add(@Body() data: { userId: string; adId: string }, @Request() req: any) {
    data.userId=req.user.sub;
    return this.db.favorite.upsert({
      where: {
        userId_adId: {
          userId: data.userId,
          adId: data.adId,
        },
      },
      update: {},
      create: {
        userId: data.userId,
        adId: data.adId,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":userId/:adId")
  del(
    @Param("userId") userId: string,
    @Param("adId") adId: string,
    @Request() req: any,
  ) {
    userId=req.user.sub;
    return this.db.favorite.delete({
      where: {
        userId_adId: {
          userId,
          adId,
        },
      },
    });
  }
}