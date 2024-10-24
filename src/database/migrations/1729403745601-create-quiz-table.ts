import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizTable1729403745601 implements MigrationInterface {
  name = 'CreateQuizTable1729403745601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quiz"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" character varying,
        "time_limit" integer NOT NULL DEFAULT 20,
        "point_multiplier" integer NOT NULL DEFAULT 1,
        "quiz_type" character varying NOT NULL,
        "files" jsonb NOT NULL DEFAULT '[]',
        "prev_element_id" uuid  DEFAULT null,
        "quizzfly_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_quiz_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "quiz"
        ADD CONSTRAINT "FK_quizzfly_quiz" FOREIGN KEY ("quizzfly_id")
          REFERENCES "quizzfly" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quiz" DROP CONSTRAINT "FK_quizzfly_quiz"`,
    );
    await queryRunner.query(`DROP TABLE "quiz"`);
  }
}
