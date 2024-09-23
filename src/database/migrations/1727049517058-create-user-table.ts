import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1727049517058 implements MigrationInterface {
  name = 'CreateUserTable1727049517058';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'USER',
        "is_active" boolean NOT NULL DEFAULT true,
        "is_confirmed" boolean default null,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_user_username" ON "user" ("username")
      WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_user_email" ON "user" ("email")
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "UQ_user_email"
    `);
    await queryRunner.query(`
      DROP INDEX "UQ_user_username"
    `);
    await queryRunner.query(`
      DROP TABLE "user"
    `);
  }
}
