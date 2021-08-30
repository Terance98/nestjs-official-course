import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// createParamDecorator is usually used to create custom decorators that can extract input parameters information from the request object
export const Protocol = createParamDecorator(
  (defualtValue: string, ctx: ExecutionContext) => {
    console.log({ defualtValue });
    const request = ctx.switchToHttp().getRequest();
    return request.protocol;
  },
);
