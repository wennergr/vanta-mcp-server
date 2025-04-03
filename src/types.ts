import { AnyZodObject } from "zod";

export interface Tool {
  name: string;
  description: string;
  parameters: AnyZodObject;
}
