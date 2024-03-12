import { Model, Schema, Types, model } from "mongoose";

export interface IConfig {
  _id?: Types.ObjectId;
  chatIds: number[];
}

export interface ConfigModel extends Model<IConfig> {}

const configSchema = new Schema<IConfig>({
  chatIds: [
    {
      type: Number,
      required: true,
    },
  ],
});

export const Config = model<IConfig, ConfigModel>("Config", configSchema);
