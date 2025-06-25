import { Controller, Get, Query, Res } from "@nestjs/common";
import { MediaService } from './media.service';
import { Response } from "express";

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('playlist.m3u8')
  async getPlaylist(
    @Query('key') key: string,
    @Res() res: Response
  ): Promise<void> {
    if (!key) {
      res.status(400).send();
      return;
    }
    try {
      const playlist = await this.mediaService.getSignedPlaylist(key)
      res
        .header('Content-Type', 'application/vnd.apple.mpegurl')
        .send(playlist)
    } catch (error) {
      console.error(error);
      res.status(500).send();
    }
  }
}
