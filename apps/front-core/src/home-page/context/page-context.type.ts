import { Article } from "@/pages/land/[x]/[y]/[z]/components/ArticleList/ArticleList.type";

export interface ChangeCurrentArticle {
  (selectedArticle: NonNullable<PageContextValue["currentArticle"]>): void;
}

export interface PageContextValue {
  currentArticle: Nullable<Article>;
  changeCurrentArticle: ChangeCurrentArticle;
}
