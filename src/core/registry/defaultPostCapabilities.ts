export type PostSkinCapability = {
  documentStatus?: {
    defaultStatus?: string;
    useStatusCounts?: boolean;
  };
};

export const postSkinCapabilities: Record<string, PostSkinCapability> = {};
