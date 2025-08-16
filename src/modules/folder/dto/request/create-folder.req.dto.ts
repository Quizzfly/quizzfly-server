import { StringField, StringFieldOptional } from '@core/decorators/field.decorators';

export class CreateFolderReqDto {
    @StringField({ maxLength: 100 })
    name!: string;

    @StringFieldOptional()
    description?: string;
}


