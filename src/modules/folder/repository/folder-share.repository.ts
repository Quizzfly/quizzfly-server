import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FolderShareEntity } from '../entity/folder-share.entity';

@Injectable()
export class FolderShareRepository extends Repository<FolderShareEntity> {
    constructor(private readonly dataSource: DataSource) {
        super(FolderShareEntity, dataSource.createEntityManager());
    }
}


