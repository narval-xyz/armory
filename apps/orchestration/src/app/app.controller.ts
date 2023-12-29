import { Body, Controller, Post } from '@nestjs/common';
import { EvaluateDto } from './dto/evaluate.dto';
import { EvaluationDto } from './dto/evaluation.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Post('/evaluate')
  @ApiOkResponse({
    description: 'The transaction has been successfully evaluated',
    type: EvaluationDto,
  })
  evaluate(@Body() evaluate: EvaluateDto): EvaluationDto {
    console.log(evaluate);

    return {
      status: 'permitted',
    };
  }
}
