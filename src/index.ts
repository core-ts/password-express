import {Request, Response} from 'express';

export interface PasswordReset {
  username: string;
  passcode: string;
  password: string;
}
export interface PasswordChange {
  step?: number;
  username: string;
  passcode?: string;
  currentPassword: string;
  password: string;
}
export interface PasswordService {
  forgot(email: string): Promise<boolean>;
  reset(pass: PasswordReset): Promise<number>;
  change(pass: PasswordChange): Promise<number>;
}
export type Log = (msg: string) => void;
export class PasswordController {
  constructor(public log: Log, public service: PasswordService, public decrypt?: (cipherText: string) => string|undefined) {
    this.change = this.change.bind(this);
    this.reset = this.reset.bind(this);
    this.forgot = this.forgot.bind(this);
  }
  change(req: Request, res: Response) {
    const pass: PasswordChange = req.body;
    if (!pass.username || pass.username.length === 0 || !pass.password || pass.password.length === 0) {
      return res.status(401).end('username and password cannot be empty');
    }
    if (pass.step && pass.step > 1 && (!pass.passcode || pass.passcode.length === 0)) {
      return res.status(401).end('passcode cannot be empty');
    }
    if (this.decrypt) {
      const p = this.decrypt(pass.password);
      if (p === undefined) {
        return res.status(401).end('cannot decrypt new password');
      } else {
        pass.password = p;
      }
      const o = this.decrypt(pass.currentPassword);
      if (o === undefined) {
        return res.status(401).end('cannot decrypt current password');
      } else {
        pass.currentPassword = o;
      }
    }
    this.service.change(pass)
      .then(r => res.status(200).json(r).end())
      .catch(err => handleError(err, res, this.log));
  }
  forgot(req: Request, res: Response) {
    if (req.body == null) {
      return res.status(401).end('body cannot be empty');
    }
    if (typeof req.body !== 'string') {
      return res.status(401).end('body must be a string');
    }
    this.service.forgot(req.body as string)
      .then(r => res.status(200).json(r).end())
      .catch(err => handleError(err, res, this.log));
  }
  reset(req: Request, res: Response) {
    const pass: PasswordReset = req.body;
    if (!pass.username || pass.username.length === 0) {
      return res.status(401).end('username cannot be empty');
    }
    if (!pass.password || pass.password.length === 0) {
      return res.status(401).end('password cannot be empty');
    }
    if (!pass.passcode || pass.passcode.length === 0) {
      return res.status(401).end('passcode cannot be empty');
    }
    if (this.decrypt) {
      const p = this.decrypt(pass.password);
      if (p === undefined) {
        return res.status(401).end('cannot decrypt new password');
      } else {
        pass.password = p;
      }
    }
    this.service.reset(pass)
      .then(r => res.status(200).json(r).end())
      .catch(err => handleError(err, res, this.log));
  }
}
export const PasswordHandler = PasswordController;
export const Handler = PasswordController;
export function handleError(err: any, res: Response, log?: (msg: string) => void) {
  if (log) {
    log(toString(err));
    res.status(500).end('Internal Server Error');
  } else {
    res.status(500).end(toString(err));
  }
}
export function toString(v: any): string {
  return typeof v === 'string' ? v : JSON.stringify(v);
}
