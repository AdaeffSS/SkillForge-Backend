import { Injectable } from '@nestjs/common';
import fg from 'fast-glob';
import { resolve } from 'path';
import { Logger } from '../logger/logger.service';

@Injectable()
export class TaskLoaderService {
  private readonly logger = new Logger();

  async importAllTasks(): Promise<any[]> {
    const tasksDir = resolve(process.cwd(), 'dist/modules/tasks');

    const entries = await fg(['*/**/*.js'], {
      cwd: tasksDir,
      absolute: true,
    });

    this.logger.log(`Найдено файлов для импорта: ${entries.length}`);

    const tasksClasses: any[] = [];
    for (const filePath of entries) {
      try {
        const module = await import(filePath) as any;
        const taskClass = module.default ?? Object.values(module)[0];
        tasksClasses.push(taskClass);
        this.logger.log(`Успешно импортирован файл: ${filePath}`);
      } catch (error) {
        this.logger.error(`Ошибка при импорте файла: ${filePath}`, error);
      }
    }
    return tasksClasses;
  }
}
