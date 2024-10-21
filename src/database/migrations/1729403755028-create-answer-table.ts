import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnswerTable1729403755028 implements MigrationInterface {
  name = 'CreateAnswerTable1729403755028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "answer" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" character varying NOT NULL,
        "is_correct" boolean NOT NULL DEFAULT false,
        "files" jsonb NOT NULL DEFAULT '[]',
        "quiz_id" uuid NOT NULL,
        CONSTRAINT "PK_answer_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "answer"
        ADD CONSTRAINT "FK_answer_quiz" FOREIGN KEY ("quiz_id")
          REFERENCES "quiz" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "answer" DROP CONSTRAINT "FK_answer_quiz"`,
    );
    await queryRunner.query(`DROP TABLE "answer"`);
  }
}
