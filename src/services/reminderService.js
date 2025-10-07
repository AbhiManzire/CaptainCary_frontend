import { api } from '../utils/api';
import NotificationService from './notificationService';

class ReminderService {
  // Create a new reminder
  static async createReminder(reminderData) {
    try {
      const response = await api.post('/admin/reminders', reminderData);
      return response.data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  // Get all reminders
  static async getReminders(status = 'all') {
    try {
      const response = await api.get(`/admin/reminders?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  }

  // Update reminder status
  static async updateReminderStatus(reminderId, status) {
    try {
      const response = await api.patch(`/admin/reminders/${reminderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating reminder status:', error);
      throw error;
    }
  }

  // Delete reminder
  static async deleteReminder(reminderId) {
    try {
      const response = await api.delete(`/admin/reminders/${reminderId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }

  // Complete reminder
  static async completeReminder(reminderId) {
    try {
      const response = await api.patch(`/admin/reminders/${reminderId}/complete`);
      
      // Send notification when reminder is completed
      try {
        await NotificationService.sendReminder({
          title: 'Reminder Completed',
          description: 'A reminder has been marked as completed',
          dueDate: new Date()
        });
      } catch (notificationError) {
        console.error('Reminder completion notification failed:', notificationError);
      }

      return response.data;
    } catch (error) {
      console.error('Error completing reminder:', error);
      throw error;
    }
  }

  // Get overdue reminders
  static async getOverdueReminders() {
    try {
      const response = await api.get('/admin/reminders/overdue');
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue reminders:', error);
      throw error;
    }
  }

  // Create crew follow-up reminder
  static async createCrewFollowUpReminder(crewId, followUpDate, notes = '') {
    try {
      const reminderData = {
        title: 'Crew Follow-up Required',
        description: `Follow up with crew member. ${notes}`,
        dueDate: followUpDate,
        priority: 'medium',
        type: 'crew_followup',
        relatedId: crewId,
        status: 'pending'
      };

      const response = await api.post('/admin/reminders', reminderData);
      return response.data;
    } catch (error) {
      console.error('Error creating crew follow-up reminder:', error);
      throw error;
    }
  }

  // Create document expiry reminder
  static async createDocumentExpiryReminder(crewId, documentType, expiryDate) {
    try {
      const reminderData = {
        title: `Document Expiry Alert - ${documentType}`,
        description: `${documentType} document is expiring soon`,
        dueDate: expiryDate,
        priority: 'high',
        type: 'document_expiry',
        relatedId: crewId,
        status: 'pending'
      };

      const response = await api.post('/admin/reminders', reminderData);
      return response.data;
    } catch (error) {
      console.error('Error creating document expiry reminder:', error);
      throw error;
    }
  }

  // Create client follow-up reminder
  static async createClientFollowUpReminder(clientId, followUpDate, notes = '') {
    try {
      const reminderData = {
        title: 'Client Follow-up Required',
        description: `Follow up with client. ${notes}`,
        dueDate: followUpDate,
        priority: 'medium',
        type: 'client_followup',
        relatedId: clientId,
        status: 'pending'
      };

      const response = await api.post('/admin/reminders', reminderData);
      return response.data;
    } catch (error) {
      console.error('Error creating client follow-up reminder:', error);
      throw error;
    }
  }

  // Auto-create reminders for new crew submissions
  static async createAutoRemindersForNewCrew(crewData) {
    try {
      console.log('Creating auto reminders for crew:', crewData);
      
      // Get crew ID from response data
      const crewId = crewData.crewId || crewData._id;
      const crewName = crewData.fullName || 'New Crew Member';
      const crewRank = crewData.rank || 'Unknown Rank';
      
      // Create initial review reminder (due in 2 days)
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() + 2);
      
      await this.createReminder({
        title: 'New Crew Review Required',
        description: `Review new crew submission: ${crewName} (${crewRank})`,
        dueDate: reviewDate,
        priority: 'high',
        type: 'crew_review',
        crewId: crewId,
        status: 'pending'
      });

      // Create document verification reminder (due in 5 days)
      const docVerificationDate = new Date();
      docVerificationDate.setDate(docVerificationDate.getDate() + 5);
      
      await this.createReminder({
        title: 'Document Verification Required',
        description: `Verify documents for: ${crewName}`,
        dueDate: docVerificationDate,
        priority: 'medium',
        type: 'document_verification',
        crewId: crewId,
        status: 'pending'
      });

      console.log('Auto reminders created successfully for crew:', crewId);
      return { success: true };
    } catch (error) {
      console.error('Error creating auto reminders:', error);
      throw error;
    }
  }
}

export default ReminderService;
