import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConstraintRoleIdColumnUserTable1735019778101
  implements MigrationInterface
{
  name = 'AddConstraintRoleIdColumnUserTable1735019778101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT "FK_user_role" FOREIGN KEY ("role_id")
      REFERENCES "role"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_user_role"`,
    );
  }
}
