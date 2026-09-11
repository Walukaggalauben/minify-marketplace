import { Body, Controller, Get, Param, Post, Request, UseGuards, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { JwtAuthGuard } from "../auth/auth.guard";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly db: PrismaService) {}

  @Get("seller/:id")
  seller(@Param("id") id: string) {
    return this.db.review.findMany({
      where: { sellerId: id },
      include: { reviewer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: any, @Request() req: any) {
    const rating = Number(data.rating);
    if (!data.sellerId || data.sellerId === req.user.sub) throw new ForbiddenException("Invalid seller for review.");
    const completed = await this.db.order.findFirst({ where: { buyerId: req.user.sub, sellerId: String(data.sellerId), status: "COMPLETED", paymentStatus: "PAID" } });
    if (!completed) throw new ForbiddenException("Feedback can only be left after a completed paid purchase.");
    const existing = await this.db.review.findFirst({ where: { reviewerId: req.user.sub, sellerId: String(data.sellerId) } });
    if (existing) throw new ForbiddenException("You have already left feedback for this seller.");
    return this.db.review.create({
      data: {
        reviewerId: req.user.sub,
        sellerId: data.sellerId,
        rating: Math.max(1, Math.min(5, Number.isFinite(rating) ? Math.round(rating) : 1)),
        comment: data.comment ? String(data.comment).trim().slice(0, 1000) : null,
      },
    });
  }
}
