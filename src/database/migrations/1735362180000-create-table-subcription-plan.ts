import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableSubcriptionPlan1735362180000
  implements MigrationInterface
{
  name = 'CreateTableSubcriptionPlan1735362180000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "subscription_plan" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "name" character varying,
        "description" character varying,
        "duration" integer,
        "price" double precision,
        CONSTRAINT "PK_subscription_plan_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "subscription_plan"
    `);
  }
}
