import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParticipantAnswerTable1732964233723
  implements MigrationInterface
{
  name = 'CreateParticipantAnswerTable1732964233723';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "participant_answer" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "question_id" uuid NOT NULL,
        "participant_id" uuid NOT NULL,
        "chosen_answer_id" uuid NOT NULL,
        "is_correct" boolean NOT NULL,
        "score" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_participant_answer_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "participant_answer"
      ADD CONSTRAINT "FK_participant_answer_question"
      FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "participant_answer"
      ADD CONSTRAINT "FK_participant_answer_participant"
      FOREIGN KEY ("participant_id") REFERENCES "participant_in_room"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "participant_answer" DROP CONSTRAINT "FK_participant_answer_participant"
    `);
    await queryRunner.query(`
      ALTER TABLE "participant_answer" DROP CONSTRAINT "FK_participant_answer_question"
    `);
    await queryRunner.query(`
      DROP TABLE "participant_answer"
    `);
  }
}
