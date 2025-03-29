import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSlideTableRenameColumnBackgroundColor1730182510729
  implements MigrationInterface
{
  name = 'UpdateSlideTableRenameColumnBackgroundColor1730182510729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "slide" RENAME COLUMN "background_color" TO "background_url"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "slide" RENAME COLUMN "background_url" TO "background_color"
    `);
  }
}
