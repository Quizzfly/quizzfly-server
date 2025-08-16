import { BooleanFieldOptional, StringFieldOptional } from '@core/decorators/field.decorators';

export class UpdateFolderReqDto {
    @StringFieldOptional({ maxLength: 100 })
    name?: string;

    @StringFieldOptional()
    description?: string;

    @BooleanFieldOptional({ name: 'is_public' })
    isPublic?: boolean;
}


