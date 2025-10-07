import { api } from '../utils/api';

class NotificationService {
  // Send WhatsApp notification
  static async sendWhatsAppNotification(phoneNumber, message) {
    try {
      const response = await api.post('/notifications/whatsapp', {
        phoneNumber,
        message
      });
      return response.data;
    } catch (error) {
      console.error('WhatsApp notification failed:', error);
      // Don't throw error for WhatsApp failures - just log them
      // This prevents WhatsApp issues from breaking the main flow
      return { success: false, error: error.message };
    }
  }

  // Send email notification
  static async sendEmailNotification(email, subject, message) {
    try {
      const response = await api.post('/notifications/email', {
        email,
        subject,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Email notification failed:', error);
      // Don't throw error for email failures - just log them
      // This prevents email issues from breaking the main flow
      return { success: false, error: error.message };
    }
  }

  // Send admin notification for new crew submission
  static async notifyNewCrewSubmission(crewData) {
    try {
      const message = `New crew submission received:
Name: ${crewData.fullName}
Rank: ${crewData.rank}
Nationality: ${crewData.nationality}
Email: ${crewData.email}
Phone: ${crewData.phone}

Please review in the admin panel.`;

      // Send to admin WhatsApp
      const whatsappResult = await this.sendWhatsAppNotification('+1234567890', message);
      
      // Send to admin email
      const emailResult = await this.sendEmailNotification(
        'admin@cfm.com',
        'New Crew Submission - CFM Portal',
        message
      );

      return { 
        success: true, 
        whatsapp: whatsappResult,
        email: emailResult
      };
    } catch (error) {
      console.error('Admin notification failed:', error);
      // Don't throw error - just return failure status
      return { success: false, error: error.message };
    }
  }

  // Send crew confirmation notification
  static async notifyCrewConfirmation(crewData) {
    try {
      const message = `Thank you for your crew registration!
Your application has been received and is under review.

Details:
Name: ${crewData.fullName}
Rank: ${crewData.rank}
Submission Date: ${new Date().toLocaleDateString()}

We will contact you soon with updates.

Best regards,
CFM Team`;

      const result = await this.sendEmailNotification(
        crewData.email,
        'Crew Registration Confirmation - CFM',
        message
      );

      return result;
    } catch (error) {
      console.error('Crew confirmation notification failed:', error);
      // Don't throw error - just return failure status
      return { success: false, error: error.message };
    }
  }

  // Send status update notification to crew
  static async notifyCrewStatusUpdate(crewData, status, adminMessage = '') {
    try {
      let statusMessage = '';
      switch (status) {
        case 'approved':
          statusMessage = 'Congratulations! Your application has been approved and is now visible to our clients.';
          break;
        case 'rejected':
          statusMessage = 'Unfortunately, your application was not approved at this time.';
          break;
        case 'missing_docs':
          statusMessage = 'Your application is missing some required documents. Please check your email for details.';
          break;
        default:
          statusMessage = 'Your application status has been updated.';
      }

      const message = `Status Update - CFM Crew Portal

${statusMessage}

${adminMessage ? `Admin Message: ${adminMessage}` : ''}

Please log in to your account for more details.

Best regards,
CFM Team`;

      await this.sendEmailNotification(
        crewData.email,
        'Application Status Update - CFM',
        message
      );

      return { success: true };
    } catch (error) {
      console.error('Status update notification failed:', error);
      throw error;
    }
  }

  // Send client request notification to admin
  static async notifyClientRequest(requestData) {
    try {
      const message = `New client request received:
Client: ${requestData.client.companyName}
Crew: ${requestData.crew.fullName} (${requestData.crew.rank})
Request Type: ${requestData.requestType}
Urgency: ${requestData.urgency}
Message: ${requestData.message}

Please review and respond in the admin panel.`;

      await this.sendWhatsAppNotification('+1234567890', message);
      await this.sendEmailNotification(
        'admin@cfm.com',
        'New Client Request - CFM Portal',
        message
      );

      return { success: true };
    } catch (error) {
      console.error('Client request notification failed:', error);
      throw error;
    }
  }

  // Send reminder notification
  static async sendReminder(reminderData) {
    try {
      const message = `Reminder: ${reminderData.title}
Description: ${reminderData.description}
Due Date: ${new Date(reminderData.dueDate).toLocaleDateString()}

Please take action as required.

CFM Admin Panel`;

      await this.sendEmailNotification(
        'admin@cfm.com',
        `Reminder: ${reminderData.title}`,
        message
      );

      return { success: true };
    } catch (error) {
      console.error('Reminder notification failed:', error);
      throw error;
    }
  }
}

export default NotificationService;
