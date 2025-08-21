import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFlashcardSetTable1755345336350
  implements MigrationInterface
{
  name = 'CreateFlashcardSetTable1755345336350';
  tableName = 'flashcard_set';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "${this.tableName}" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" uuid default null,
        "title" character varying(255) NOT NULL,
        "description" TEXT,
        "visibility" character varying(20) NOT NULL DEFAULT 'private',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_flashcard_set_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_flashcard_set_owner_id" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_flashcard_set_owner_id" ON "${this.tableName}"("owner_id")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_flashcard_set_title_owner" 
      ON "flashcard_set"("title","owner_id") 
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "UQ_flashcard_set_title_owner"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_flashcard_set_owner_id"
    `);

    await queryRunner.query(`
      DROP TABLE "${this.tableName}"
    `);
  }
}
