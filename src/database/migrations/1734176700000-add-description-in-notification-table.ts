import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionInNotificationTable1734176700000
  implements MigrationInterface
{
  name = 'AddDescriptionInNotificationTable1734176700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification" ADD COLUMN "description" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification" DROP COLUMN "description"
    `);
  }
}
