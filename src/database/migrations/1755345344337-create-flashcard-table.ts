import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFlashcardTable1755345344337 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "flashcard" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "set_id" uuid NOT NULL,
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "image_url" character varying(500),
        "audio_url" character varying(500),
        "sort_order" integer NOT NULL,
        "options" character varying(500)[] DEFAULT null,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_flashcard_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_flashcard_set_id" FOREIGN KEY ("set_id") REFERENCES "flashcard_set"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_flashcard_set_sort_order" ON "flashcard" ("set_id", "sort_order")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_flashcard_set_id_question" ON "flashcard" ("set_id", "question")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_flashcard_set_sort_order"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_flashcard_set_id_question"
    `);

    await queryRunner.query(`
      DROP TABLE "flashcard"
    `);
  }
}
