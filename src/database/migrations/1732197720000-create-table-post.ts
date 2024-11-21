import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTablePost1732197720000 implements MigrationInterface {
  name = 'CreateTablePost1732197720000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "post"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "type" character varying NOT NULL,
        "content" character varying,
        "files" jsonb NOT NULL DEFAULT '[]',
        "member_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "group_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quizzfly_id" uuid,
        CONSTRAINT "PK_post_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "post"
      ADD CONSTRAINT "FK_post_member" FOREIGN KEY ("member_id")
      REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "post"
      ADD CONSTRAINT "FK_post_group" FOREIGN KEY ("group_id")
      REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "post"
      ADD CONSTRAINT "FK_post_quizzfly" FOREIGN KEY ("quizzfly_id")
      REFERENCES "quizzfly"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT "FK_post_member"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT "FK_post_group"`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT "FK_post_quizzfly"`,
    );

    await queryRunner.query(`DROP TABLE "post"`);
  }
}
