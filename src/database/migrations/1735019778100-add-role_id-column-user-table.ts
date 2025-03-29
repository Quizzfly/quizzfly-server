import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleIdColumnUserTable1735019742161
  implements MigrationInterface
{
  name = 'AddRoleIdColumnUserTable1735019742161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN "role_id" uuid DEFAULT null
    `);

    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN "role" character varying NOT NULL DEFAULT 'USER'
    `);

    await queryRunner.query(`
      ALTER TABLE "user"
      DROP COLUMN "role_id"
    `);
  }
}
