import { Module } from '@nestjs/common';
import { TokenChunkingService } from './tokenChunking.service';

@Module({
    providers: [TokenChunkingService],
    exports: [TokenChunkingService],
})
export class TokenChunkingModule {}
