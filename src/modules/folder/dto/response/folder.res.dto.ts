import { BaseResDto } from '@common/dto/base.res.dto';
import { BooleanField, StringField, StringFieldOptional, UUIDField } from '@core/decorators/field.decorators';

export class FolderResDto extends BaseResDto {
    @StringField()
    name!: string;

    @StringFieldOptional()
    description?: string;

    @UUIDField({ name: 'user_id' })
    userId!: string;

    @BooleanField({ name: 'is_public' })
    isPublic!: boolean;
}


