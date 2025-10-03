import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';

const notFound = (req: Request, res: Response) => {
  const route = req.path;

  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    route,
    message: 'Route Not found',
  });
};

export default notFound;
