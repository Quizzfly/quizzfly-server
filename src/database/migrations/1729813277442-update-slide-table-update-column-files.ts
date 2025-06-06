import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSlideTableUpdateColumnFiles1729813277442
  implements MigrationInterface
{
  name = 'UpdateSlideTableUpdateColumnFiles1729813277442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "slide"
      ALTER
      COLUMN "files" TYPE jsonb USING to_jsonb("files")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "slide"
      SET "files" = null
    `);

    await queryRunner.query(`
      ALTER TABLE "slide"
      ALTER
      COLUMN "files" TYPE character varying[] USING "files"::text[]
    `);
  }
}
