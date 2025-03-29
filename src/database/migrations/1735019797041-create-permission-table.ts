import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissionTable1735019797041 implements MigrationInterface {
  name = 'CreatePermissionTable1735019797041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "permission" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "resource" character varying NOT NULL,
        "action" character varying NOT NULL,
        "name" character varying DEFAULT null,
        "description" character varying DEFAULT null,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_permission_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "permission"
    `);
  }
}
