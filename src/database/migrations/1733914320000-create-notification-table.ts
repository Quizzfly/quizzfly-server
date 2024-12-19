import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationTable1733914320000
  implements MigrationInterface
{
  name = 'CreateNotificationTable1733914320000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notification" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "content" character varying,
        "is_read" boolean NOT NULL DEFAULT false,
        "object_id" uuid NOT NULL,
        "notification_type" character varying,
        "agent_id" uuid NOT NULL,
        "receiver_id" uuid NOT NULL,
        CONSTRAINT "PK_notification_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "notification"
      ADD CONSTRAINT "FK_agent"
      FOREIGN KEY ("agent_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "notification"
      ADD CONSTRAINT "FK_receiver"
      FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification" DROP CONSTRAINT "FK_agent"
    `);
    await queryRunner.query(`
      ALTER TABLE "notification" DROP CONSTRAINT "FK_receiver"
    `);
    await queryRunner.query(`
      DROP TABLE "notification"
    `);
  }
}
