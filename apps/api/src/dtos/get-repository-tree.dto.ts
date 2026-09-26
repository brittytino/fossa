import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { RepositoryTreeType } from '@libs/common/utils/enums/repositoryTree.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetRepositoryTreeDto {
    @IsString()
    @ApiProperty()
    organizationId: string;

    @IsString()
    @ApiProperty()
    teamId: string;

    @IsString()
    @ApiProperty()
    repositoryId: string;

    @IsEnum(RepositoryTreeType)
    @IsOptional()
    @ApiPropertyOptional({
        enum: RepositoryTreeType,
        enumName: 'RepositoryTreeType',
    })
    treeType?: RepositoryTreeType;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({ type: Boolean })
    useCache?: boolean;
}
