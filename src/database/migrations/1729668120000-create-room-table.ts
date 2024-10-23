import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoomTable1729668120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "room" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "room_pin" character varying NOT NULL,
        "started_at" TIMESTAMP WITH TIME ZONE,
        "ended_at" TIMESTAMP WITH TIME ZONE,
        "room_status" character varying NOT NULL,
        "is_show_question" boolean NOT NULL DEFAULT false,
        "is_auto_play" boolean NOT NULL DEFAULT false,
        "lobby_music" character varying,
        "quizzfly_id" uuid NOT NULL,
        "host_id" uuid NOT NULL,
        CONSTRAINT "PK_room_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "room"
      ADD CONSTRAINT "FK_room_quizzfly" FOREIGN KEY ("quizzfly_id")
      REFERENCES "quizzfly"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "room"
      ADD CONSTRAINT "FK_room_user" FOREIGN KEY ("host_id")
      REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "room" DROP CONSTRAINT "FK_room_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room" DROP CONSTRAINT "FK_room_quizzfly"`,
    );
    await queryRunner.query(`DROP TABLE "room"`);
  }
}
