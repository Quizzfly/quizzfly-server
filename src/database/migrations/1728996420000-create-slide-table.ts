import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSlideTable1728996420000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "slide" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT null,
        "content" character varying,
        "files" character varying[],
        "background_color" character varying,
        "no" integer,
        "quizzfly_id" uuid NOT NULL,
        CONSTRAINT "PK_slide_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "slide"
      ADD CONSTRAINT "FK_quizzfly_slide" FOREIGN KEY ("quizzfly_id")
      REFERENCES "quizzfly"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "slide" DROP CONSTRAINT "FK_quizzfly_slide"`,
    );
    await queryRunner.query(`DROP TABLE "slide"`);
  }
}
