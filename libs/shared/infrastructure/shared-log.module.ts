import { Global, Module } from '@nestjs/common';
import { LoggerWrapperService } from '@libs/core/log/loggerWrapper.service';

@Global()
@Module({
    providers: [LoggerWrapperService],
    exports: [LoggerWrapperService],
})
export class SharedLogModule {}
