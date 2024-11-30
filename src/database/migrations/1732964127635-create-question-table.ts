import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuestionTable1732964127635 implements MigrationInterface {
  name = 'CreateQuestionTable1732964127635';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "question" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "room_id" uuid NOT NULL,
        "type" character varying NOT NULL,
        "quiz_type" character varying NOT NULL,
        "start_time" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "done" boolean NOT NULL DEFAULT false,
        "correct_answer_id" uuid DEFAULT null,
        "content" character varying DEFAULT null,
        "time_limit" integer DEFAULT null,
        "point_multiplier" integer DEFAULT null,
        "files" jsonb DEFAULT '[]',
        "background_url" character varying DEFAULT null,
        "question_index" integer NOT NULL,
        "choices" jsonb DEFAULT null,
        "answers" jsonb DEFAULT null,
        CONSTRAINT "PK_question_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "question"
      ADD CONSTRAINT "FK_question_room"
      FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "question" DROP CONSTRAINT "FK_question_room"
    `);
    await queryRunner.query(`
      DROP TABLE "question"
    `);
  }
}
