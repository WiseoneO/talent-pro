import { Body, Controller, Post } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';

@ApiTags('WaitList Endpoint')
@Controller('waitlist')
export class WaitlistController {
    constructor(
        private readonly waitlistService: WaitlistService,
    ) { }
    
    @Post('/')
    @ApiOperation({
        summary: 'Add to waitlist',
        description: 'Add a user to the waitlist.',
    })
    async create(@Body() payload: CreateWaitlistDto) { 
        return this.waitlistService.addToWaitlist(payload);
    }
}
