import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTargetIdAndTargetTypeInNotificationTable1734163680000
  implements MigrationInterface
{
  name = 'AddTargetIdAndTargetTypeInNotificationTable1734163680000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification" ADD COLUMN "target_id" uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "notification" ADD COLUMN "target_type" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification" DROP COLUMN "target_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "notification" DROP COLUMN "target_type"
    `);
  }
}
