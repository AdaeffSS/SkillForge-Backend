import { Injectable, OnModuleInit } from "@nestjs/common";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import yaml from "js-yaml";
import { Logger } from "../logger/logger.service.js";
import chalk from "chalk";

interface TaskData {
  parameters?: Record<string, any>;
  [key: string]: any;
}

interface Tasks {
  [key: string]: TaskData;
}

@Injectable()
export class FileLoaderService implements OnModuleInit {
  private readonly basePath = join(process.cwd(), "resources/tasks");
  private readonly tasks: Tasks = {};
  private readonly PARAMETERS_FILE = "parameters.yaml";
  private readonly MUSTACHE_EXT = ".mustache";
  private isInitialized = false;

  constructor(private readonly logger: Logger) {
    this.logger.setContext(FileLoaderService.name);
  }

  async onModuleInit() {
    try {
      await this.loadAllTasks();
      this.logger.log("FileLoaderService initialized: all tasks loaded");
    } catch (error) {
      this.logger.error("Failed to initialize FileLoaderService", error.stack);
      // Можно бросить ошибку, чтобы приложение не стартовало без данных
      throw error;
    }
  }

  private async directoryExists(path: string): Promise<boolean> {
    try {
      const stats = await stat(path);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  private async loadTask(taskName: string): Promise<TaskData> {
    const taskPath = join(this.basePath, taskName);
    const taskData: TaskData = {};

    if (!(await this.directoryExists(taskPath))) {
      this.logger.error(
        `Task directory ${chalk.red.bold(taskName)} does not exist`
      );
      throw new Error(`Task directory ${taskName} does not exist`);
    }

    try {
      const files = await readdir(taskPath, { withFileTypes: true });

      for (const file of files) {
        if (!file.isFile()) continue;

        const filePath = join(taskPath, file.name);

        if (file.name === this.PARAMETERS_FILE) {
          const data = await readFile(filePath, "utf-8");
          taskData.parameters = yaml.load(data) as Record<string, any>;
          this.logger.log(
            `Task ${chalk.bold.hex("#B2004D")(taskName)} parameters loaded: ${chalk.gray(
              JSON.stringify(taskData.parameters)
            )}`
          );
        } else if (file.name.endsWith(this.MUSTACHE_EXT)) {
          const templateName = file.name.replace(this.MUSTACHE_EXT, "");
          taskData[templateName] = await readFile(filePath, "utf-8");
          this.logger.log(
            `Task ${chalk.bold.hex("#B2004D")(taskName)} template ${chalk.bold.hex(
              "#B2004D"
            )(templateName)} loaded: ${chalk.gray(
              taskData[templateName].slice(0, 50) +
              (taskData[templateName].length > 50 ? "..." : "")
            )}`
          );
        }
      }

      return taskData;
    } catch (error) {
      this.logger.error(
        `Failed to load task ${chalk.red.bold(taskName)}: ${error.message}`,
        error.stack
      );
      throw new Error(`Failed to load task ${taskName}: ${error.message}`);
    }
  }

  private async loadAllTasks(): Promise<Tasks> {
    if (this.isInitialized) {
      this.logger.log("Tasks already loaded, skipping");
      return this.tasks;
    }

    if (!(await this.directoryExists(this.basePath))) {
      this.logger.error(
        `Tasks directory ${chalk.red.bold(this.basePath)} does not exist`
      );
      throw new Error(`Tasks directory ${this.basePath} does not exist`);
    }

    const taskDirs = await readdir(this.basePath, { withFileTypes: true });
    const taskPromises = taskDirs
      .filter((dir) => dir.isDirectory())
      .map((dir) =>
        this.loadTask(dir.name).then((taskData) => ({
          name: dir.name,
          taskData,
        }))
      );

    const loadedTasks = await Promise.all(taskPromises);

    loadedTasks.forEach(({ name, taskData }) => {
      this.tasks[name] = taskData;
    });

    this.logger.log(
      `Loaded ${chalk.bold.hex("#B2004D")(Object.keys(this.tasks).length)} tasks`
    );
    this.isInitialized = true;

    return this.tasks;
  }

  getTasks(): Tasks {
    if (!this.isInitialized) {
      throw new Error("Tasks not loaded yet");
    }
    return this.tasks;
  }
}
