import { Organization } from "./organization/schemas/organization.schema";
import { User } from './auth/schemas/user.schema';


declare global {
  namespace Express {
    interface Request {
      user?: User;
      organization?: Organization;
    }
  }
}

export {};
