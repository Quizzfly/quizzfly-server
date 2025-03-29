import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableCommentPost1732632300000 implements MigrationInterface {
  name = 'CreateTableCommentPost1732632300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "comment_post"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "content" character varying,
        "files" jsonb NOT NULL DEFAULT '[]',
        "member_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "parent_comment_id" uuid,
        CONSTRAINT "PK_comment_post_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "comment_post"
      ADD CONSTRAINT "FK_comment_post_member" FOREIGN KEY ("member_id")
      REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "comment_post"
      ADD CONSTRAINT "FK_comment_post_post" FOREIGN KEY ("post_id")
      REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "comment_post"
      ADD CONSTRAINT "FK_comment_post_comment" FOREIGN KEY ("parent_comment_id")
      REFERENCES "comment_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_post" DROP CONSTRAINT "FK_comment_post_member"`,
    );

    await queryRunner.query(
      `ALTER TABLE "comment_post" DROP CONSTRAINT "FK_comment_post_post"`,
    );

    await queryRunner.query(
      `ALTER TABLE "comment_post" DROP CONSTRAINT "FK_comment_post_comment"`,
    );

    await queryRunner.query(`DROP TABLE "comment_post"`);
  }
}
