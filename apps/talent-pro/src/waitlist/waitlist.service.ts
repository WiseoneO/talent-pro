import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { DatasourceService } from '@ds/datasource';

@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);
  private brevoContactsApi: brevo.ContactsApi;
  private brevoTransactionalApi: brevo.TransactionalEmailsApi;
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(
    private prisma: DatasourceService
  ) {
    this.initializeBrevoApis();
  }

  private initializeBrevoApis() {
    try {
      if (!process.env.BREVO_API_KEY) {
        throw new BadRequestException(
          'BREVO_API_KEY environment variable is not set',
        );
      }

      this.brevoContactsApi = new brevo.ContactsApi();
      this.brevoContactsApi.setApiKey(
        brevo.ContactsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY,
      );

      this.brevoTransactionalApi = new brevo.TransactionalEmailsApi();
      this.brevoTransactionalApi.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY,
      );
    } catch (error) {
      this.logger.error('Failed to initialize Brevo APIs', error.stack);
      throw new InternalServerErrorException(
        'Failed to initialize email service',
      );
    }
  }

  private async loadTemplate(
    templateName: string,
  ): Promise<HandlebarsTemplateDelegate> {
    try {
      if (this.templateCache.has(templateName)) {
        return this.templateCache.get(templateName);
      }

      const templatePath = path.join(
        process.cwd(),
        'apps/talent-pro/src/assets/templates',
        `${templateName}.hbs`,
      );
      if (!fs.existsSync(templatePath)) {
        throw new BadRequestException(
          `Template file not found: ${templatePath}`,
        );
      }

      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      this.templateCache.set(templateName, template);
      return template;
    } catch (error) {
      this.logger.error(
        `Template loading failed: ${templateName}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Email template configuration failed',
      );
    }
  }

  async isEmailOnWaitlist(email: string): Promise<boolean> {
    try {
      const response = await this.brevoContactsApi.getContactInfo(email);
      return response.body.listIds?.includes(2) ?? false;
    } catch (error) {
      if (error) {
        return false;
      }
      this.logger.error(
        `Brevo API error checking email: ${email}`,
        error.response?.body || error.message,
      );
      throw new InternalServerErrorException('Error checking waitlist status');
    }
  }

  async addToBrevoWaitlist(email: string, fullname: string): Promise<void> {
    try {
      const createContact = new brevo.CreateContact();
      createContact.email = email;
      createContact.listIds = [8];
      createContact.attributes = { FIRSTNAME: fullname };

      await this.brevoContactsApi.createContact(createContact);
    } catch (error) {
      this.logger.error(`Brevo API error adding contact: ${email}`, {
        error: error.response?.body || error.message,
        statusCode: error.response?.status,
      });

      // Handle specific Brevo error cases
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid contact data sent to Brevo');
      }
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid Brevo API credentials');
      }
      if (error.response?.status === 429) {
        throw new BadRequestException('Too many requests to Brevo API');
      }

      throw new InternalServerErrorException('Failed to add to Brevo waitlist');
    }
  }

  async addToWaitlist(payload: { email: string; fullname: string }) {
    const { email, fullname } = payload;

    try {
      // Check existing records in parallel
      const [isInDatabase, isOnBrevoWaitlist, count] = await Promise.all([
        this.prisma.waitlist.findUnique({ where: { email } }),
        this.isEmailOnWaitlist(email),
        this.prisma.waitlist.count(),
      ]);

      if (isInDatabase || isOnBrevoWaitlist) {
        return new ConflictException('This email is already on the waitlist');
      }

      // Save to database first (more reliable)
      await this.prisma.waitlist.create({
        data: {
          email: email,
          fullname: fullname,
        },
      });

      // Then add to Brevo
      await this.addToBrevoWaitlist(email, fullname);

      // Load templates
      const [userTemplate, adminTemplate] = await Promise.all([
        this.loadTemplate('waitlist-email'),
        this.loadTemplate('waitlist-admin-notification'),
      ]);

      // Send emails
      await Promise.all([
        this.sendEmail({
          template: userTemplate,
          email,
          context: { fullname },
          subject: `You're now on Talent Pro Africa's waitlist!`,
        }),
        this.sendEmail({
          template: adminTemplate,
          email: 'ogboroge@talentpro.africa',
          context: {
            fullname,
            email,
            count: count + 1,
          },
          subject: 'New Waitlist Signup',
        }),
      ]);

      return {
        success: true,
        message: 'Added to waitlist successfully',
        count: count + 1,
      };
    } catch (error) {
      this.logger.error(`Error adding ${email} to waitlist`);

      // If we failed after creating the DB record but before Brevo,
      // we might want to delete the DB record to maintain consistency
      if (error instanceof ConflictException) {
        throw error; // Already handled
      }

      throw new InternalServerErrorException('Failed to add to waitlist');
    }
  }

  private async sendEmail(params: {
    template: HandlebarsTemplateDelegate;
    email: string;
    context: any;
    subject: string;
  }) {
    try {
      const { template, email, context, subject } = params;
      const emailHtml = template(context);

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = emailHtml;
      sendSmtpEmail.sender = {
        name: 'Talent Pro Africa',
        email: 'connect@decareerbuilders.com',
      };
      sendSmtpEmail.to = [{ email }];

      await this.brevoTransactionalApi.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      this.logger.error(`Failed to send email to ${params.email}`, {
        error: error.response?.body || error.message,
        subject: params.subject,
      });
      throw new InternalServerErrorException(
        'Failed to send confirmation email',
      );
    }
  }
}
