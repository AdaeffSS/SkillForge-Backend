import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    console.log('g', request.headers);

    if (!request.user) {
      throw new UnauthorizedException("The user is not authorized");
    }
    return true;
  }
}
