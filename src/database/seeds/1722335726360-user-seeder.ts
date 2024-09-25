import { ROLE } from '@core/constants/entity.enum';
import { UserEntity } from '@modules/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class UserSeeder1722335726360 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const repository = dataSource.getRepository(UserEntity);

    const adminUser = await repository.findOneBy({ username: 'admin' });
    if (!adminUser) {
      await repository.insert(
        new UserEntity({
          username: 'admin',
          email: 'admin@gmail.com',
          password: '12345678',
          role: ROLE.ADMIN,
          isActive: true,
          isConfirmed: true,
        }),
      );
    }

    const countRecord = await repository.count();
    if (countRecord === 1) {
      const userFactory = factoryManager.get(UserEntity);
      await userFactory.saveMany(5);
    }
  }
}
