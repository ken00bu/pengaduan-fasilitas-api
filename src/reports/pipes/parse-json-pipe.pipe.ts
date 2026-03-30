
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseJsonPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    try {
        const Obj = JSON.parse(value)
        return Obj;
    } catch (error) {
        throw new BadRequestException('JSON Format Incorect')
    }
  }
}
