import { Controller, Get, Query, Res } from "@nestjs/common";
import { createWriteStream } from 'fs';
import { TasksManager } from "./tasks.manager";
import { Exam, Sub } from "./enums";
import { writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller("tasks")
export class TasksController {
  constructor(private readonly taskManager: TasksManager) {
  }

  @Get()
  async getTask(
    @Query('exam') exam: Exam,
    @Query('subject') subject: Sub,
    @Query('task') task: string
  ) {
    return this.taskManager.getTask(exam, subject, task).createTask()
  }

  @Get('file')
  async createFile() {
    const chars = '*+0123456789';
    const length = 1_000_000;
    const fileName = `file_${uuidv4()}.txt`;
    const filePath = join(process.cwd(), 'static', fileName);

    const stream = createWriteStream(filePath, { encoding: 'utf-8' });

    const chunkSize = 10_000;
    for (let written = 0; written < length; written += chunkSize) {
      let chunk = '';
      for (let i = 0; i < chunkSize && written + i < length; i++) {
        chunk += chars[Math.floor(Math.random() * chars.length)];
      }
      stream.write(chunk);
    }

    stream.end();

    await new Promise<void>((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return {
      success: true,
      url: `/static/${fileName}`,
    };
  }
}
