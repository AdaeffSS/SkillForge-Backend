import { Injectable } from "@nestjs/common";
import fg from "fast-glob";
import { resolve, relative, basename } from "path";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { Logger } from "../logger/logger.service";

@Injectable()
export class TaskLoaderService {
  constructor(private readonly logger: Logger) {
    this.logger.setContext(TaskLoaderService.name);
  }

  private readonly templates: Record<string, string> = {};
  private readonly parameters: Record<string, Record<string, any>> = {};

  private readonly basePath = resolve(process.cwd(), "resources/tasks");
  private readonly compiledTasksPath = resolve(
    process.cwd(),
    "dist/modules/tasks",
  );

  /**
   * Получить папку задачи по ключу задачи.
   * @param taskKey Ключ задачи
   * @returns Папка задачи
   */
  private getTaskFolder(taskKey: string): string {
    const lastUnderscore = taskKey.lastIndexOf("_");
    return lastUnderscore !== -1
      ? taskKey.substring(0, lastUnderscore)
      : taskKey;
  }

  /**
   * Построить ключ для шаблона задачи
   * @param exam Экзамен
   * @param subject Предмет
   * @param taskKey Ключ задачи
   * @returns Ключ шаблона
   */
  private buildTemplateKey(
    exam: string,
    subject: string,
    taskKey: string,
  ): string {
    const taskFolder = this.getTaskFolder(taskKey);
    return `${exam}/${subject}/${taskFolder}/${taskKey}`.toLowerCase();
  }

  /**
   * Построить ключ для параметров задачи
   * @param exam Экзамен
   * @param subject Предмет
   * @param taskKey Ключ задачи
   * @returns Ключ параметров
   */
  private buildParametersKey(
    exam: string,
    subject: string,
    taskKey: string,
  ): string {
    const taskFolder = this.getTaskFolder(taskKey);
    return `${exam}/${subject}/${taskFolder}`.toLowerCase();
  }

  /**
   * Импортировать все классы задач, а также загрузить шаблоны и параметры.
   * @returns Массив импортированных классов задач
   */
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
      } catch (e) {
        this.logger.error(
          `Data loading error for task ${exam}.${subject}.${taskKey}`,
          e,
        );
        throw e;
      }
    }

    this.logger.log(
      "Tasks classes import and templates/parameters loading are complete",
    );
    return tasksClasses;
  }

  /**
   * Импортировать классы задач из файлов
   * @returns Массив классов задач
   */
  private async importTaskClasses(): Promise<any[]> {
    const entries = await fg(["*/**/*.js"], {
      cwd: this.compiledTasksPath,
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

        const relativePath = relative(this.compiledTasksPath, filePath);
        const fileName = basename(relativePath, ".js");

        this.logger.log(`The task file is successfully imported: ${fileName}`);
      } catch (error) {
        this.logger.error(
          `Error when importing file: ${relative(this.compiledTasksPath, filePath)}`,
          error,
        );
      }
    }

    return tasksClasses;
  }

  /**
   * Загрузить все mustache шаблоны из папки ресурсов
   */
  private async loadTemplates(): Promise<void> {
    const pattern = "**/*.mustache";

    const files = await fg(pattern, {
      cwd: this.basePath,
      absolute: true,
    });

    this.logger.log(`Found templates: ${files.length}`);

    for (const filePath of files) {
      try {
        const content = await readFile(filePath, "utf-8");

        const relativePath = filePath.slice(this.basePath.length + 1);
        const key = relativePath.replace(/\.mustache$/, "").toLowerCase();

        this.templates[key] = content;

        this.logger.log(`Loaded template: ${key}`);
      } catch (error) {
        this.logger.error(`Template loading error: ${filePath}`, error);
      }
    }
  }

  /**
   * Загрузить все YAML файлы с параметрами из папки ресурсов
   */
  private async loadParameters(): Promise<void> {
    const pattern = "**/parameters.yaml";

    const files = await fg(pattern, {
      cwd: this.basePath,
      absolute: true,
    });

    this.logger.log(`Found files of parameters: ${files.length}`);

    for (const filePath of files) {
      try {
        const content = await readFile(filePath, "utf-8");
        const data = yaml.load(content) as Record<string, any>;

        const relativePath = filePath.slice(this.basePath.length + 1);
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

  /**
   * Получить шаблон задачи по экзамену, предмету и ключу задачи
   * @param exam Экзамен
   * @param subject Предмет
   * @param taskKey Ключ задачи
   * @returns Содержимое шаблона
   */
  getTemplate(exam: string, subject: string, taskKey: string): string {
    const key = this.buildTemplateKey(exam, subject, taskKey);

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

  /**
   * Получить параметры задачи по экзамену, предмету и ключу задачи
   * @param exam Экзамен
   * @param subject Предмет
   * @param taskKey Ключ задачи
   * @returns Параметры задачи
   */
  getParameters(
    exam: string,
    subject: string,
    taskKey: string,
  ): Record<string, any> {
    const key = this.buildParametersKey(exam, subject, taskKey);

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
