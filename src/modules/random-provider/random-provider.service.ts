import { Injectable } from "@nestjs/common";

/**
 * Провайдер для генерации псевдослучайных чисел с возможностью установки зерна.
 */
@Injectable()
export class RandomProvider {
  private readonly seed: number;
  private state: number;

  /**
   * Создаёт новый генератор случайных чисел с указанным зерном или текущим временем.
   * @param seed - начальное значение для генератора.
   */
  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
    this.state = this.seed;
  }

  /**
   * Генерирует следующее псевдослучайное число в диапазоне [0, 1).
   * @returns Число с плавающей точкой от 0 (включительно) до 1 (не включительно).
   */
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 0x100000000;
    return this.state / 0x100000000;
  }

  /**
   * Генерирует случайное целое число в диапазоне [min, max].
   * @param min - минимальное значение (включительно).
   * @param max - максимальное значение (включительно).
   * @returns Случайное целое число в указанном диапазоне.
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Выбирает случайный элемент из массива или случайный символ из строки.
   * @param input - массив элементов или строка.
   * @throws Ошибка, если входной массив или строка пусты.
   * @returns Случайный элемент массива или символ строки.
   */
  pick<T>(input: T[]): T;
  pick(input: string): string;
  pick<T>(input: T[] | string): T | string {
    if (!input.length) {
      throw new Error("Cannot pick from empty array or string");
    }

    const index = this.nextInt(0, input.length - 1);
    return input[index];
  }

  /**
   * Возвращает случайное имя по полу.
   * @param gender - пол: "male" или "female". Если не указан, выбирается случайно.
   * @returns Случайное имя соответствующего пола.
   */
  getRandomName(gender?: "male" | "female"): string {
    const maleNames = [
      "Ваня",
      "Петя",
      "Алексей",
      "Дима",
      "Сергей",
      "Андрей",
      "Миша",
      "Коля",
      "Владимир",
      "Женя",
      "Юра",
      "Максим",
      "Витя",
      "Олег",
      "Константин",
      "Вася",
      "Аркадий",
      "Игорь",
      "Рома",
      "Толя",
      "Степа",
    ];

    const femaleNames = [
      "Анна",
      "Мария",
      "Елена",
      "Ольга",
      "Татьяна",
      "Наталья",
      "Светлана",
      "Ирина",
      "Людмила",
      "Вера",
      "Любовь",
      "Екатерина",
      "Юлия",
      "Ксения",
      "Алёна",
      "Валентина",
    ];

    if (!gender) {
      gender = this.pick(["male", "female"]);
    }
    if (gender === "male") {
      return this.pick(maleNames);
    } else return this.pick(femaleNames);
  }

  /**
   * Возвращает текущий сид генератора.
   * @returns Числовое значение зерна.
   */
  getSeed(): number {
    return this.seed;
  }
}
