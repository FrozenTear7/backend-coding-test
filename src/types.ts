import { Request } from 'express';

export interface RideBody {
  start_lat: number;
  start_long: number;
  end_lat: number;
  end_long: number;
  rider_name: string;
  driver_name: string;
  driver_vehicle: string;
}

export interface CustomRequest<T> extends Request {
  body: T;
}

export interface ResponseError {
  error_code: 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'RIDES_NOT_FOUND_ERROR';
  message: string;
}