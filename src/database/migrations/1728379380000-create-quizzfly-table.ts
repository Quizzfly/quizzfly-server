import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizzflyTable1728379380000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "quizzfly" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "title" character varying,
        "description" character varying,
        "cover_image" character varying,
        "theme" character varying,
        "is_public" boolean DEFAULT true,
        "quizzfly_status" character varying NOT NULL DEFAULT 'DRAFT',
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_quizzfly_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "quizzfly"
      ADD CONSTRAINT "FK_user_quizzfly" FOREIGN KEY ("user_id")
      REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quizzfly" DROP CONSTRAINT "FK_user_quizzfly"`,
    );
    await queryRunner.query(`DROP TABLE "quizzfly"`);
  }
}
