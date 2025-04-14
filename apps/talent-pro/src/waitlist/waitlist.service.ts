import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WaitlistService {
  private brevoContactsApi: brevo.ContactsApi;
  private brevoTransactionalApi: brevo.TransactionalEmailsApi;
  private waitlistEmailTemplate: HandlebarsTemplateDelegate;

  constructor() {
    // Initialize APIs
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

    // Load email template
    this.loadTemplates();
  }

  private loadTemplates() {
    try {
      const templatePath = path.join(__dirname, 'templates/waitlist-email.hbs');
        const templateSource = fs.readFileSync(templatePath, 'utf8');
      this.waitlistEmailTemplate = handlebars.compile(templateSource);
    } catch (error) {
      console.error('Failed to load email templates:', error);
      throw new InternalServerErrorException('Email template configuration failed');
    }
  }

  async isEmailOnWaitlist(email: string): Promise<boolean> {
    try {
      const response = await this.brevoContactsApi.getContactInfo(email);
      const listIds = response.body.listIds;
      return listIds?.includes(2) ?? false;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async addToWaitlist(payload: any) {
    const { email, name } = payload;

    // First check if email is already on waitlist
    const isOnWaitlist = await this.isEmailOnWaitlist(email);

    if (isOnWaitlist) {
      throw new ConflictException('This email is already on the waitlist');
    }

    try {
      // 1. Save to Contacts API (CRM)
      const createContact = new brevo.CreateContact();
      createContact.email = email;
      createContact.listIds = [2]; // Waitlist list ID
      createContact.attributes = { FIRSTNAME: name };
      await this.brevoContactsApi.createContact(createContact);

      // 2. Send confirmation email with template(Transactional API)
      const emailHtml = this.waitlistEmailTemplate({
        name,
        year: new Date().getFullYear(),
      });

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `You're now on Talent Pro Africa's waitlist!`;
      sendSmtpEmail.htmlContent = emailHtml;
      sendSmtpEmail.sender = {
        name: 'Talent Pro Africa',
        email: 'connect@decareerbuilders.com',
      };
        sendSmtpEmail.to = [{ email }];
        
      await this.brevoTransactionalApi.sendTransacEmail(sendSmtpEmail);

      return { success: true, message: 'Added to waitlist successfully' };
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      throw new Error('Failed to add to waitlist');
    }
  }
}
