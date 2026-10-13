import { ActionResponse } from "@/core/types/actions";

export type { ActionResponse };

export type ActionState<T = any> = ActionResponse<T>;


export interface Attachment {
  id: number;
  uuid: string;
  name: string;      // originalName을 매핑해서 쓸 이름
  size: number;
  path: string;
  mimeType: string;
}
