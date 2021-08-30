import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    // tap function helps in logging from an observable.
    // return next.handle().pipe(tap((data) => console.log('After...', data)));

    // This is another function called map of the Observable using which we can update the response data before sending it
    // Here we are wrapping it inside a data key
    return next.handle().pipe(map((data) => ({ data })));
  }
}
