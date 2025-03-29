import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserInfoTable1727583697764 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_info" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "name" character varying,
        "avatar" character varying,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        CONSTRAINT "PK_user_info_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_user_info_username" ON "user_info" ("username")
      WHERE "deleted_at" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "user_info"
      ADD CONSTRAINT "FK_user_info_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE  ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "UQ_user_info_username"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_info" DROP CONSTRAINT "FK_user_info_user"
    `);

    await queryRunner.query(`
      DROP TABLE "user_info"
    `);
  }
}
