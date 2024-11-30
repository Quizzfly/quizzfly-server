import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRoomTableAddColumnLocked1732964048254
  implements MigrationInterface
{
  name = 'UpdateRoomTableAddColumnLocked1732964048254';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "room" RENAME COLUMN "started_at" TO "start_time"
    `);

    await queryRunner.query(`
      ALTER TABLE "room" RENAME COLUMN "ended_at" TO "end_time"
    `);

    await queryRunner.query(`
      ALTER TABLE "room" ADD COLUMN "locked" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "room" RENAME COLUMN "start_time" TO "started_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "room" RENAME COLUMN "end_time" TO "ended_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "room" DROP COLUMN "locked"
    `);
  }
}
