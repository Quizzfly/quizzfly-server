import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUsageResource1735446900000
  implements MigrationInterface
{
  name = 'CreateTableUsageResource1735446900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "usage_resource" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "usage" integer,
        "resource_type" character varying,
        "user_plan_id" uuid NOT NULL,
        CONSTRAINT "PK_usage_resource_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "usage_resource"
      ADD CONSTRAINT "FK_usage_resource_user_plan"
      FOREIGN KEY ("user_plan_id") REFERENCES "user_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usage_resource" DROP CONSTRAINT "FK_usage_resource_user_plan"
    `);

    await queryRunner.query(`
      DROP TABLE "usage_resource"
    `);
  }
}
