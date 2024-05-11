import { Request } from 'express';

export interface JwtRequestInterface extends Request {
  jwt?: string;
}