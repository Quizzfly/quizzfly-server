import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableMemberInGroupAndTableGroup1731570060000 implements MigrationInterface {
  name = 'CreateTableMemberInGroupAndTableGroup1731570060000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "group"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "name" character varying NOT NULL,
        "description" character varying,
        "background" character varying,
        CONSTRAINT "PK_group_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "member_in_group"
      (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "role" character varying,
        "member_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "group_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        CONSTRAINT "PK_member_in_group_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "member_in_group"
      ADD CONSTRAINT "FK_member_in_group_member" FOREIGN KEY ("member_id")
      REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "member_in_group"
      ADD CONSTRAINT "FK_member_in_group_group" FOREIGN KEY ("group_id")
      REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "group"`);

    await queryRunner.query(
      `ALTER TABLE "member_in_group" DROP CONSTRAINT "FK_member_in_group_member"`,
    );
    await queryRunner.query(
      `ALTER TABLE "member_in_group" DROP CONSTRAINT "FK_member_in_group_group"`,
    );

    await queryRunner.query(`DROP TABLE "member_in_group"`);
  }
}
