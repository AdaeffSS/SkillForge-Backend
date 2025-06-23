import { Injectable } from "@nestjs/common";
import fg from "fast-glob";
import { resolve, relative, basename } from "path";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { Logger } from "../logger/logger.service";
import "reflect-metadata";

@Injectable()
export class TaskLoaderService {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(TaskLoaderService.name);
  }

  private templates: Record<string, string> = {};
  private parameters: Record<string, Record<string, any>> = {};

  async importAllTasks(): Promise<any[]> {
    const tasksClasses = await this.importTaskClasses();
    await this.loadTemplates();
    await this.loadParameters();

    for (const taskClass of tasksClasses) {
      const exam = Reflect.getMetadata("exam", taskClass);
      const subject = Reflect.getMetadata("subject", taskClass);
      const taskKey = Reflect.getMetadata("taskKey", taskClass);

      if (!exam || !subject || !taskKey) {
        this.logger.error("The task has no metadata Exam/Subject/TaskKey");
        throw new Error("Metadata tasks were not found");
      }

      try {
        this.getTemplate(exam, subject, taskKey);
        this.getParameters(exam, subject, taskKey);
      } catch (err) {
        this.logger.error(
          `Data loading error for task ${exam}.${subject}.${taskKey}`,
          err,
        );
        throw err;
      }
    }

    this.logger.log(
      "Tasks classes import and templates/parameters loading are complete",
    );
    return tasksClasses;
  }

  private async importTaskClasses(): Promise<any[]> {
    const rootPath = process.cwd();
    const tasksDir = resolve(rootPath, "dist/modules/tasks");

    const entries = await fg(["*/**/*.js"], {
      cwd: tasksDir,
      absolute: true,
      ignore: ["entities/*.js"],
    });

    this.logger.log(`Found files for imports: ${entries.length}`);

    const tasksClasses: any[] = [];
    for (const filePath of entries) {
      try {
        const module = (await import(filePath)) as any;
        const taskClass = module.default ?? Object.values(module)[0];
        tasksClasses.push(taskClass);
        this.logger.log(
          `The task file is successfully imported: ${basename(relative(`${rootPath}/dist/modules/tasks/`, filePath), '.js')}`,
        );
      } catch (error) {
        console.error(error);
        this.logger.error(
          `Error when importing file: ${relative(`${rootPath}/dist/modules/tasks/`, filePath)}`,
        );
      }
    }
    return tasksClasses;
  }

  private async loadTemplates(): Promise<void> {
    const basePath = resolve(process.cwd(), "resources/tasks");
    const pattern = "**/*.mustache";

    const files = await fg(pattern, {
      cwd: basePath,
      absolute: true,
    });

    this.logger.log(`Found templates: ${files.length}`);

    for (const filePath of files) {
      try {
        const content = await readFile(filePath, "utf-8");

        const relativePath = filePath.slice(basePath.length + 1);
        const key = relativePath.replace(/\.mustache$/, "").toLowerCase();

        this.templates[key] = content;

        this.logger.log(`Loaded template: ${key}`);
      } catch (error) {
        this.logger.error(`Template loading error: ${filePath}`, error);
      }
    }
  }

  private async loadParameters(): Promise<void> {
    const basePath = resolve(process.cwd(), "resources/tasks");
    const pattern = "**/parameters.yaml";

    const files = await fg(pattern, {
      cwd: basePath,
      absolute: true,
    });

    this.logger.log(`Found files of parameters: ${files.length}`);

    for (const filePath of files) {
      try {
        const content = await readFile(filePath, "utf-8");
        const data = yaml.load(content) as Record<string, any>;

        const relativePath = filePath.slice(basePath.length + 1);
        const key = relativePath
          .replace(/\/parameters\.yaml$/, "")
          .toLowerCase();

        this.parameters[key] = data;

        this.logger.log(`Parameters are loaded: ${key}`);
      } catch (error) {
        this.logger.error(`Error loading parameters ${filePath}`, error);
      }
    }
  }

  getTemplate(exam: string, subject: string, taskKey: string): string {
    const lastUnderscore = taskKey.lastIndexOf("_");
    const taskFolder =
      lastUnderscore !== -1 ? taskKey.substring(0, lastUnderscore) : taskKey;

    const key = `${exam.toLowerCase()}/${subject.toLowerCase()}/${taskFolder.toLowerCase()}/${taskKey.toLowerCase()}`;

    const template = this.templates[key];
    if (!template) {
      this.logger.error(
        `Template not found for task ${taskKey} in ${exam}/${subject} for key: ${key}`,
      );
      throw new Error(
        `Template not found for task ${taskKey} in ${exam}/${subject} for key: ${key}`,
      );
    }
    return template;
  }

  getParameters(
    exam: string,
    subject: string,
    taskKey: string,
  ): Record<string, any> {
    const lastUnderscore = taskKey.lastIndexOf("_");
    const taskFolder =
      lastUnderscore !== -1 ? taskKey.substring(0, lastUnderscore) : taskKey;

    const key = `${exam.toLowerCase()}/${subject.toLowerCase()}/${taskFolder.toLowerCase()}`;

    const params = this.parameters[key];
    if (!params) {
      this.logger.error(
        `Parameters not found for task ${taskKey} in ${exam}.${subject} for key: ${key}`,
      );
      throw new Error(
        `Parameters not found for task ${taskKey} in ${exam}.${subject} for key: ${key}`,
      );
    }
    return params;
  }
}
