import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTypePaymentedAt1735453740000 implements MigrationInterface {
  name = 'UpdateTypePaymentedAt1735453740000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_plan"
      ALTER COLUMN "paymented_at" TYPE character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_plan"
      ALTER COLUMN "paymented_at" TYPE TIMESTAMP WITH TIME ZONE DEFAULT null
    `);
  }
}
