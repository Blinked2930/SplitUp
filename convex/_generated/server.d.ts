export interface DatabaseReader {
  get(id: any): Promise<any | null>;
  query(tableName: string): any;
}

export interface DatabaseWriter extends DatabaseReader {
  insert(tableName: string, value: any): Promise<any>;
  patch(id: any, value: any): Promise<void>;
  replace(id: any, value: any): Promise<void>;
  delete(id: any): Promise<void>;
}

export interface QueryCtx {
  db: DatabaseReader;
  auth: {
    getUserIdentity: () => Promise<{
      subject: string;
      name?: string;
      email?: string;
      pictureUrl?: string;
      tokenIdentifier: string;
    } | null>;
  };
}

export interface MutationCtx {
  db: DatabaseWriter;
  auth: {
    getUserIdentity: () => Promise<{
      subject: string;
      name?: string;
      email?: string;
      pictureUrl?: string;
      tokenIdentifier: string;
    } | null>;
  };
}

export interface ActionCtx {
  runQuery: (query: any, args?: any) => Promise<any>;
  runMutation: (mutation: any, args?: any) => Promise<any>;
  runAction: (action: any, args?: any) => Promise<any>;
  auth: {
    getUserIdentity: () => Promise<{
      subject: string;
      name?: string;
      email?: string;
      pictureUrl?: string;
      tokenIdentifier: string;
    } | null>;
  };
}

export declare const query: (definition: {
  args?: any;
  handler: (ctx: QueryCtx, args: any) => Promise<any> | any;
}) => any;

export declare const mutation: (definition: {
  args?: any;
  handler: (ctx: MutationCtx, args: any) => Promise<any> | any;
}) => any;

export declare const action: (definition: {
  args?: any;
  handler: (ctx: ActionCtx, args: any) => Promise<any> | any;
}) => any;
