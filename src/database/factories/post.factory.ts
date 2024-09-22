import { SYSTEM_USER_ID } from '@core/constants/app.constant';
import { PostEntity } from '@modules/post/entities/post.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(PostEntity, (fake) => {
  const post = new PostEntity();

  post.title = fake.lorem.sentence();
  post.slug = fake.lorem.slug();
  post.description = fake.lorem.sentence();
  post.content = fake.lorem.paragraphs();
  post.createdBy = SYSTEM_USER_ID;
  post.updatedBy = SYSTEM_USER_ID;

  return post;
});
