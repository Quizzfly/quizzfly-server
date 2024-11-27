import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableReactPost1732545240000 implements MigrationInterface {
  name = 'CreateTableReactPost1732545240000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "react_post"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "member_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        CONSTRAINT "PK_react_post_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "react_post"
      ADD CONSTRAINT "FK_react_post_member" FOREIGN KEY ("member_id")
      REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "react_post"
      ADD CONSTRAINT "FK_react_post_post" FOREIGN KEY ("post_id")
      REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "react_post" DROP CONSTRAINT "FK_react_post_member"`,
    );
    await queryRunner.query(
      `ALTER TABLE "react_post" DROP CONSTRAINT "FK_react_post_post"`,
    );

    await queryRunner.query(`DROP TABLE "react_post"`);
  }
}
