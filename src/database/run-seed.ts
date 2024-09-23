import { AppDataSource } from '@database/data-source';
import { runSeeders } from 'typeorm-extension';

(async () => {
  const dataSource = AppDataSource;
  await dataSource.initialize();
  await runSeeders(dataSource);
})();
