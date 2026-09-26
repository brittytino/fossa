import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { postgresConfigLoader } from '@libs/core/infrastructure/config/loaders/postgres.config.loader';
import { TypeORMFactory } from '@libs/core/infrastructure/database/typeorm/typeORM.factory';

export interface SharedPostgresModuleOptions {
    poolSize?: number;
}

@Module({})
export class SharedPostgresModule {
    static forRoot(options: SharedPostgresModuleOptions = {}): DynamicModule {
        return {
            module: SharedPostgresModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule.forFeature(postgresConfigLoader)],
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) => {
                        const factory = new TypeORMFactory(configService);
                        const config = factory.createTypeOrmOptions();

                        if (options.poolSize && config.extra) {
                            config.extra.max = options.poolSize;
                        }

                        return config;
                    },
                }),
            ],
            exports: [TypeOrmModule],
        };
    }
}
