import { Article } from "./ArticleList.type";

const getRandomNumber = (min = 3, max = 10) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomString = () => {
  const [A, Z] = [65, 122];
  const textLength = getRandomNumber();

  return Array.from({ length: textLength }, () => {
    const randomNumber = getRandomNumber(A, Z);
    return String.fromCharCode(randomNumber);
  }).join("");
};

const generateRandomArticleList = (): Array<Article> => {
  const categoryCount = getRandomNumber(10, 25);

  return Array.from({ length: categoryCount }, (_, x) => {
    const categoryArticleListLength = getRandomNumber(30, 50);
    const category = generateRandomString();

    return Array.from({ length: categoryArticleListLength }, (_, z) => {
      const isOverHalf = z > categoryArticleListLength / 2;

      return {
        location: {
          x: isOverHalf ? x * 2 : x * 2 - 1,
          z: isOverHalf ? z - Math.round(categoryArticleListLength / 2) : z,
        },
        category,
        height: getRandomNumber(0, 3),
      };
    });
  }).flat(Infinity) as Array<Article>;
};

export const MOCK_ARTICLE_LIST = generateRandomArticleList();

export const AROUND_DIRECT = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
] as const;
