import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParticipantInRoomTable1732964216415
  implements MigrationInterface
{
  name = 'CreateParticipantInRoomTable1732964216415';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "participant_in_room" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "socket_id" character varying DEFAULT null,
        "user_id" uuid DEFAULT null,
        "nick_name" character varying NOT NULL,
        "room_id" uuid NOT NULL,
        "room_pin" character varying NOT NULL,
        "total_score" integer NOT NULL DEFAULT 0,
        "rank" integer DEFAULT null,
        "time_join" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "time_left" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "time_kicked" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "correct_count" integer NOT NULL DEFAULT 0,
        "incorrect_count" integer NOT NULL DEFAULT 0,
        "unanswered_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_participant_in_room_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "participant_in_room"
      ADD CONSTRAINT "FK_participant_in_room_user"
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "participant_in_room"
      ADD CONSTRAINT "FK_participant_in_room_room"
      FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "participant_in_room" DROP CONSTRAINT "FK_participant_in_room_room"
    `);
    await queryRunner.query(`
      ALTER TABLE "participant_in_room" DROP CONSTRAINT "FK_participant_in_room_user"
    `);
    await queryRunner.query(`
      DROP TABLE "participant_in_room"
    `);
  }
}
