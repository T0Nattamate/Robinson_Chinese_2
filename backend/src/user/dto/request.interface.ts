import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    userId?: string;
    lineId?: string;
    adminId?: string;
    role?: string;
  };
}
