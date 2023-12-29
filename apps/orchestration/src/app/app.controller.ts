import { Body, Controller, Post } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import { EvaluateDto } from './dto/evaluate.dto'
import { EvaluationDto } from './dto/evaluation.dto'

@Controller()
export class AppController {
  @Post('/evaluate')
  @ApiOkResponse({
    description: 'The transaction has been successfully evaluated',
    type: EvaluationDto
  })
  evaluate(@Body() evaluate: EvaluateDto): EvaluationDto {
    console.log(evaluate)

    return {
      status: 'permitted'
    }
  }
}
