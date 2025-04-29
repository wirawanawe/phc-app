import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { v4 as uuidv4 } from "uuid";

// Article attributes interface
export interface ArticleAttributes {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  imageUrl: string;
  author: string;
  isPublished: boolean;
  publishedDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Attributes for creating a new Article (optional fields)
export interface ArticleCreationAttributes
  extends Optional<
    ArticleAttributes,
    "id" | "createdAt" | "updatedAt" | "publishedDate" | "slug"
  > {}

// Article model class definition
class Article
  extends Model<ArticleAttributes, ArticleCreationAttributes>
  implements ArticleAttributes
{
  public id!: string;
  public title!: string;
  public slug!: string;
  public content!: string;
  public summary!: string;
  public imageUrl!: string;
  public author!: string;
  public isPublished!: boolean;
  public publishedDate!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Initialize Article model
Article.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    author: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    publishedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "articles",
    sequelize,
    timestamps: true,
    hooks: {
      beforeCreate: (article) => {
        // If the article is published and publishedDate is not set, set it to now
        if (article.isPublished && !article.publishedDate) {
          article.publishedDate = new Date();
        }

        // Generate slug from title if not provided
        if (!article.slug) {
          article.slug = article.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        }
      },
      beforeUpdate: (article) => {
        // If the article is being published and publishedDate is not set, set it to now
        if (article.isPublished && !article.publishedDate) {
          article.publishedDate = new Date();
        }
      },
    },
  }
);

export default Article;
