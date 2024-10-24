import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSlideTableAddColumnPrevElementId1729492206010
  implements MigrationInterface
{
  name = 'UpdateSlideTableAddColumnPrevElementId1729492206010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "slide" DROP COLUMN "no";
    `);

    await queryRunner.query(`
      ALTER TABLE "slide" ADD COLUMN "prev_element_id" uuid DEFAULT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "slide" ADD COLUMN "no" integer;
    `);

    await queryRunner.query(`
      ALTER TABLE "slide" DROP COLUMN "prev_element_id";
    `);
  }
}
