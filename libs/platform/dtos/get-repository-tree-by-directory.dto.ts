import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetRepositoryTreeByDirectoryDto {
    @IsString()
    @ApiProperty()
    teamId: string;

    @IsString()
    @ApiProperty()
    repositoryId: string;

    /**
     * Path do diretório a ser carregado
     * Se não fornecido, carrega a raiz
     * @example "src"
     * @example "src/services"
     */
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    directoryPath?: string;

    /**
     * Se deve usar cache ou buscar dados atualizados
     * @default true
     */
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @ApiPropertyOptional()
    useCache?: boolean = true;
}
