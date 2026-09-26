import * as fs from 'node:fs';

import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import * as yaml from 'js-yaml';

import { createLogger } from '@libs/core/log/logger';
import {
    CODE_BASE_CONFIG_SERVICE_TOKEN,
    ICodeBaseConfigService,
} from '@libs/code-review/domain/contracts/CodeBaseConfigService.contract';
import { ParametersKey } from '@libs/core/domain/enums';
import { FossaConfigFile } from '@libs/core/infrastructure/config/types/general/codeReview.type';
import {
    Action,
    ResourceType,
} from '@libs/identity/domain/permissions/enums/permissions.enum';
import { AuthorizationService } from '@libs/identity/infrastructure/adapters/services/permissions/authorization.service';
import {
    IParametersService,
    PARAMETERS_SERVICE_TOKEN,
} from '@libs/organization/domain/parameters/contracts/parameters.service.contract';

@Injectable()
export class GenerateFossaConfigFileUseCase {
    private readonly logger = createLogger(GenerateFossaConfigFileUseCase.name);

    constructor(
        @Inject(PARAMETERS_SERVICE_TOKEN)
        private readonly parametersService: IParametersService,

        @Inject(CODE_BASE_CONFIG_SERVICE_TOKEN)
        private readonly codeBaseConfigService: ICodeBaseConfigService,

        @Inject(REQUEST)
        private readonly request: Request & {
            user: { organization: { uuid: string }; uuid: string };
        },

        private readonly authorizationService: AuthorizationService,
    ) {}

    async execute(
        teamId: string,
        repositoryId?: string,
        directoryId?: string,
        options: {
            skipAuthorization?: boolean;
        } = {},
    ): Promise<{ yamlString?: string }> {
        try {
            const organizationId = this.request.user?.organization.uuid;
            const organizationAndTeamData = {
                organizationId: organizationId,
                teamId,
            };

            if (
                !options.skipAuthorization &&
                repositoryId &&
                repositoryId !== 'global'
            ) {
                await this.authorizationService.ensure({
                    user: this.request.user,
                    action: Action.Read,
                    resource: ResourceType.CodeReviewSettings,
                    repoIds: [repositoryId],
                });
            }

            if (!repositoryId) {
                return this.getFossyConfigFile();
            }

            const codeReviewConfigs = await this.parametersService.findByKey(
                ParametersKey.CODE_REVIEW_CONFIG,
                organizationAndTeamData,
            );

            let config: FossaConfigFile | undefined;

            if (repositoryId === 'global') {
                config = codeReviewConfigs.configValue.configs as
                    | FossaConfigFile
                    | undefined;
            } else if (repositoryId && directoryId) {
                const repo = codeReviewConfigs.configValue.repositories?.find(
                    (repository) => repository.id === repositoryId,
                );

                const directory = repo?.directories?.find(
                    (directory) => directory.id === directoryId,
                );

                config = directory?.configs as FossaConfigFile | undefined;
            } else if (repositoryId && repositoryId !== 'global') {
                const repo = codeReviewConfigs.configValue.repositories?.find(
                    (repository) => repository.id === repositoryId,
                );

                config = repo?.configs as FossaConfigFile | undefined;
            }

            return this.getFossyConfigFile(config);
        } catch (error) {
            this.logger.error({
                message: 'Failed to generate Fossa config file!',
                context: GenerateFossaConfigFileUseCase.name,
                error: error,
                metadata: {
                    parametersKey: ParametersKey.CODE_REVIEW_CONFIG,
                    teamId,
                    repositoryId,
                },
            });
            throw new Error(
                `Failed to generate Fossa config file for team ${teamId}${repositoryId ? ` and repository ${repositoryId}` : ''}: ${error.message}`,
                { cause: error },
            );
        }
    }

    private getFossyConfigFile(configObject?: FossaConfigFile): {
        yamlString: string;
    } {
        let yamlString: string;

        if (configObject && !this.isEmptyObject(configObject)) {
            yamlString = yaml.dump(configObject);
        } else if (configObject && this.isEmptyObject(configObject)) {
            yamlString = '';
        } else {
            const fossaDefaultConfigYMLfile = yaml.load(
                fs.readFileSync('default-fossa-config.yml', 'utf8'),
            ) as FossaConfigFile;
            yamlString = yaml.dump(fossaDefaultConfigYMLfile);
        }

        return { yamlString };
    }

    private isEmptyObject(obj?: object): boolean {
        return !!obj && Object.keys(obj).length === 0;
    }
}
