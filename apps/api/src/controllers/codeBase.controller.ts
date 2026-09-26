import { Controller, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiStandardResponses } from '../docs/api-standard-responses.decorator';

function replacer(key: any, value: any) {
    if (value instanceof Map) {
        return [...value.entries()];
    }
    return value;
}

@ApiTags('Code Base')
@ApiBearerAuth('jwt')
@ApiStandardResponses()
@Controller('code-base')
export class CodeBaseController {
    constructor(
        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string } };
        },
    ) {}
}
