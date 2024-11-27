import { InfoPostResDto } from '@modules/group/dto/response/info-post.res.dto';
import { plainToInstance } from 'class-transformer';

export function mapToInfoPostResDto(rawData: any): InfoPostResDto {
  return plainToInstance(InfoPostResDto, {
    id: rawData.id,
    createdAt: rawData.created_at,
    updatedAt: rawData.updated_at,
    type: rawData.type,
    content: rawData.content,
    files: rawData.files,
    quizzfly: rawData.quizzfly_id
      ? {
          id: rawData.quizzfly_id,
          title: rawData.title,
          description: rawData.description,
          coverImage: rawData.cover_image,
          theme: rawData.theme,
          isPublic: rawData.is_public,
          quizzflyStatus: rawData.quizzfly_status,
        }
      : null,
    member: rawData.member_id
      ? {
          id: rawData.member_id,
          username: rawData.username,
          avatar: rawData.avatar,
          name: rawData.name,
        }
      : null,
    reactCount: rawData.reactCount || 0,
    commentCount: rawData.commentCount || 0,
  });
}
