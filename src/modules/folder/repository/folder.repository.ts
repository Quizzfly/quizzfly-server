import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FolderEntity } from '../entity/folder.entity';

@Injectable()
export class FolderRepository extends Repository<FolderEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(FolderEntity, dataSource.createEntityManager());
    }
}


