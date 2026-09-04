import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleChat(@Req() req, @Body('message') message: string, @Body('history') history: any[] = []) {
    return this.chatService.processMessage(req.user.userId, message, history);
  }
}
