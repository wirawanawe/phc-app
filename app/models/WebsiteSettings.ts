import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.config";
import { v4 as uuidv4 } from "uuid";

interface WebsiteSettingsAttributes {
  id: string;
  logoUrl: string;
  heroBackgroundUrl: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  mapLocation?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WebsiteSettingsInput
  extends Optional<WebsiteSettingsAttributes, "id"> {}
export interface WebsiteSettingsOutput
  extends Required<WebsiteSettingsAttributes> {}

class WebsiteSettingsModel
  extends Model<WebsiteSettingsAttributes, WebsiteSettingsInput>
  implements WebsiteSettingsAttributes
{
  public id!: string;
  public logoUrl!: string;
  public heroBackgroundUrl!: string;
  public email!: string;
  public phone!: string;
  public whatsapp!: string;
  public address!: string;
  public workingHours!: string;
  public mapLocation!: string;
  public facebook!: string;
  public twitter!: string;
  public instagram!: string;
  public youtube!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WebsiteSettingsModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv4(),
    },
    logoUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "/logo doctorPHC.jpg",
    },
    heroBackgroundUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "/hero-background.jpg",
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "support@phc.com",
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "+62 21 1234 5678",
    },
    whatsapp: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "+6281234567890",
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Jl. Kesehatan No. 123, Jakarta, Indonesia",
    },
    workingHours: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue:
        "Senin - Jumat: 08.00 - 17.00\nSabtu: 09.00 - 15.00\nMinggu: Tutup",
    },
    mapLocation: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126933.56208307289!2d106.7271068502019!3d-6.176921781125624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f436b8c94d63%3A0x6ea6d5398b7c784d!2sJakarta%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1667793998540!5m2!1sid!2sid",
    },
    facebook: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
    twitter: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
    instagram: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
    youtube: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
  },
  {
    sequelize,
    tableName: "website_settings",
    modelName: "WebsiteSettings",
  }
);

export default WebsiteSettingsModel;
