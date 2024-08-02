import { Injectable } from '@nestjs/common';
import { CreateFootPrintDto } from './dto/create-foot-print.dto';
import { UpdateFootPrintDto } from './dto/update-foot-print.dto';

@Injectable()
export class FootPrintsService {
  create(createFootPrintDto: CreateFootPrintDto) {
    console.log({ createFootPrintDto });
    return 'This action adds a new footPrint';
  }

  findAll() {
    return `This action returns all footPrints`;
  }

  findOne(id: number) {
    return `This action returns a #${id} footPrint`;
  }

  update(id: number, updateFootPrintDto: UpdateFootPrintDto) {
    console.log({ updateFootPrintDto });
    return `This action updates a #${id} footPrint`;
  }

  remove(id: number) {
    return `This action removes a #${id} footPrint`;
  }
}
