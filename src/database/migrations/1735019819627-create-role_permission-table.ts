import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolePermissionTable1735019819627
  implements MigrationInterface
{
  name = 'CreateRolePermissionTable1735019819627';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "role_permission" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_role_permission_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permission"
      ADD CONSTRAINT "FK_role_permission_role" FOREIGN KEY ("role_id")
      REFERENCES "role"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permission"
      ADD CONSTRAINT "FK_role_permission_permission" FOREIGN KEY ("permission_id")
      REFERENCES "permission"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP CONSTRAINT "FK_role_permission_role"`,
    );

    await queryRunner.query(
      `ALTER TABLE "role_permission" DROP CONSTRAINT "FK_role_permission_permission"`,
    );

    await queryRunner.query(`
      DROP TABLE "role_permission"
    `);
  }
}
