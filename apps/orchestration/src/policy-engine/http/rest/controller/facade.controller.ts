import { HttpService } from '@nestjs/axios'
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import { lastValueFrom, map, tap } from 'rxjs'
import { PrismaService } from '../../../../persistence/service/prisma.service'
import { Decision } from '../../../core/type/domain.type'
import { AuthorizationRequestDto } from '../dto/authorization-request.dto'
import { AuthorizationResponseDto } from '../dto/authorization-response.dto'

@Controller('/policy-engine')
export class FacadeController {
  private logger = new Logger(FacadeController.name)

  constructor(private prisma: PrismaService, private http: HttpService) {}

  @Post('/evaluation')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'The authorization evaluation has been successfully processed.',
    type: AuthorizationResponseDto
  })
  evaluate(@Body() evaluation: AuthorizationRequestDto): AuthorizationResponseDto {
    this.logger.log(evaluation)

    return {
      decision: Decision.CONFIRM,
      reasons: [
        {
          code: 'require_approval',
          message: 'Missing one or more approval(s)'
        }
      ]
    }
  }

  @Get('/ping')
  async ping() {
    const cluster = [
      {
        host: 'localhost',
        port: 3010,
        protocol: 'http'
      },
      {
        host: 'localhost',
        port: 3010,
        protocol: 'http'
      }
    ]

    const responses: string[] = []

    for (const { protocol, host, port } of cluster) {
      const url = `${protocol}://${host}:${port}/ping`

      const response = await lastValueFrom(
        this.http.get(url).pipe(
          map((response) => response.data),
          tap((data) =>
            this.logger.log({
              message: 'Received response from node',
              response: data,
              url
            })
          ),
          map((pong) => `${pong} from ${url}`)
        )
      )

      responses.push(response)
    }

    return responses
  }

  // Temporary endpoint to end-to-end test the connectivity with the database.
  @Get('/users')
  justCheckingTheDatabase() {
    return this.prisma.user.findMany()
  }
}
