import {
  Body,
  Controller,
  Injectable,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { JwtAuthGuard } from "./auth.guard";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(data: any) {
    const email = String(data?.email ?? "").trim().toLowerCase();
    const password = String(data?.password ?? "");
    const name = String(data?.name ?? "").trim();
    const phone = String(data?.phone ?? "").trim();

    if (!email || !password || !name || !phone) {
      throw new UnauthorizedException("Name, email, phone and password are required.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new UnauthorizedException("Enter a valid email address.");
    }
    if (password.length < 8) {
      throw new UnauthorizedException("Password must be at least 8 characters.");
    }
    if (name.length < 2 || name.length > 100) {
      throw new UnauthorizedException("Enter a valid name.");
    }
    if (!/^[+0-9][0-9\s-]{6,29}$/.test(phone)) {
      throw new UnauthorizedException("Enter a valid phone number.");
    }

    const existing = await this.db.user.findFirst({where:{OR:[{email},{phone}]},select:{email:true,phone:true}});
    if(existing?.email===email)throw new UnauthorizedException("An account with this email already exists.");
    if(existing?.phone===phone)throw new UnauthorizedException("An account with this phone number already exists.");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.db.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
      },
    });

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async becomeSeller(id:string) {
    const current=await this.db.user.findUnique({where:{id},select:{sellerTrialStartedAt:true}});
    const user=await this.db.user.update({where:{id},data:{role:"SELLER",sellerTrialStartedAt:current?.sellerTrialStartedAt??new Date()},select:{id:true,name:true,email:true,phone:true,role:true}});
    const token=this.jwt.sign({sub:user.id,email:user.email,role:user.role});
    return {token,user};
  }

  async login(data: any) {
    const email = String(data?.email ?? "").trim().toLowerCase();
    const password = String(data?.password ?? "");

    if (!email || !password) {
      throw new UnauthorizedException(
        "Email and password are required.",
      );
    }

    const user = await this.db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        "Invalid email or password.",
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        "Invalid email or password.",
      );
    }

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({default:{limit:8,ttl:60000}})
  @Post("register")
  register(@Body() data: any) {
    return this.authService.register(data);
  }

  @Throttle({default:{limit:10,ttl:60000}})
  @Post("login")
  login(@Body() data: any) {
    return this.authService.login(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post("become-seller")
  becomeSeller(@Request() req:any) {
    return this.authService.becomeSeller(req.user.sub);
  }
}