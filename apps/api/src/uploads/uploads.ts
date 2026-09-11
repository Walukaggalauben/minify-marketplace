import { Controller, Post, UploadedFiles, UseGuards, UseInterceptors, ParseFilePipeBuilder, Request, ForbiddenException } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { JwtAuthGuard } from "../auth/auth.guard";
import { Throttle } from "@nestjs/throttler";

@Controller("uploads")
@UseGuards(JwtAuthGuard)
export class UploadsController {
  private readonly uploadDir=join(process.cwd(),"uploads");
  constructor(){ if(!existsSync(this.uploadDir)) mkdirSync(this.uploadDir,{recursive:true}); }
  @Throttle({default:{limit:20,ttl:60000}})
  @Post("images")
  @UseInterceptors(FilesInterceptor("images", 8, {
    storage: diskStorage({
      destination: join(process.cwd(),"uploads"),
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const safe = "image";
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}${ext}`);
      },
    }),
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed=/^image\/(jpeg|png|webp|gif)$/;
      const ext=/\.(jpe?g|png|webp|gif)$/i.test(file.originalname);
      if(!allowed.test(file.mimetype)||!ext)return cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed."),false);
      cb(null,true);
    },
  }))
  upload(@Request() req:any, @UploadedFiles(new ParseFilePipeBuilder()
    .addMaxSizeValidator({ maxSize: 8 * 1024 * 1024 })
    .addFileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ })
    .build({ fileIsRequired: false })) files: any[]) {
    if(!["SELLER","ADMIN"].includes(req.user?.role)) throw new ForbiddenException("Only sellers can upload advert images.");
    if(!files?.length) throw new ForbiddenException("At least one image is required.");
    return { images: files.map((file: any) => `/uploads/${file.filename}`) };
  }
}




