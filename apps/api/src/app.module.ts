import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule,ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma.service';
import { AuthController,AuthService } from './auth/auth';
import { JwtAuthGuard } from './auth/auth.guard';
import { AdsController,AdsService } from './ads/ads';
import { CategoriesController } from './categories/categories';
import { FavoritesController } from './favorites/favorites';
import { ChatsController } from './chats/chats';
import { ChatGateway } from './chats/chat.gateway';
import { ReviewsController } from './reviews/reviews';
import { ReportsController } from './reports/reports';
import { AdminController } from './admin/admin';
import { UploadsController } from './uploads/uploads';
import { UsersController } from './users/users';
import { OrdersController } from './orders/orders';
import { PaymentsController } from './payments/payments';
import { NotificationsController } from './notifications/notifications';
import { SavedSearchesController } from './saved-searches/saved-searches';
import { SubscriptionsController } from './subscriptions/subscriptions';
import { PromotionPaymentsController } from './promotion-payments/promotion-payments';
import { HealthController } from './health.controller';

const jwtSecret=process.env.JWT_SECRET||'dev-secret';
if(process.env.NODE_ENV==='production'&&(!process.env.JWT_SECRET||process.env.JWT_SECRET==='change-this-in-production')){
 throw new Error('JWT_SECRET must be configured with a strong production value.');
}

@Module({
 imports:[JwtModule.register({secret:jwtSecret,signOptions:{expiresIn:'7d'}}),ThrottlerModule.forRoot([{name:'default',ttl:60000,limit:120}])],
 controllers:[HealthController,AuthController,AdsController,CategoriesController,FavoritesController,ChatsController,ReviewsController,ReportsController,AdminController,UploadsController,UsersController,OrdersController,PaymentsController,NotificationsController,SavedSearchesController,SubscriptionsController,PromotionPaymentsController],
 providers:[PrismaService,AuthService,AdsService,JwtAuthGuard,ChatGateway,{provide:APP_GUARD,useClass:ThrottlerGuard}]
})
export class AppModule{}
