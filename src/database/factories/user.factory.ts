import { ROLE } from '@core/constants/entity.enum';
import { UserEntity } from '@modules/user/entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export default setSeederFactory(UserEntity, (fake) => {
  const user = new UserEntity();

  const firstName = fake.person.firstName();
  const lastName = fake.person.lastName();
  user.username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  user.email = fake.internet.email({ firstName, lastName });
  user.password = '12345678';
  user.role = ROLE.USER;
  user.isActive = true;
  user.isConfirmed = true;
  return user;
});
