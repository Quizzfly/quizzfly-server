import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableUserPlan1735384140000 implements MigrationInterface {
  name = 'CreateTableUserPlan1735384140000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_plan" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "amount" double precision,
        "description" character varying,
        "code" character varying,
        "user_plan_status" character varying,
        "paymented_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "subscription_expired_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "subscription_plan_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_user_plan_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "user_plan"
      ADD CONSTRAINT "FK_user_plan_subscription"
      FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "user_plan"
      ADD CONSTRAINT "FK_user_plan_user" FOREIGN KEY ("user_id")
      REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_plan" DROP CONSTRAINT "FK_user_plan_subscription"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_plan" DROP CONSTRAINT "FK_user_plan_user"
    `);

    await queryRunner.query(`
      DROP TABLE "user_plan"
    `);
  }
}
