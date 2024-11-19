import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAnswerTableAddColumnIndex1732029089237
  implements MigrationInterface
{
  name = 'UpdateAnswerTableAddColumnIndex1732029089237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "answer"
      ADD COLUMN "index" INTEGER NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "answer"
      DROP COLUMN "index";
    `);
  }
}
