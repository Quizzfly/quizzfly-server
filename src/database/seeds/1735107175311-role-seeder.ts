import { PermissionConfiguration } from '@config/permission.config';
import { ROLE } from '@core/constants/entity.enum';
import { PermissionEntity } from '@modules/permission/entities/permission.entity';
import {
  createPermissions,
  prepareConditionFindPermissions,
} from '@modules/permission/helpers';
import { RoleEntity } from '@modules/role/entities/role.entity';
import { UserEntity } from '@modules/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class RoleSeeder1735107175311 implements Seeder {
  track = false;
  private repository: Repository<RoleEntity>;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.repository = dataSource.getRepository(RoleEntity);

    const countRecord = await this.repository.count();

    if (countRecord === 0) {
      const items: Partial<RoleEntity>[] = PermissionConfiguration.map(
        (permission) => ({
          name: permission.name,
          description: permission.description,
        }),
      );

      await this.repository.insert(items).then(() => {
        console.log('Seeded data for role table: ', items.length, ' record');
      });

      await this.assignRoleForUser(dataSource);

      await this.seedPermissionForRole(dataSource);
    }
  }

  private async assignRoleForUser(dataSource: DataSource) {
    const [adminRole, moderatorRole, basicRole] = await Promise.all([
      this.repository.findOneBy({ name: ROLE.ADMIN }),
      this.repository.findOneBy({ name: ROLE.MODERATOR }),
      this.repository.findOneBy({ name: ROLE.USER }),
    ]);

    const userRepository = dataSource.getRepository(UserEntity);

    const users = await userRepository.find();

    const usersUpdate = users.map((user) => {
      if (user.email === 'admin@gmail.com') {
        user.roleId = adminRole.id;
      } else if (user.email === 'moderator@gmail.com') {
        user.roleId = moderatorRole.id;
      } else {
        user.roleId = basicRole.id;
      }

      return { ...user, roleId: user.roleId };
    });

    await userRepository
      .upsert(usersUpdate, {
        conflictPaths: ['id'],
      })
      .then(() => {
        console.log(
          'Update data for user table: ',
          usersUpdate.length,
          ' record',
        );
      });
  }

  private async seedPermissionForRole(dataSource: DataSource) {
    await Promise.all(
      PermissionConfiguration.map(async (role) => {
        const items = createPermissions(role.permissions);
        const condition = prepareConditionFindPermissions(items);

        const roleEntity = await this.repository.findOneBy({ name: role.name });

        roleEntity.permissions = await dataSource
          .getRepository(PermissionEntity)
          .findBy(condition);

        await roleEntity.save();
      }),
    ).then(() => {
      console.log('Seeded permissions for role success');
    });
  }
}
