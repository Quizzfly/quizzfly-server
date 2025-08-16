import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFolderAndFolderShareTables1736000000000 implements MigrationInterface {
    name = 'CreateFolderAndFolderShareTables1736000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "folder" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "name" character varying(100) NOT NULL,
        "description" text,
        "user_id" uuid NOT NULL,
        "is_public" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_folder_id" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_folder_user_id" ON "folder" ("user_id")
    `);

        await queryRunner.query(`
      ALTER TABLE "folder"
      ADD CONSTRAINT "FK_folder_user" FOREIGN KEY ("user_id")
      REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

        await queryRunner.query(`
      CREATE TYPE "public"."folder_share_permission_level_enum" AS ENUM ('view', 'edit')
    `);

        await queryRunner.query(`
      CREATE TABLE "folder_share" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "folder_id" uuid NOT NULL,
        "owner_id" uuid NOT NULL,
        "shared_with_email" character varying(100),
        "share_token" character varying(255) NOT NULL,
        "permission_level" "public"."folder_share_permission_level_enum" NOT NULL DEFAULT 'view',
        "is_active" boolean NOT NULL DEFAULT true,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "email_sent_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_folder_share_id" PRIMARY KEY ("id")
      )
    `);

        await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_folder_share_token" ON "folder_share" ("share_token")
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_folder_share_folder_id" ON "folder_share" ("folder_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_folder_share_owner_id" ON "folder_share" ("owner_id")
    `);

        await queryRunner.query(`
      CREATE INDEX "IDX_folder_share_shared_with_email" ON "folder_share" ("shared_with_email")
    `);

        await queryRunner.query(`
      ALTER TABLE "folder_share"
      ADD CONSTRAINT "FK_folder_share_folder" FOREIGN KEY ("folder_id")
      REFERENCES "folder"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

        await queryRunner.query(`
      ALTER TABLE "folder_share"
      ADD CONSTRAINT "FK_folder_share_owner" FOREIGN KEY ("owner_id")
      REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "folder_share" DROP CONSTRAINT "FK_folder_share_owner"
    `);
        await queryRunner.query(`
      ALTER TABLE "folder_share" DROP CONSTRAINT "FK_folder_share_folder"
    `);
        await queryRunner.query(`
      DROP INDEX "IDX_folder_share_shared_with_email"
    `);
        await queryRunner.query(`
      DROP INDEX "IDX_folder_share_owner_id"
    `);
        await queryRunner.query(`
      DROP INDEX "IDX_folder_share_folder_id"
    `);
        await queryRunner.query(`
      DROP INDEX "UQ_folder_share_token"
    `);
        await queryRunner.query(`
      DROP TABLE "folder_share"
    `);
        await queryRunner.query(`
      DROP TYPE "public"."folder_share_permission_level_enum"
    `);
        await queryRunner.query(`
      ALTER TABLE "folder" DROP CONSTRAINT "FK_folder_user"
    `);
        await queryRunner.query(`
      DROP INDEX "IDX_folder_user_id"
    `);
        await queryRunner.query(`
      DROP TABLE "folder"
    `);
    }
}


