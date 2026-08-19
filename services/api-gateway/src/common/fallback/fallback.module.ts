import { Module } from '@nestjs/common';
import { CacheFallbackService } from './cache-fallback.service';
import { DefaultFallbackService } from './default-fallback.service';

@Module({
  providers: [CacheFallbackService, DefaultFallbackService],
  exports: [CacheFallbackService, DefaultFallbackService]
})
export class FallbackModule {}
