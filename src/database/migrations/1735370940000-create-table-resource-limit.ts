import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableResourceLimit1735370940000
  implements MigrationInterface
{
  name = 'CreateTableResourceLimit1735370940000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "resource_limit" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "name" character varying,
        "resource_type" character varying,
        "limit" integer,
        "subscription_plan_id" uuid NOT NULL,
        CONSTRAINT "PK_resource_limit_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "resource_limit"
      ADD CONSTRAINT "FK_resource_limit_subscription"
      FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "resource_limit" DROP CONSTRAINT "FK_resource_limit_subscription"
    `);

    await queryRunner.query(`
      DROP TABLE "resource_limit"
    `);
  }
}
