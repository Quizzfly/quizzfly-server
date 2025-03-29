import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateQuizTableAddColumnBackgroundUrl1730182640626
  implements MigrationInterface
{
  name = 'UpdateQuizTableAddColumnBackgroundUrl1730182640626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "quiz"
        ADD COLUMN "background_url" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "quiz"
      DROP
      COLUMN "background_url"
    `);
  }
}
